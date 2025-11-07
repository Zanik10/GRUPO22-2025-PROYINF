import { useState } from 'react'
import { api } from '../utils/api'

export default function Register() {
  const [form, setForm] = useState({ fullName:'', email:'', password:'' })
  const [msg, setMsg] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    try {
      await api('/api/auth/register', { method:'POST', body: form })
      setMsg('Cuenta creada. Ahora puedes ir al Dashboard.')
    } catch (e) { setMsg(e.message) }
  }

  return (
    <div className="p-6 max-w-sm">
      <h1>Crear cuenta</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input placeholder="Nombre (opcional)" value={form.fullName}
               onChange={e=>setForm(f=>({...f, fullName: e.target.value}))}/>
        <input placeholder="Email" value={form.email}
               onChange={e=>setForm(f=>({...f, email: e.target.value}))}/>
        <input type="password" placeholder="Contraseña (min 8)" value={form.password}
               onChange={e=>setForm(f=>({...f, password: e.target.value}))}/>
        <button>Registrarme</button>
      </form>
      {msg && <p style={{marginTop:12}}>{msg}</p>}
    </div>
  )
}
