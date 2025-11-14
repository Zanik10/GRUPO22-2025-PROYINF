import { useState } from "react";
import { api } from "../utils/api";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    try {
      await api("/api/auth/register", {
        method: "POST",
        body: form,
      });

      setMsg("Cuenta creada. Ahora puedes iniciar sesión.");
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        paddingTop: 60,
      }}
    >
      {/* Caja centrada igual que Login */}
      <div className="p-6" style={{ width: 350 }}>
        <h1 style={{ textAlign: "center" }}>Crear cuenta</h1>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">

          <input
            placeholder="Nombre"
            value={form.fullName}
            onChange={(e) =>
              setForm((f) => ({ ...f, fullName: e.target.value }))
            }
          />

          <input
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            required
          />

          <input
            type="password"
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />

          <button>Registrarme</button>
        </form>

        {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      </div>
    </div>
  );
}
