import { NavLink } from 'react-router-dom'

const linkStyle = ({ isActive }) => ({
    padding: '8px 10px',
    borderRadius: 8,
    textDecoration: 'none',
    color: isActive ? '#0f172a' : '#e2e8f0',
    background: isActive ? '#e2e8f0' : 'transparent',
    fontWeight: 600
})

export default function NavBar() {
    return (
        <nav style={{ display:'flex', gap:8 }}>
        <NavLink to="/" style={linkStyle}>Inicio</NavLink>
        <NavLink to="/usuario" style={linkStyle}>Login</NavLink>
        <NavLink to="/register" style={linkStyle}>Registro</NavLink>
        <NavLink to="/simulador" style={linkStyle}>Simulador</NavLink>
        </nav>
    )
}
