import { useMemo, useState } from 'react'
import { amortizationSchedule } from '../utils/loanMath'

export default function Simulator() {
  const [monto, setMonto] = useState(1000000)
  const [tasa, setTasa] = useState(18)
  const [meses, setMeses] = useState(36)

  const result = useMemo(() => {
    const M = Number(monto) || 0
    const T = Number(tasa) || 0
    const N = Math.max(1, Number(meses) || 1)
    return amortizationSchedule(M, T, N)
  }, [monto, tasa, meses])

  return (
    <section
      style={{
        width: '100%', 
        margin: '0 auto',       
        padding: '32px 5%', 
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}
    >
    
      <h2 style={{ fontSize: 26, margin: '0 0 14px', textAlign: 'center' }}>
        Simulador de Préstamos
      </h2>

      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        }}
      >
        <Field label="Monto (CLP)">
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            style={inputStyle}
          />
        </Field>
        <Field label="Tasa anual (%)">
          <input
            type="number"
            step="0.01"
            value={tasa}
            onChange={(e) => setTasa(e.target.value)}
            style={inputStyle}
          />
        </Field>
        <Field label="Plazo (meses)">
          <input
            type="number"
            value={meses}
            onChange={(e) => setMeses(e.target.value)}
            style={inputStyle}
          />
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Stat label="Cuota estimada" value={`$${formatCLP(result.cuota)}`} />
        <Stat label="Interés total" value={`$${formatCLP(result.totalInteres)}`} />
        <Stat label="Cuotas" value={`${meses}`} />
      </div>

      <div
        style={{
          marginTop: 16,
          overflow: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              <Th>#</Th>
              <Th>Cuota</Th>
              <Th>Interés</Th>
              <Th>Abono</Th>
              <Th>Saldo</Th>
            </tr>
          </thead>
          <tbody>
            {result.filas.slice(0, 120).map((row) => (
              <tr key={row.n}>
                <Td>{row.n}</Td>
                <Td>${formatCLP(row.cuota)}</Td>
                <Td>${formatCLP(row.interes)}</Td>
                <Td>${formatCLP(row.abono)}</Td>
                <Td>${formatCLP(row.saldo)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ color: '#64748b', textAlign: 'center' }}>
        Mostrando hasta 120 filas por simplicidad. (Luego lo podemos paginar/exportar.)
      </p>
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button
          onClick={() => window.location.href = "http://localhost:4000/api/loan/verify"}
          style={{
            padding: "12px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Solicitar Préstamo
        </button>
      </div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: 6,
      width: '100%'
    }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ 
      padding: 16,
      border: '1px solid #e2e8f0', 
      borderRadius: 12, 
      minWidth: 200, 
      background: '#f8fafc',
      flex: '1 1 auto',
      textAlign: 'center' 
    }}>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#000000' }}>{value}</div>
    </div>
  )
}
const inputStyle = { padding:10, border:'1px solid #cbd5e1', borderRadius:8 }
const Th = ({ children }) => <th style={{ textAlign:'left', padding:10, fontSize:12, color:'#334155', borderBottom:'1px solid #e2e8f0' }}>{children}</th>
const Td = ({ children }) => <td style={{ padding:10, borderBottom:'1px solid #f1f5f9', fontVariantNumeric:'tabular-nums' }}>{children}</td>

function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(n ?? 0)
}
