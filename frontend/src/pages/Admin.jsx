import React, {useState, useEffect} from 'react'
import axios from 'axios'

export default function Admin(){
  const API = import.meta.env.VITE_API_URL || ''
  const [token, setToken] = useState(localStorage.getItem('recheatto_token')||'')
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({name:'',description:'',price:'',image:null})

  useEffect(()=>{ if(token) fetchProducts() },[token])

  async function login(e){
    e.preventDefault()
    try{
      const res = await axios.post(API + '/api/admin/login',{user:'admin',pass:'senha123'})
      setToken(res.data.token)
      localStorage.setItem('recheatto_token', res.data.token)
      fetchProducts()
    }catch(e){ alert('Erro login') }
  }

  async function fetchProducts(){
    try{
      const res = await axios.get(API + '/api/admin/products',{ headers: { Authorization: 'Bearer ' + token }})
      setProducts(res.data)
    }catch(e){ console.error(e) }
  }

  async function handleAdd(e){
    e.preventDefault()
    try{
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('description', form.description)
      fd.append('price', form.price)
      if(form.image) fd.append('image', form.image)
      const res = await axios.post(API + '/api/admin/products', fd, { headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/form-data' }})
      alert('Produto adicionado')
      setForm({name:'',description:'',price:'',image:null})
      fetchProducts()
    }catch(err){
      console.error(err)
      alert('Erro ao adicionar')
    }
  }

  function handleFile(e){
    setForm({...form, image: e.target.files[0]})
  }

  return (
    <div style={{padding:24}}>
      {!token ? (
        <form onSubmit={login} className="form">
          <h3 style={{color:'#FFB703'}}>Login Admin</h3>
          <input className="input" placeholder="user"/>
          <input className="input" placeholder="pass"/>
          <button className="btn">Entrar</button>
        </form>
      ) : (
        <div>
          <h3 style={{color:'#FFB703'}}>Gerenciar Produtos</h3>
          <form onSubmit={handleAdd} className="form" encType="multipart/form-data">
            <input className="input" placeholder="Nome" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
            <input className="input" placeholder="Descrição" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
            <input className="input" placeholder="Preço" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required/>
            <input type="file" onChange={handleFile} />
            <div style={{marginTop:12}}><button className="btn">Adicionar Produto</button></div>
          </form>

          <h4 style={{marginTop:18}}>Produtos</h4>
          <ul>
            {products.map(p=>(
              <li key={p.id} style={{marginBottom:8}}>
                <strong>{p.name}</strong> - R$ {p.price}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
