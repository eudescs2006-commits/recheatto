require('dotenv').config();
const express = require('express');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const { Server } = require('socket.io');
const axios = require('axios');

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Socket.IO: rooms per orderNumber
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('joinOrder', (orderNumber) => {
    socket.join(`order:${orderNumber}`);
  });
  socket.on('leaveOrder', (orderNumber) => {
    socket.leave(`order:${orderNumber}`);
  });
});

// Basic health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// --- Checkout: create order and create MercadoPago preference (simplified)
app.post('/api/checkout', async (req, res) => {
  try {
    const { customer, items, regionName } = req.body;
    if (!customer || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // 1) create or find customer by whatsapp
    let customerRec = await prisma.customer.findFirst({ where: { whatsapp: customer.whatsapp }});
    if (!customerRec) {
      customerRec = await prisma.customer.create({
        data: { name: customer.name, whatsapp: customer.whatsapp, address: customer.address }
      });
    }

    // 2) compute totals
    let subtotal = 0;
    for (const it of items) {
      const prod = await prisma.product.findUnique({ where: { id: it.productId }});
      if (!prod) return res.status(400).json({ error: 'Produto não encontrado: ' + it.productId });
      subtotal += prod.price * it.qty;
    }

    // 3) freight
    const region = await prisma.region.findUnique({ where: { name: regionName }});
    const freight = region ? region.fee : 0;
    const grandTotal = parseFloat((subtotal + freight).toFixed(2));

    // 4) generate orderNumber (simple)
    const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: 'desc' }});
    const orderNumber = (lastOrder?.orderNumber || 1000) + 1;

    // 5) create order and items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customerRec.id,
        total: grandTotal,
        freight,
        status: 'Pendente',
        items: {
          create: items.map(it => ({ productId: it.productId, qty: it.qty, price: it.price }))
        }
      },
      include: { items: true }
    });

    // 6) create Mercado Pago preference (simplified)
    // Use environment variable MP_ACCESS_TOKEN
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
      // return order info to frontend so you can implement manual flow or test
      return res.json({ orderNumber, orderId: order.id, message: 'MP_ACCESS_TOKEN not configured. Order created in DB.' });
    }

    const mpBody = {
      items: [{ title: `Pedido Recheatto #${orderNumber}`, quantity: 1, currency_id: 'BRL', unit_price: grandTotal }],
      external_reference: String(order.id),
      back_urls: { success: process.env.BACK_URL || '', failure: process.env.BACK_URL || '' },
      notification_url: (process.env.BACK_URL || '') + '/api/webhook/mercadopago'
    };

    const mpRes = await axios.post('https://api.mercadopago.com/checkout/preferences', mpBody, {
      headers: { Authorization: `Bearer ${mpToken}` }
    });

    await prisma.order.update({ where: { id: order.id }, data: { paymentId: mpRes.data.id }});

    return res.json({ orderNumber, orderId: order.id, mpPreferenceId: mpRes.data.id, init_point: mpRes.data.init_point });
  } catch (err) {
    console.error(err.response?.data || err.message || err);
    return res.status(500).json({ error: 'Erro no checkout' });
  }
});

// --- Webhook: Mercado Pago notifications (simplified)
app.post('/api/webhook/mercadopago', async (req, res) => {
  try {
    const dataId = req.body?.data?.id || req.query?.data_id || req.body?.id;
    if (!dataId) return res.status(400).send('No data id');

    // fetch payment info
    const mpToken = process.env.MP_ACCESS_TOKEN;
    const mpPay = await axios.get(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { Authorization: `Bearer ${mpToken}` }
    });
    const payment = mpPay.data;

    // external_reference contains our order.id (if set)
    const orderId = payment.external_reference;
    if (!orderId) {
      return res.json({ received: true, note: 'no external_reference' });
    }

    // update order
    const status = payment.status;
    const newStatus = status === 'approved' ? 'Em preparo' : 'Pendente';
    await prisma.order.update({ where: { id: Number(orderId) }, data: { paymentStatus: status, status: newStatus }});

    // notify via socket by orderNumber
    const order = await prisma.order.findUnique({ where: { id: Number(orderId) }});
    if (order) {
      io.to(`order:${order.orderNumber}`).emit('orderUpdate', { orderNumber: order.orderNumber, status: newStatus });
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('webhook error', err.response?.data || err.message);
    return res.status(500).send('error');
  }
});

// --- Admin routes (minimal) ---
const jwt = require('jsonwebtoken');
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('No token');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).send('Invalid token');
  }
}

app.post('/api/admin/login', async (req, res) => {
  const { user, pass } = req.body;
  // Simple hardcoded stub (replace with real admin table in production)
  if (user === 'admin' && pass === 'senha123') {
    const token = jwt.sign({ user }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Credenciais inválidas' });
});

app.get('/api/admin/orders', auth, async (req, res) => {
  const orders = await prisma.order.findMany({ include: { customer: true, items: true }, orderBy: { createdAt: 'desc' }});
  res.json(orders);
});

app.patch('/api/admin/orders/:id/status', auth, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const order = await prisma.order.update({ where: { id }, data: { status }});
  // notify clients via socket
  io.to(`order:${order.orderNumber}`).emit('orderUpdate', { orderNumber: order.orderNumber, status });
  res.json(order);
});

// Admin product endpoints
app.get('/api/admin/products', auth, async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }});
  res.json(products);
});

app.post('/api/admin/products', auth, async (req, res) => {
  const { name, description, price, imageUrl } = req.body;
  const prod = await prisma.product.create({ data: { name, description, price: Number(price), imageUrl }});
  res.json(prod);
});

// --- Start server
server.listen(PORT, () => {
  console.log(`Recheatto backend listening on port ${PORT}`);
});
