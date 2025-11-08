import React, {useEffect,useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Cardapio(){
  const [produtos,setProdutos] = useState([])
  const navigate = useNavigate()

  useEffect(()=>{ fetchProducts() },[])

  async function fetchProducts(){
    try{
      const res = await axios.get((import.meta.env.VITE_API_URL || '') + '/api/admin/products')
      setProdutos(res.data)
    }catch(e){
      console.error(e)
      // fallback: sample products
      setProdutos([
        {id:1,name:'Batata Clássica',description:'Frango, catupiry e bacon',price:24.9},
        {id:2,name:'Batata Vegetariana',description:'Legumes e queijo',price:23.0}
      ])
    }
  }

  return (
    <div>
      <h2 style={{padding:'24px',color:'#FFB703'}}>Cardápio</h2>
      <div className="card-grid">
        {produtos.map(p=>(
          <div className="card" key={p.id}>
            <div style={{height:150,background:'#111',borderRadius:8,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#666'}}>{p.imageUrl? <img src={p.imageUrl} alt={p.name} style={{maxWidth:'100%',maxHeight:'100%',borderRadius:8}}/> : 'Imagem'}</div>
            <h3>{p.name}</h3>
            <p style={{color:'#bbb'}}>{p.description}</p>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
              <strong style={{color:'#FFB703'}}>R$ {p.price?.toFixed(2)}</strong>
              <button className="btn" onClick={()=>navigate('/checkout')}>Pedir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
