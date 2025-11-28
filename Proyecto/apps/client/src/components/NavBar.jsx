import { Link, useLocation } from 'react-router-dom'

export default function NavBar({ user, onLogout }) {
  const location = useLocation()

  const linkStyle = (path) => ({
    padding: '6px 10px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
    color: location.pathname === path ? '#e5e7eb' : '#cbd5f5',
    background: location.pathname === path ? '#1f2937' : 'transparent',
  })

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Links principales */}
      <Link to="/" style={linkStyle('/')}>Dashboard</Link>
      <Link to="/simulador" style={linkStyle('/simulador')}>Simulador</Link>
      <Link to="/solicitudes" style={linkStyle('/solicitudes')}>Solicitudes</Link>

      {/* Separador y zona derecha */}
      <div style={{
        marginLeft: 16,
        borderLeft: '1px solid #334155',
        paddingLeft: 12,
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }}>
        {user ? (
          <>
            <span style={{ fontSize: 13, color: '#e5e7eb' }}>
              {user.email}
            </span>

            {/* Link a Mi perfil */}
            <Link to="/perfil" style={linkStyle('/perfil')}>
              Mi perfil
            </Link>

            {/* Botón salir */}
            <button
              type="button"
              onClick={onLogout}
              style={{
                padding: '4px 10px',
                fontSize: 13,
                borderRadius: 999,
                border: '1px solid #e5e7eb',
                background: 'transparent',
                color: '#e5e7eb',
                cursor: 'pointer'
              }}
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle('/login')}>Login</Link>
            <Link to="/register" style={linkStyle('/register')}>Registro</Link>
          </>
        )}
      </div>
    </nav>
  )
}
