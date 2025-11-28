// apps/client/src/pages/Loans.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";

export default function Loans() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api("/api/loans/mine");
      console.log("Respuesta /api/loans/mine:", data);

      if (Array.isArray(data)) {
        setSolicitudes(data);
      } else {
        setSolicitudes([]);
      }
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
      setError("Error al cargar tus solicitudes de préstamo.");
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  return (
    <section
      style={{
        width: "100%",
        margin: "0 auto",
        padding: "32px 5%",
        boxSizing: "border-box",
        color: "#e2e8f0",
      }}
    >
      <h2 style={{ fontSize: 24, margin: "0 0 16px" }}>
        Mis solicitudes de préstamo
      </h2>

      {loading && <p style={{ color: "#94a3b8" }}>Cargando solicitudes...</p>}

      {!loading && error && (
        <p style={{ color: "#fca5a5" }}>
          {error}
        </p>
      )}

      {!loading && !error && solicitudes.length === 0 && (
        <p style={{ color: "#94a3b8" }}>
          No tienes solicitudes de préstamo registradas.
        </p>
      )}

      {!loading && !error && solicitudes.length > 0 && (
        <div
          style={{
            border: "1px solid #334155",
            borderRadius: 12,
            overflow: "hidden",
            maxWidth: 1000,
            background: "#1e293b",
            boxShadow: "0 10px 25px rgba(15,23,42,0.6)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead style={{ background: "#0f172a" }}>
              <tr>
                <Th>Fecha</Th>
                <Th>Estado</Th>
                <Th>Documento</Th>
                <Th>Monto</Th>
                <Th>Tasa anual</Th>
                <Th>Plazo</Th>
                <Th>Cuota</Th>
                <Th>Total</Th>
                <Th>Detalle</Th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => (
                <tr key={sol.id}>
                  <Td>
                    {sol.created_at
                      ? new Date(sol.created_at).toLocaleString("es-CL")
                      : "-"}
                  </Td>

                  <Td>
                    <EstadoBadge estado={sol.estado} />
                  </Td>

                  <Td align="center">
                    {sol.documento_subido
                      ? "Recibido"
                      : sol.estado === "PRE_APROBADO"
                      ? "Pendiente"
                      : "-"}
                  </Td>

                  <Td align="right">
                    ${Number(sol.monto ?? 0).toLocaleString("es-CL")}
                  </Td>

                  <Td align="right">
                    {Number(sol.tasa_anual ?? 0).toLocaleString("es-CL", {
                      maximumFractionDigits: 2,
                    })}
                    %
                  </Td>

                  <Td align="right">
                    {sol.plazo_meses ?? 0} meses
                  </Td>

                  <Td align="right">
                    ${Number(sol.cuota_mensual ?? 0).toLocaleString("es-CL")}
                  </Td>

                  <Td align="right">
                    ${Number(sol.total_pagar ?? 0).toLocaleString("es-CL")}
                  </Td>

                  <Td align="center">
                    <Link
                      to={`/solicitudes/${sol.id}`}
                      style={{
                        fontSize: 12,
                        textDecoration: "underline",
                        color: "#93c5fd",
                      }}
                    >
                      Ver detalle
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const Th = ({ children }) => (
  <th
    style={{
      padding: 10,
      borderBottom: "1px solid #334155",
      textAlign: "left",
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "#94a3b8",
    }}
  >
    {children}
  </th>
);

const Td = ({ children, align }) => (
  <td
    style={{
      padding: 8,
      borderBottom: "1px solid #334155",
      textAlign: align || "left",
      fontVariantNumeric: "tabular-nums",
      color: "#e2e8f0",
    }}
  >
    {children}
  </td>
);

const EstadoBadge = ({ estado }) => {
  let bg = "#1f2937";
  let color = "#e5e7eb";

  if (estado === "PENDIENTE") {
    bg = "rgba(251, 191, 36, 0.15)"; // amarillo suave
    color = "#facc15";
  } else if (estado === "PRE_APROBADO") {
    bg = "rgba(56, 189, 248, 0.15)"; // celeste
    color = "#38bdf8";
  } else if (estado === "APROBADA_FINAL") {
    bg = "rgba(34, 197, 94, 0.15)"; // verde
    color = "#22c55e";
  } else if (estado === "RECHAZADO" || estado === "RECHAZADA_TEMPORAL") {
    bg = "rgba(239, 68, 68, 0.15)"; // rojo
    color = "#f87171";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background: bg,
        color,
      }}
    >
      {estado}
    </span>
  );
};
