import { useEffect, useState, useMemo } from "react";
import { api } from "../utils/api";
import { amortizationSchedule } from "../utils/loanMath";

export default function Simulator() {
  const [monto, setMonto] = useState(1000000);
  const [tasa, setTasa] = useState(18);
  const [meses, setMeses] = useState(36);

  const [historial, setHistorial] = useState([]);
  const [msg, setMsg] = useState(null);

  // cálculo matemático (igual que antes)
  const result = useMemo(() => {
    const M = Number(monto) || 0;
    const T = Number(tasa) || 0;
    const N = Math.max(1, Number(meses) || 1);
    return amortizationSchedule(M, T, N);
  }, [monto, tasa, meses]);

  // cargar historial del usuario
  const cargarHistorial = async () => {
    try {
      const sims = await api("/api/simulations/mine");
      setHistorial(sims);
    } catch (e) {
      console.error(e);
      setHistorial([]);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  // guardar simulación al hacer submit
  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    const montoNum = Number(monto) || 0;
    const tasaNum = Number(tasa) || 0;
    const mesesNum = Math.max(1, Number(meses) || 1);

    try {
      await api("/api/simulations", {
        method: "POST",
        body: {
          monto: montoNum,
          tasaAnual: tasaNum,
          plazoMeses: mesesNum,
        },
      });
      setMsg("Simulación guardada en tu historial.");
      await cargarHistorial();
    } catch (err) {
      console.error(err);
      setMsg(err.message);
    }
  };

    
  const solicitarPrestamo = async (simId) => {
    try {
      await api("/api/loans/request", {
        method: "POST",
        body: { simulacionId: simId },
      });
      alert("Solicitud de préstamo creada correctamente.");
    } catch (err) {
      console.error("Error creando solicitud:", err);
      alert("Error al crear la solicitud de préstamo.");
    }
  };

  return (
    <section
      style={{
        width: "100%",
        margin: "0 auto",
        padding: "32px 5%",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ fontSize: 26, margin: "0 0 14px", textAlign: "center" }}>
        Simulador de Préstamos
      </h2>

      {/* form para simular + guardar */}
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 24 }}
      >
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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

        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Stat
            label="Cuota estimada"
            value={`$${formatCLP(result.cuota)}`}
          />
          <Stat
            label="Interés total"
            value={`$${formatCLP(result.totalInteres)}`}
          />
          <Stat label="Cuotas" value={`${meses}`} />
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid #0f172a",
              background: "#0f172a",
              color: "#f9fafb",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Simular y guardar
          </button>
          {msg && (
            <p style={{ marginTop: 8, color: "#e5e7eb" }}>
              {msg}
            </p>
          )}
        </div>
      </form>

      {/* tabla de amortización (igual que antes) */}
      <div
        style={{
          marginTop: 16,
          overflow: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <table
          style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}
        >
          <thead style={{ background: "#f1f5f9" }}>
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

      <p style={{ color: "#64748b", textAlign: "center" }}>
        Mostrando hasta 120 filas por simplicidad. (Luego lo podemos
        paginar/exportar.)
      </p>

      {/* historial guardado en BD */}
      <section style={{ marginTop: 32 }}>
        <h3>Historial de simulaciones</h3>

        {historial.length === 0 ? (
          <p>No tienes simulaciones guardadas.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              maxWidth: 900,
              marginTop: 8,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    textAlign: "left",
                    padding: 4,
                  }}
                >
                  Fecha
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    textAlign: "right",
                    padding: 4,
                  }}
                >
                  Monto
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    textAlign: "right",
                    padding: 4,
                  }}
                >
                  Tasa
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    textAlign: "right",
                    padding: 4,
                  }}
                >
                  Plazo
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    textAlign: "right",
                    padding: 4,
                  }}
                >
                  Cuota
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    textAlign: "right",
                    padding: 4,
                  }}
                >
                  Total
                <th
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    textAlign: "center",
                    padding: 4,
                  }}
                >
                  Acciones
                </th>
                </th>
              </tr>
            </thead>
            <tbody>
              {historial.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: 4 }}>
                    {new Date(s.created_at).toLocaleString("es-CL")}
                  </td>
                  <td style={{ padding: 4, textAlign: "right" }}>
                    ${s.monto.toLocaleString("es-CL")}
                  </td>
                  <td style={{ padding: 4, textAlign: "right" }}>
                    {Number(s.tasa_anual).toFixed(2)}%
                  </td>
                  <td style={{ padding: 4, textAlign: "right" }}>
                    {s.plazo_meses} meses
                  </td>
                  <td style={{ padding: 4, textAlign: "right" }}>
                    ${s.cuota_mensual.toLocaleString("es-CL")}
                  </td>
                  <td style={{ padding: 4, textAlign: "right" }}>
                    ${s.total_pagar.toLocaleString("es-CL")}
                  </td>
                  <td style={{ padding: 4, textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => solicitarPrestamo(s.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid #0f172a",
                        background: "#f1f5f9",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Solicitar préstamo
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: "100%",
      }}
    >
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        padding: 16,
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        minWidth: 200,
        background: "#f8fafc",
        flex: "1 1 auto",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div
        style={{ fontSize: 18, fontWeight: 700, color: "#000000" }}
      >
        {value}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: 10,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
};

const Th = ({ children }) => (
  <th
    style={{
      textAlign: "left",
      padding: 10,
      fontSize: 12,
      color: "#334155",
      borderBottom: "1px solid #e2e8f0",
    }}
  >
    {children}
  </th>
);

const Td = ({ children }) => (
  <td
    style={{
      padding: 10,
      borderBottom: "1px solid #f1f5f9",
      fontVariantNumeric: "tabular-nums",
    }}
  >
    {children}
  </td>
);

function formatCLP(n) {
  return new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 0,
  }).format(n ?? 0);
}
