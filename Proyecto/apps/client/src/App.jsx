import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import User from './pages/User'
import Simulator from './pages/Simulator'
import StatusBadge from './components/StatusBadge'

export default function App() {
  return (
    <div style={{minHeight:'100vh',display:'grid',gridTemplateRows:'auto 1fr'}}>
      <header style={{borderBottom:'1px solid #e5e7eb',background:'#0f172a',color:'#fff'}}>
        <div style={{maxWidth:1040,margin:'0 auto',padding:'12px 16px',display:'flex',gap:16,alignItems:'center'}}>
          <h1 style={{margin:0,fontSize:18}}>Préstamos — Banco</h1>
          <StatusBadge />
          <div style={{marginLeft:'auto'}} />
          <NavBar />
        </div>
      </header>
      <main style={{maxWidth:1040,margin:'0 auto',padding:'20px 16px'}}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/usuario" element={<User />} />
          <Route path="/simulador" element={<Simulator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
