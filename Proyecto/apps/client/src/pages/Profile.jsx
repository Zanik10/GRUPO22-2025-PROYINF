
import { useEffect, useState } from "react";
import { api } from "../utils/api";

const CARD_BG = "#1e293b";
const CARD_BORDER = "#334155";
const TEXT_MAIN = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";

export default function Profile() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    salario: "",
    tieneDeuda: false,
    antiguedadLaboralMeses: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    api("/api/profile")
      .then((data) => {
        if (!alive) return;
        const u = data.user || data;
        setForm({
          fullName: u.fullName || "",
          email: u.email || "",
          salario: u.salario ?? "",
          tieneDeuda: !!u.tieneDeuda,
          antiguedadLaboralMeses:
            u.antiguedadLaboralMeses != null
              ? u.antiguedadLaboralMeses
              : "",
        });
      })
      .catch((err) => {
        console.error(err);
        if (!alive) return;
        setError("Error al cargar perfil.");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setError(null);

    try {
      const body = {
        salario: form.salario,
        tieneDeuda: form.tieneDeuda,
        antiguedadLaboralMeses: form.antiguedadLaboralMeses,
      };

      const data = await api("/api/profile", {
        method: "PUT",
        body,
      });

      const u = data.user || data;
      setForm((prev) => ({
        ...prev,
        salario: u.salario ?? "",
        tieneDeuda: !!u.tieneDeuda,
        antiguedadLaboralMeses: u.antiguedadLaboralMeses ?? "",
      }));

      setMsg("Perfil actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setError("Error al actualizar perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, color: TEXT_MAIN }}>Cargando perfil...</div>
    );
  }

  return (
    <section
      style={{
        padding: 24,
        maxWidth: 600,
        margin: "0 auto",
        color: TEXT_MAIN,
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Mi perfil</h2>

      <form
        onSubmit={onSubmit}
        style={{
          backgroundColor: CARD_BG,
          borderRadius: 12,
          border: `1px solid ${CARD_BORDER}`,
          padding: 20,
          display: "grid",
          gap: 12,
        }}
      >
        {msg && (
          <div
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid #16a34a",
              background: "#14532d",
              color: "#bbf7d0",
              fontSize: 14,
            }}
          >
            {msg}
          </div>
        )}
        {error && (
          <div
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid #b91c1c",
              background: "#7f1d1d",
              color: "#fee2e2",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <Field label="Nombre completo">
          <input value={form.fullName} disabled style={inputDisabled} />
        </Field>

        <Field label="Email">
          <input value={form.email} disabled style={inputDisabled} />
        </Field>

        <Field label="Salario mensual (CLP)">
          <input
            type="number"
            name="salario"
            value={form.salario}
            onChange={onChange}
            min="0"
            step="1000"
            style={input}
          />
        </Field>

        <Field label="¿Tienes otras deudas activas?">
          <label
            style={{
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <input
              type="checkbox"
              name="tieneDeuda"
              checked={form.tieneDeuda}
              onChange={onChange}
            />
            <span>Sí, tengo otras deudas</span>
          </label>
        </Field>

        <Field label="Antigüedad laboral (en meses)">
          <input
            type="number"
            name="antiguedadLaboralMeses"
            value={form.antiguedadLaboralMeses}
            onChange={onChange}
            min="0"
            step="1"
            style={input}
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: 8,
            padding: "10px 16px",
            borderRadius: 999,
            border: "none",
            background: "#93c5fd",
            color: "#0f172a",
            fontWeight: 600,
            cursor: saving ? "wait" : "pointer",
            opacity: saving ? 0.8 : 1,
          }}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
      <span>{label}</span>
      {children}
    </label>
  );
}

const input = {
  borderRadius: 8,
  border: "1px solid #334155",
  padding: "8px 10px",
  background: "#0f172a",
  color: TEXT_MAIN,
  fontSize: 14,
};

const inputDisabled = {
  ...input,
  opacity: 0.7,
};
