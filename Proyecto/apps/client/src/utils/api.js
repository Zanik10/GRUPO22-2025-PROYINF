
export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch("http://localhost:3000" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", 
  })

  if (!res.ok) {
    let err = "Error en la solicitud"
    try {
      const data = await res.json()
      err = data.error || JSON.stringify(data)
    } catch {
      
    }
    throw new Error(err)
  }

  
  try {
    return await res.json()
  } catch {
    return null
  }
}
