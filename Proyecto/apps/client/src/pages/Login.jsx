
import { useState } from "react"
import { api } from "../utils/api"

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" })
  const [msg, setMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: form,
      })
      
      onLogin?.()
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl mb-4">Iniciar sesión</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded"
        >
          Entrar
        </button>
      </form>

      {msg && <p className="mt-4 text-red-400">{msg}</p>}
    </div>
  )
}
