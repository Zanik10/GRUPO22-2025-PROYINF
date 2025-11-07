import { useEffect, useState } from 'react'
import { api } from '../utils/api'

export default function Dashboard() {
  const [accounts, setAccounts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api('/api/accounts/me')
      setAccounts(data.accounts)
    } catch (e) {
      setError(e.message || 'Error al cargar cuentas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <section style={{ display:'grid', gap:16 }}>
      <h2 style={{ fontSize:22, margin:0 }}>Panel</h2>
      <p style={{ color:'#475569' }}>
        Bienvenido. Desde aquí podrás administrar usuarios y simular préstamos.
      </p>

      <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <a href="#/usuario" style={cardStyle}>Sección Usuario →</a>
        <a href="#/simulador" style={cardStyle}>Simulador de Préstamos →</a>
      </div>

      {/* --- NUEVO: Mis cuentas / Saldo disponible --- */}
      <div style={{ marginTop:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <h3 style={{ margin:'8px 0' }}>Mis cuentas</h3>
          <button onClick={load} style={btnStyle}>Actualizar</button>
        </div>

        {loading && <p style={{ color:'#475569' }}>Cargando cuentas…</p>}
        {error && <p style={{ color:'#b91c1c' }}>Error: {error}</p>}

        {!loading && !error && (
          accounts?.length ? (
            <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {accounts.map(a => (
                <div key={a.id} style={acctCard}>
                  <div style={{ fontWeight:700, color:'#0f172a' }}>
                    {a.type} · {a.currency}
                  </div>
                  <div style={{ fontSize:14, color:'#475569' }}>ID: {a.id}</div>
                  <div style={{ marginTop:8, fontSize:18 }}>
                    Saldo disponible:{' '}
                    <b>${formatCLP(a.availableBalance)}</b>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color:'#475569' }}>Aún no tienes cuentas.</p>
          )
        )}
      </div>
    </section>
  )
}

const cardStyle = {
  display:'block',
  padding:16,
  background:'#f8fafc',
  border:'1px solid #e2e8f0',
  borderRadius:12,
  fontWeight:600,
  color:'#0f172a',
  textDecoration:'none'
}

const acctCard = {
  padding:16,
  background:'#ffffff',
  border:'1px solid #e2e8f0',
  borderRadius:12,
  boxShadow:'0 1px 2px rgba(0,0,0,0.03)'
}

const btnStyle = {
  padding:'6px 10px',
  border:'1px solid #cbd5e1',
  borderRadius:8,
  background:'#f8fafc',
  cursor:'pointer'
}

function formatCLP(n) {
  try { return Number(n).toLocaleString('es-CL', { minimumFractionDigits: 0 }) }
  catch { return n }
}
