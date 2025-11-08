import React, {useEffect,useState} from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'

export default function OrderTrack(){
  const { orderNumber } = useParams()
  const [status, setStatus] = useState('Pendente')
  const [progress, setProgress] = useState(20)
  useEffect(()=>{
    const socket = io(import.meta.env.VITE_API_URL || '')
    socket.emit('joinOrder', Number(orderNumber))
    socket.on('orderUpdate', data => {
      if(data.orderNumber === Number(orderNumber)){
        setStatus(data.status)
        if(data.status === 'Em preparo') setProgress(50)
        if(data.status === 'Saiu para entrega') setProgress(85)
        if(data.status === 'Entregue') setProgress(100)
      }
    })
    return ()=> socket.disconnect()
  },[orderNumber])
  return (
    <div style={{padding:24}}>
      <h2 style={{color:'#FFB703'}}>Pedido #{orderNumber}</h2>
      <p style={{color:'#ccc'}}>Status: {status}</p>
      <div className="progress" style={{maxWidth:600,marginTop:12}}>
        <span style={{width:progress + '%'}}></span>
      </div>
    </div>
  )
}
