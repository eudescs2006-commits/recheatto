import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Cardapio from './pages/Cardapio'
import Checkout from './pages/Checkout'
import OrderTrack from './pages/OrderTrack'
import Admin from './pages/Admin'
import FloatingWhatsApp from './components/FloatingWhatsApp'

export default function App(){
  return (
    <div className="app-root">
      <nav className="nav">
        <div className="brand">Recheatto</div>
        <div className="links">
          <Link to="/">Home</Link>
          <Link to="/cardapio">Cardápio</Link>
          <Link to="/checkout">Checkout</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/cardapio" element={<Cardapio/>} />
          <Route path="/checkout" element={<Checkout/>} />
          <Route path="/pedido/:orderNumber" element={<OrderTrack/>} />
          <Route path="/admin" element={<Admin/>} />
        </Routes>
      </main>

      <FloatingWhatsApp phone="+55 21 973549289" message="Olá! Quero fazer um pedido no Recheatto." />
      <footer className="footer">© {new Date().getFullYear()} Recheatto</footer>
    </div>
  )
}
