
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../utils/api";

const CARD_BG = "#1e293b";
const CARD_BORDER = "#334155";
const TEXT_MAIN = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState(null);
  const [simulacion, setSimulacion] = useState(null);
  const [scoring, setScoring] = useState(null);

  const [loading, setLoading] = useState(true);
  const [evaluando, setEvaluando] = useState(false);
  const [error, setError] = useState(null);
  const [infoMsg, setInfoMsg] = useState(null);

  // Documento
  const [file, setFile] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [remainingMs, setRemainingMs] = useState(null);

  const cargarDetalle = async () => {
    try {
      setLoading(true);
      setError(null);
      setInfoMsg(null);

      
      try {
        await api(`/api/loans/${id}/review-document`, {
          method: "POST",
          body: {},
        });
      } catch (e) {
        
        console.warn("Error en review-document:", e);
      }

      const data = await api(`/api/loans/${id}`);
      setSolicitud(data.solicitud);
      setSimulacion(data.simulacion);
    } catch (err) {
      console.error("Error cargando detalle:", err);
      setError("Error al cargar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  
  useEffect(() => {
    if (!solicitud || !solicitud.documento_deadline) {
      setRemainingMs(null);
      return;
    }

    
    if (solicitud.estado !== "PRE_APROBADO") {
      setRemainingMs(null);
      return;
    }

    const deadlineMs = new Date(solicitud.documento_deadline).getTime();

    const updateRemaining = () => {
      const diff = deadlineMs - Date.now();
      setRemainingMs(diff > 0 ? diff : 0);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [solicitud]);

  const handleEvaluate = async () => {
    try {
      setEvaluando(true);
      setError(null);
      setInfoMsg(null);

      const data = await api(`/api/loans/${id}/evaluate`, {
        method: "POST",
        body: {}, 
      });

      setSolicitud(data.solicitud);
      setScoring(data.scoring || null);
      setInfoMsg("Solicitud evaluada correctamente.");
    } catch (err) {
      console.error("Error evaluando solicitud:", err);
      setError("Error al evaluar la solicitud.");
    } finally {
      setEvaluando(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);

    if (!file) {
      setError("Debes seleccionar un archivo PDF antes de subirlo.");
      return;
    }

    const formData = new FormData();
    formData.append("documento", file);

    try {
      setSubiendo(true);
      const data = await api(`/api/loans/${id}/upload`, {
        method: "POST",
        body: formData,
      });

      setSolicitud(data.solicitud);
      setInfoMsg("Documento subido correctamente.");
      
      await cargarDetalle();
    } catch (err) {
      console.error("Error al subir documento:", err);
      setError(err.message || "Error al subir el documento.");
    } finally {
      setSubiendo(false);
    }
  };

  if (loading) {
    return <p style={{ color: TEXT_MAIN }}>Cargando detalle...</p>;
  }

  if (error && !solicitud) {
    return (
      <section style={{ color: TEXT_MAIN }}>
        <p>{error}</p>
        <Link to="/solicitudes" style={{ color: "#93c5fd" }}>
          ← Volver a mis solicitudes
        </Link>
      </section>
    );
  }

  if (!solicitud || !simulacion) {
    return (
      <section style={{ color: TEXT_MAIN }}>
        <p>Solicitud no encontrada.</p>
        <Link to="/solicitudes" style={{ color: "#93c5fd" }}>
          ← Volver a mis solicitudes
        </Link>
      </section>
    );
  }

  const isPreAprobado = solicitud.estado === "PRE_APROBADO";
  const puedeSubirDoc = isPreAprobado && !solicitud.documento_subido;

  let timerText = "";
  if (remainingMs != null) {
    const totalSec = Math.floor(remainingMs / 1000);
    const min = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const sec = String(totalSec % 60).padStart(2, "0");
    timerText = `${min}:${sec}`;
  }

  const documentoLabel = solicitud.documento_subido
    ? "Documento recibido"
    : isPreAprobado
    ? "Documento pendiente"
    : "Documento no requerido / plazo finalizado";

  return (
    <section style={{ maxWidth: 900, margin: "0 auto", color: TEXT_MAIN }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 16,
          fontSize: 13,
          color: "#93c5fd",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        ← Volver
      </button>

      <h2 style={{ margin: "0 0 12px" }}>Solicitud #{solicitud.id}</h2>

      <div
        style={{
          background: CARD_BG,
          borderRadius: 12,
          border: `1px solid ${CARD_BORDER}`,
          padding: 20,
          display: "grid",
          gap: 16,
        }}
      >
        
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: TEXT_SECONDARY }}>
              Estado actual
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {solicitud.estado}
            </div>
            {solicitud.motivo_rechazo && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: "#fecaca",
                }}
              >
                Motivo rechazo: {solicitud.motivo_rechazo}
              </div>
            )}
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: TEXT_SECONDARY }}>Score</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {solicitud.score != null
                ? Number(solicitud.score).toFixed(2)
                : "—"}
            </div>
          </div>
        </div>

        {/* Detalle de la simulación */}
        <div
          style={{
            borderTop: `1px solid ${CARD_BORDER}`,
            paddingTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            fontSize: 14,
          }}
        >
          <Info label="Monto">
            ${Number(simulacion.monto).toLocaleString("es-CL")}
          </Info>
          <Info label="Tasa anual">
            {Number(simulacion.tasa_anual).toLocaleString("es-CL", {
              maximumFractionDigits: 2,
            })}
            %
          </Info>
          <Info label="Plazo">
            {simulacion.plazo_meses} meses
          </Info>
          <Info label="Cuota mensual">
            ${Number(simulacion.cuota_mensual).toLocaleString("es-CL")}
          </Info>
          <Info label="Total a pagar">
            ${Number(simulacion.total_pagar).toLocaleString("es-CL")}
          </Info>
        </div>

        {/* Botón de evaluación */}
        {solicitud.estado === "PENDIENTE" && (
          <div
            style={{
              borderTop: `1px solid ${CARD_BORDER}`,
              paddingTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13, color: TEXT_SECONDARY }}>
              Al evaluar la solicitud, el sistema calculará un score en base a
              tu salario, antigüedad laboral y deudas declaradas. Si el score es
              suficiente, tu solicitud quedará pre-aprobada y tendrás un plazo
              para subir un documento PDF.
            </div>

            <button
              type="button"
              onClick={handleEvaluate}
              disabled={evaluando}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "none",
                background: "#22c55e",
                color: "#022c22",
                fontWeight: 600,
                cursor: evaluando ? "wait" : "pointer",
                opacity: evaluando ? 0.8 : 1,
              }}
            >
              {evaluando ? "Evaluando..." : "Evaluar solicitud"}
            </button>
          </div>
        )}

        {/* Estado del documento + deadline + timer + upload */}
        <div
          style={{
            borderTop: `1px solid ${CARD_BORDER}`,
            paddingTop: 16,
            display: "grid",
            gap: 12,
            fontSize: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: TEXT_SECONDARY }}>
              Estado del documento
            </div>
            <div style={{ fontSize: 15 }}>{documentoLabel}</div>

            {solicitud.documento_deadline && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: TEXT_SECONDARY,
                }}
              >
                Deadline para subir documento:{" "}
                {new Date(
                  solicitud.documento_deadline
                ).toLocaleString("es-CL")}
              </div>
            )}

            {isPreAprobado && remainingMs != null && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: "#93c5fd",
                }}
              >
                Tiempo restante:{" "}
                <strong>{timerText || "00:00"}</strong>
              </div>
            )}
          </div>

          {puedeSubirDoc && (
            <form
              onSubmit={handleUpload}
              style={{
                marginTop: 8,
                padding: 12,
                borderRadius: 10,
                border: `1px dashed ${CARD_BORDER}`,
                background: "#0f172a",
                display: "grid",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: TEXT_SECONDARY,
                }}
              >
                Sube un comprobante en formato PDF antes del plazo para completar
                la aprobación final.
              </span>

              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ fontSize: 13, color: TEXT_MAIN }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={subiendo}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: "1px solid #93c5fd",
                    background: "#1d4ed8",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: subiendo ? "wait" : "pointer",
                    opacity: subiendo ? 0.8 : 1,
                  }}
                >
                  {subiendo ? "Subiendo..." : "Subir documento"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Breakdown scoring si lo quieres mostrar */}
        {scoring && (
          <div
            style={{
              borderTop: `1px solid ${CARD_BORDER}`,
              paddingTop: 16,
              fontSize: 13,
              color: TEXT_SECONDARY,
            }}
          >
            <div style={{ marginBottom: 8 }}>Detalle del scoring:</div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li>Sub-score RCI: {scoring.S_RCI}</li>
              <li>Sub-score Ingreso: {scoring.S_ING}</li>
              <li>Sub-score Estabilidad: {scoring.S_EST}</li>
              <li>Sub-score Deuda: {scoring.S_DEU}</li>
            </ul>
          </div>
        )}

        {(error || infoMsg) && (
          <div
            style={{
              borderTop: `1px solid ${CARD_BORDER}`,
              paddingTop: 12,
              fontSize: 13,
            }}
          >
            {error && (
              <p style={{ margin: 0, color: "#fca5a5" }}>{error}</p>
            )}
            {infoMsg && (
              <p style={{ margin: 0, color: "#bbf7d0" }}>{infoMsg}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Info({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>{label}</div>
      <div style={{ fontSize: 15 }}>{children}</div>
    </div>
  );
}
