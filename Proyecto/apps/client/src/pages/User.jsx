import { useState } from 'react'

export default function User() {
  const [form, setForm] = useState({
    rut: '',
    nombre: '',
    ingresosMensuales: '',
    email: ''
  })

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  return (
    <section style={{ maxWidth:640 }}>
      <h2 style={{ fontSize:22, margin:'0 0 14px' }}>Usuario</h2>
      <div style={{ display:'grid', gap:12 }}>
        <Field label="RUT" name="rut" value={form.rut} onChange={handle} placeholder="12.345.678-9" />
        <Field label="Nombre" name="nombre" value={form.nombre} onChange={handle} placeholder="Juan Pérez" />
        <Field label="Ingresos mensuales" name="ingresosMensuales" value={form.ingresosMensuales} onChange={handle} placeholder="800000" type="number" />
        <Field label="Email" name="email" value={form.email} onChange={handle} placeholder="juan@correo.cl" type="email" />
      </div>

      <pre style={previewBox}>
{JSON.stringify(form, null, 2)}
      </pre>
    </section>
  )
}

function Field({ label, ...rest }) {
  return (
    <label style={{ display:'grid', gap:6 }}>
      <span style={{ fontWeight:600 }}>{label}</span>
      <input {...rest} style={inputStyle} />
    </label>
  )
}
const inputStyle = { padding:10, border:'1px solid #cbd5e1', borderRadius:8 }
const previewBox = { marginTop:16, background:'#0f172a', color:'#e2e8f0', padding:12, borderRadius:8, overflow:'auto' }