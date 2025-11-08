import { useEffect, useState } from 'react'

export default function StatusBadge() {
  const [status, setStatus] = useState({ api:false, db:false, loading:true })

  useEffect(() => {
    const url = `${import.meta.env.VITE_API_URL}/api/health/db`;
    fetch(url)
      .then(r => r.json())
      .then(d => setStatus({ api: d.api === 'ok', db: !!d.db, loading:false }))
      .catch(() => setStatus({ api:false, db:false, loading:false }))
  }, [])

  const ok = status.api && status.db
  const bg = status.loading ? '#fbbf24' : ok ? '#22c55e' : '#ef4444'
  const label = status.loading ? 'Comprobando' : ok ? 'API/DB OK' : 'API/DB OFF'

  return (
    <span style={{
      marginLeft: 8,
      background: bg,
      color: '#0f172a',
      fontWeight: 700,
      padding: '4px 8px',
      borderRadius: 999
    }}>
      {label}
    </span>
  )
}
