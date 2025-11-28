
import { Router } from "express";
import { pool } from "../db.js";
import { authGuard } from "../helpers/auth.js";

const router = Router();

router.use(authGuard);

// GET /api/profile -> devuelve datos del usuario logueado
router.get("/", async (req, res) => {
  try {
    const userId = req.user.sub;

    const { rows } = await pool.query(
      `
      SELECT
        id,
        full_name AS "fullName",
        email,
        salario,
        tiene_deuda AS "tieneDeuda",
        antiguedad_laboral_meses AS "antiguedadLaboralMeses"
      FROM usuarios
      WHERE id = $1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("Error en GET /api/profile:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

// PUT /api/profile -> actualiza salario, deuda, antigüedad
router.put("/", async (req, res) => {
  try {
    const userId = req.user.sub;
    const { salario, tieneDeuda, antiguedadLaboralMeses } = req.body;

    const salarioNum = Number(salario) || 0;
    const antiguedadMesesNum = Number(antiguedadLaboralMeses) || 0;
    const tieneDeudaBool = !!tieneDeuda;

    const { rows } = await pool.query(
      `
      UPDATE usuarios
      SET salario = $1,
          tiene_deuda = $2,
          antiguedad_laboral_meses = $3
      WHERE id = $4
      RETURNING
        id,
        full_name AS "fullName",
        email,
        salario,
        tiene_deuda AS "tieneDeuda",
        antiguedad_laboral_meses AS "antiguedadLaboralMeses"
      `,
      [salarioNum, tieneDeudaBool, antiguedadMesesNum, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("Error en PUT /api/profile:", err);
    return res
      .status(500)
      .json({ error: "Error interno al actualizar perfil" });
  }
});

export default router;
