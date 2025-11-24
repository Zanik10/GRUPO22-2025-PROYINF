import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/health/db", async (_req, res) => {
  try {
    // Consulta mínima para comprobar conexión a la BD
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
