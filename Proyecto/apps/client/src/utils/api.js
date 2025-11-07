export async function api(path, { method='GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include' 
  })
  if (!res.ok) {
    let msg = 'Error'
    try { const j = await res.json(); msg = j.error ?? msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}

