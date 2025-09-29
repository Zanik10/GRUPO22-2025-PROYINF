export default function Dashboard() {
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
