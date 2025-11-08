Frontend integration examples (fetch):

// Create checkout
fetch('/api/checkout', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({
    customer: { name, whatsapp, address },
    items: [{ productId: 1, qty: 1, price: 24.9 }],
    regionName: 'centro'
  })
})

// Track order with Socket.IO (client)
import { io } from 'socket.io-client';
const socket = io('https://SEU_BACKEND_URL');
socket.emit('joinOrder', 1023);
socket.on('orderUpdate', data => { console.log('update', data); });

