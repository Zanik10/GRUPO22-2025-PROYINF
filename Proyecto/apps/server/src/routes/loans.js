
import { Router } from "express";
import { pool } from "../db.js";
import { authGuard } from "../helpers/auth.js";
import { calculateScore } from "../services/scoring.js";
import { uploadPdf } from "../middleware/upload.js";
import { sendLoanStatusEmail } from "../services/mailer.js";

const router = Router();
router.use(authGuard);


router.post("/request", async (req, res) => {
  try {
    const usuarioId = req.user.sub;
    const { simulacionId } = req.body;

    if (!simulacionId) {
      return res.status(400).json({ error: "Falta simulacionId" });
    }

    // Verificar que la simulación existe y pertenece al usuario
    const sim = await pool.query(
      `
      SELECT id
      FROM simulaciones
      WHERE id = $1 AND usuario_id = $2
      `,
      [simulacionId, usuarioId]
    );

    if (sim.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Simulación no encontrada para este usuario" });
    }

    const insert = await pool.query(
      `
      INSERT INTO solicitudes_prestamo (usuario_id, simulacion_id, estado, created_at, updated_at)
      VALUES ($1, $2, 'PENDIENTE', now(), now())
      RETURNING id, usuario_id, simulacion_id, estado, motivo_rechazo, score, created_at, updated_at
      `,
      [usuarioId, simulacionId]
    );

    return res.status(201).json({ solicitud: insert.rows[0] });
  } catch (err) {
    console.error("Error en POST /api/loans/request:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});


router.get("/mine", async (req, res) => {
  try {
    const usuarioId = req.user.sub;

    const { rows } = await pool.query(
      `
      SELECT
        s.id,
        s.usuario_id,
        s.simulacion_id,
        s.estado,
        s.motivo_rechazo,
        s.score,
        s.created_at,
        s.updated_at,
        s.documento_subido,
        s.documento_path,
        s.documento_deadline,

        -- Campos de la simulación:
        sim.monto,
        sim.tasa_anual,
        sim.plazo_meses,
        sim.cuota_mensual,
        sim.total_pagar
      FROM solicitudes_prestamo s
      JOIN simulaciones sim ON sim.id = s.simulacion_id
      WHERE s.usuario_id = $1
      ORDER BY s.created_at DESC
      `,
      [usuarioId]
    );

    // devolvemos las filas tal cual, Loans.jsx ya espera estos nombres
    return res.json(rows);
  } catch (err) {
    console.error("Error en GET /api/loans/mine:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const usuarioId = req.user.sub;
    const id = Number(req.params.id) || 0;

    const result = await pool.query(
      `
      SELECT
        s.id,
        s.usuario_id,
        s.simulacion_id,
        s.estado,
        s.motivo_rechazo,
        s.score,
        s.created_at,
        s.updated_at,
        s.documento_subido,
        s.documento_path,
        s.documento_deadline,

        sim.monto,
        sim.tasa_anual,
        sim.plazo_meses,
        sim.cuota_mensual,
        sim.total_pagar,

        u.salario,
        u.tiene_deuda,
        u.antiguedad_laboral_meses
      FROM solicitudes_prestamo s
      JOIN simulaciones sim ON sim.id = s.simulacion_id
      JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.id = $1 AND s.usuario_id = $2
      `,
      [id, usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    const row = result.rows[0];

    const solicitud = {
      id: row.id,
      usuario_id: row.usuario_id,
      simulacion_id: row.simulacion_id,
      estado: row.estado,
      motivo_rechazo: row.motivo_rechazo,
      score: row.score,
      created_at: row.created_at,
      updated_at: row.updated_at,
      documento_subido: row.documento_subido,
      documento_path: row.documento_path,
      documento_deadline: row.documento_deadline,
    };

    const simulacion = {
      id: row.simulacion_id,
      monto: row.monto,
      tasa_anual: row.tasa_anual,
      plazo_meses: row.plazo_meses,
      cuota_mensual: row.cuota_mensual,
      total_pagar: row.total_pagar,
    };

    return res.json({
      solicitud,
      simulacion,
    });
  } catch (err) {
    console.error("Error en GET /api/loans/:id:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});


router.post("/:id/evaluate", async (req, res) => {
  try {
    const usuarioId = req.user.sub;
    const id = Number(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    console.log("Evaluando solicitud", { id, usuarioId });

    // 1. Traer solicitud + simulación + datos del usuario (incluye email y nombre)
    const { rows } = await pool.query(
      `
      SELECT
        s.id,
        s.usuario_id,
        s.simulacion_id,
        s.estado,

        sim.cuota_mensual,
        u.salario,
        u.tiene_deuda,
        u.antiguedad_laboral_meses,
        u.email,
        u.full_name
      FROM solicitudes_prestamo s
      JOIN simulaciones sim ON sim.id = s.simulacion_id
      JOIN usuarios u       ON u.id  = s.usuario_id
      WHERE s.id = $1 AND s.usuario_id = $2
      `,
      [id, usuarioId]
    );

    if (rows.length === 0) {
      console.log("Solicitud no encontrada o no pertenece al usuario");
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    const row = rows[0];

    const cuotaMensual = Number(row.cuota_mensual) || 0;
    const salario = Number(row.salario) || 0;
    const antiguedad = Number(row.antiguedad_laboral_meses) || 0;
    const tieneDeuda = row.tiene_deuda;

    console.log("Datos para scoring:", {
      cuotaMensual,
      salario,
      antiguedad,
      tieneDeuda,
    });

    // 2. Calcular score
    const resultado = calculateScore({
      cuotaMensual,
      salario,
      antiguedadLaboralMeses: antiguedad,
      tieneDeuda,
    });

    console.log("Resultado scoring:", resultado);

    const score = resultado.score ?? 0;

    // 3. Definir nuevo estado segun reglas del proyecto
    let nuevoEstado;
    let motivoRechazo = null;
    let documentoDeadline = null;

    // Umbral actual que estás usando (70)
    if (score >= 70) {
      // Queda PRE-APROBADO y empieza a correr el plazo de 5 minutos
      nuevoEstado = "PRE_APROBADO";
      documentoDeadline = new Date(Date.now() + 5 * 60 * 1000);
    } else {
      nuevoEstado = "RECHAZADO";
      motivoRechazo = resultado.motivoRechazo || "Score insuficiente";
    }

    // 4. Actualizar solicitud (dos queries separados para evitar conflicto de tipos)
    let update;

    if (nuevoEstado === "PRE_APROBADO") {
      
      update = await pool.query(
        `
        UPDATE solicitudes_prestamo
        SET estado = $1,
            motivo_rechazo = $2,
            score = $3,
            documento_subido = false,
            documento_path = NULL,
            documento_deadline = $4,
            updated_at = now()
        WHERE id = $5
        RETURNING
          id,
          usuario_id,
          simulacion_id,
          estado,
          motivo_rechazo,
          score,
          documento_subido,
          documento_path,
          documento_deadline,
          created_at,
          updated_at
        `,
        [nuevoEstado, motivoRechazo, score, documentoDeadline, id]
      );
    } else {
      
      update = await pool.query(
        `
        UPDATE solicitudes_prestamo
        SET estado = $1,
            motivo_rechazo = $2,
            score = $3,
            updated_at = now()
        WHERE id = $4
        RETURNING
          id,
          usuario_id,
          simulacion_id,
          estado,
          motivo_rechazo,
          score,
          documento_subido,
          documento_path,
          documento_deadline,
          created_at,
          updated_at
        `,
        [nuevoEstado, motivoRechazo, score, id]
      );
    }

    const solicitudActualizada = update.rows[0];
    console.log("Solicitud actualizada:", solicitudActualizada);

    
    await sendLoanStatusEmail({
      to: row.email,
      name: row.full_name,
      solicitudId: solicitudActualizada.id,
      estado: solicitudActualizada.estado,
      score,
      motivoRechazo,
    });

    return res.json({
      solicitud: solicitudActualizada,
      scoring: resultado.detalle,
    });
  } catch (err) {
    console.error("Error en POST /api/loans/:id/evaluate:", err);
    return res.status(500).json({
      error: "Error interno en evaluación",
      detail: err.message,
    });
  }
});


router.post(
  "/:id/upload",
  uploadPdf.single("documento"),
  async (req, res) => {
    try {
      const usuarioId = req.user.sub;
      const id = Number(req.params.id);

      if (!id || Number.isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      
      const { rows } = await pool.query(
        `
        SELECT s.estado,
               s.documento_deadline,
               u.email,
               u.full_name
        FROM solicitudes_prestamo s
        JOIN usuarios u ON u.id = s.usuario_id
        WHERE s.id = $1 AND s.usuario_id = $2
        `,
        [id, usuarioId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Solicitud no encontrada" });
      }

      const solicitud = rows[0];

      if (solicitud.estado !== "PRE_APROBADO") {
        return res
          .status(400)
          .json({ error: "La solicitud no está en estado PRE_APROBADO" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Debe adjuntar un archivo PDF" });
      }

      const ahora = new Date();
      const deadline = solicitud.documento_deadline
        ? new Date(solicitud.documento_deadline)
        : null;

      let nuevoEstado = "APROBADA_FINAL";
      if (deadline && ahora > deadline) {
        nuevoEstado = "RECHAZADA_TEMPORAL";
      }

      const update = await pool.query(
        `
        UPDATE solicitudes_prestamo
        SET documento_subido = true,
            documento_path = $1,
            estado = $2,
            updated_at = now()
        WHERE id = $3
        RETURNING
          id,
          usuario_id,
          simulacion_id,
          estado,
          motivo_rechazo,
          score,
          documento_subido,
          documento_path,
          documento_deadline,
          created_at,
          updated_at
        `,
        [req.file.path, nuevoEstado, id]
      );

      const solicitudActualizada = update.rows[0];

      
      await sendLoanStatusEmail({
        to: solicitud.email,
        name: solicitud.full_name,
        solicitudId: solicitudActualizada.id,
        estado: solicitudActualizada.estado,
        score: solicitudActualizada.score,
        motivoRechazo: solicitudActualizada.motivo_rechazo,
      });

      return res.json({
        ok: true,
        solicitud: solicitudActualizada,
      });
    } catch (err) {
      console.error("Error en POST /api/loans/:id/upload:", err);
      return res.status(500).json({ error: "Error al subir documento" });
    }
  }
);


router.post("/:id/review-document", async (req, res) => {
  try {
    const usuarioId = req.user.sub;
    const id = Number(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const { rows } = await pool.query(
      `
      SELECT s.id,
             s.estado,
             s.documento_subido,
             s.documento_deadline,
             s.score,
             s.motivo_rechazo,
             u.email,
             u.full_name
      FROM solicitudes_prestamo s
      JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.id = $1 AND s.usuario_id = $2
      `,
      [id, usuarioId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    const solicitud = rows[0];

    
    if (
      solicitud.estado !== "PRE_APROBADO" ||
      !solicitud.documento_deadline
    ) {
      return res.json({ ok: true, estado: solicitud.estado });
    }

    const ahora = new Date();
    const deadline = new Date(solicitud.documento_deadline);

    let nuevoEstado = solicitud.estado;

    if (!solicitud.documento_subido && ahora > deadline) {
      nuevoEstado = "RECHAZADA_TEMPORAL";

      await pool.query(
        `
        UPDATE solicitudes_prestamo
        SET estado = $1,
            updated_at = now()
        WHERE id = $2
        `,
        [nuevoEstado, id]
      );

      
      await sendLoanStatusEmail({
        to: solicitud.email,
        name: solicitud.full_name,
        solicitudId: solicitud.id,
        estado: nuevoEstado,
        score: solicitud.score,
        motivoRechazo: solicitud.motivo_rechazo,
      });
    }

    return res.json({ ok: true, estado: nuevoEstado });
  } catch (err) {
    console.error("Error en POST /api/loans/:id/review-document:", err);
    return res.status(500).json({ error: "Error al revisar documento" });
  }
});

export default router;
