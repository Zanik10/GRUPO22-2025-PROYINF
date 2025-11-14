import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import User from './pages/User'
import Simulator from './pages/Simulator'
import StatusBadge from './components/StatusBadge'
import LoanVerify from "./pages/LoanVerify.jsx";

// 👇 NUEVO: importa las páginas de auth
import Register from './pages/Register'
import Login from './pages/Login'

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      width: '100%'
    }}>
      <header style={{
        borderBottom: '1px solid #e5e7eb',
        background: '#0f172a',
        color: '#fff',
        width: '100%'
      }}>
        <div style={{
          maxWidth: '1400px', 
          width: '100%',
          margin: '0 auto',
          padding: '12px 5%',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>Préstamos — Banco</h1>
          <StatusBadge />
          <div style={{ marginLeft: 'auto' }} />
          <NavBar />
        </div>
      </header>
      
      <main style={{
        width: '100%',
        margin: '0 auto',
        padding: '20px 5%',
        boxSizing: 'border-box'
      }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/usuario" element={<User />} />
          <Route path="/simulador" element={<Simulator />} />

          {/* 👇 NUEVO: rutas de autenticación */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={() => (location.href = '/')} />} />
          <Route path="/loan/verify" element={<LoanVerify />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
