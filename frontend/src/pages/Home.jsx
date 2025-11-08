import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <section style={{padding:24}}>
      <h1 style={{fontSize:32,color:'#FFB703'}}>Sabor artesanal com toque moderno</h1>
      <p style={{color:'#ccc'}}>Peça online e acompanhe seu pedido em tempo real.</p>
      <div style={{marginTop:18}}>
        <Link to="/cardapio" className="btn">Ver Cardápio</Link>
      </div>
    </section>
  )
}
