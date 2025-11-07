import { useState } from 'react'
import { api } from '../utils/api'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email:'', password:'' })
  const [msg, setMsg] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    try {
      await api('/api/auth/login', { method:'POST', body: form })
      onLogin?.()
    } catch (e) { setMsg(e.message) }
  }

  return (
    <div className="p-6 max-w-sm">
      <h1>Iniciar sesión</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input placeholder="Email" value={form.email}
               onChange={e=>setForm(f=>({...f, email: e.target.value}))}/>
        <input type="password" placeholder="Contraseña" value={form.password}
               onChange={e=>setForm(f=>({...f, password: e.target.value}))}/>
        <button>Entrar</button>
      </form>
      {msg && <p style={{marginTop:12}}>{msg}</p>}
    </div>
  )
}
