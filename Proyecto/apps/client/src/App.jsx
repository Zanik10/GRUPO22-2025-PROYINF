// src/App.jsx
import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import User from './pages/User'
import Simulator from './pages/Simulator'
import StatusBadge from './components/StatusBadge'
import Register from './pages/Register'
import Login from './pages/Login'
import { api } from './utils/api'

export default function App() {
  const [auth, setAuth] = useState({ status: 'loading', user: null })

  // Al cargar la app, preguntamos quién está logueado
  useEffect(() => {
    api('/api/auth/me')
      .then(data => {
        setAuth({ status: 'ready', user: data })
      })
      .catch(() => {
        setAuth({ status: 'ready', user: null })
      })
  }, [])

  if (auth.status === 'loading') {
    return <div style={{ padding: 20, color: '#e5e7eb' }}>Cargando...</div>
  }

  const handleLogin = async () => {
    try {
      const me = await api('/api/auth/me')
      setAuth({ status: 'ready', user: me })
      window.location.href = '/'
    } catch {
      // si falla, no hacemos nada especial
    }
  }

  const handleLogout = async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } catch {
      // aunque falle, limpiamos el estado local
    }
    setAuth({ status: 'ready', user: null })
    window.location.href = '/login'
  }

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
          {/* NavBar recibe usuario y onLogout */}
          <NavBar user={auth.user} onLogout={handleLogout} />
        </div>
      </header>

      <main style={{
        width: '100%',
        margin: '0 auto',
        padding: '20px 5%',
        boxSizing: 'border-box'
      }}>
        <Routes>
          {/* Si hay usuario → Dashboard, si no → Login */}
          <Route
            path="/"
            element={
              auth.user ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />

          {/* Páginas internas protegidas */}
          <Route
            path="/usuario"
            element={
              auth.user ? <User /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/simulador"
            element={
              auth.user ? <Simulator /> : <Navigate to="/login" replace />
            }
          />

          {/* Auth */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
