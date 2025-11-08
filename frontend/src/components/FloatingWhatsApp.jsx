import React from 'react'

export default function FloatingWhatsApp({phone, message}){
  const href = `https://wa.me/${phone.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(message)}`
  return (
    <a className="whatsapp-float" href={href} target="_blank" rel="noreferrer">WhatsApp</a>
  )
}
