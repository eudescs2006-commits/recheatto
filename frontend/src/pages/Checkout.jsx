import React,{useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Checkout(){
  const [customer, setCustomer] = useState({name:'',whatsapp:'',address:''})
  const [items, setItems] = useState([{productId:1,qty:1,price:24.9}])
  const [region, setRegion] = useState('')
  const navigate = useNavigate()
  const API = import.meta.env.VITE_API_URL || ''

  async function handleSubmit(e){
    e.preventDefault()
    try{
      const res = await axios.post(API + '/api/checkout', { customer, items, regionName: region })
      // if MP returns init_point, redirect to it
      if(res.data.init_point){
        window.location.href = res.data.init_point
      } else {
        // order created without MP - show orderNumber
        alert('Pedido criado: ' + res.data.orderNumber)
        navigate('/pedido/' + res.data.orderNumber)
      }
    }catch(err){
      console.error(err)
      alert('Erro ao criar pedido')
    }
  }

  return (
    <div className="form">
      <h2 style={{color:'#FFB703'}}>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome</label>
        <input className="input" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} required />
        <label>WhatsApp</label>
        <input className="input" value={customer.whatsapp} onChange={e=>setCustomer({...customer,whatsapp:e.target.value})} required />
        <label>Endereço</label>
        <textarea className="input" value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})} required />
        <label>Região</label>
        <select className="input" value={region} onChange={e=>setRegion(e.target.value)} required>
          <option value="">Selecione...</option>
          <option value="gratis">Frete Grátis</option>
          <option value="centro">Centro</option>
          <option value="norte">Zona Norte</option>
          <option value="sul">Zona Sul</option>
        </select>

        <div style={{marginTop:12}}>
          <button className="btn">Finalizar Pagamento</button>
        </div>
      </form>
    </div>
  )
}
