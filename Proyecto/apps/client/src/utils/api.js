export async function api(
  path,
  { method = "GET", body, headers = {} } = {}
) {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const res = await fetch("http://localhost:3000" + path, {
    method,
    headers: isFormData
      ? {
          
          ...headers,
        }
      : {
          "Content-Type": "application/json",
          ...headers,
        },
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    let err = "Error en la solicitud";
    try {
      const data = await res.json();
      
      const base = data.error || "Error en la solicitud";
      const detail = data.detail ? ` (${data.detail})` : "";
      err = base + detail;
    } catch {
      
    }
    throw new Error(err);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}
