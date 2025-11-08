import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../utils/api";

export default function Register() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", salario: "" });
  const [msg, setMsg] = useState(null);
  const isClaveUnica = !!params.get("run");

  useEffect(() => {
    if (isClaveUnica) {
      setForm((f) => ({
        ...f,
        fullName: params.get("name") || "",
      }));
    }
  }, [isClaveUnica]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      if (isClaveUnica) {
        await api("/api/auth/claveunica/register", { method: "POST", body: { run: params.get("run"), name: form.fullName, salario: form.salario } });
        setMsg("✅ Registro completado con ClaveÚnica.");
      } else {
        await api("/api/auth/register", { method: "POST", body: form });
        setMsg("Cuenta creada. Ahora puedes ir al Dashboard.");
      }
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div className="p-6 max-w-sm">
      <h1>{isClaveUnica ? "Completar Registro ClaveÚnica" : "Crear cuenta"}</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          placeholder="Nombre"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          disabled={isClaveUnica}
        />
        {isClaveUnica ? (
          <>
            <input
              placeholder="Correo electrónico"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              type="number"
              placeholder="Salario mensual"
              value={form.salario}
              onChange={(e) => setForm(f => ({ ...f, salario: e.target.value }))}
              required
            />
          </>
        ) : (
          <>
            <input
              placeholder="Correo electrónico"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </>
        )}
        <button>Registrar</button>
      </form>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
