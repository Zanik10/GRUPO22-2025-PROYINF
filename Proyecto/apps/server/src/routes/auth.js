import { Router } from "express";
import { z } from "zod";
import argon2 from "argon2";
import { pool } from "../db.js";
import { signJWT } from "../helpers/auth.js";

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).optional(),
});

// -----------------------------
// REGISTRO
// -----------------------------
router.post("/register", async (req, res) => {
  try {
    const p = RegisterSchema.safeParse(req.body);
    if (!p.success)
      return res.status(400).json({ error: p.error.flatten() });

    const { email, password, fullName } = p.data;

    // 1. Verificar si el usuario ya existe
    const exists = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (exists.rows.length > 0)
      return res.status(409).json({ error: "Email ya registrado" });

    // 2. Hashear contraseña
    const passwordHash = await argon2.hash(password);

    // 3. Transacción manual
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Crear usuario
      const userResult = await client.query(
        `INSERT INTO usuarios (email, password_hash, full_name)
         VALUES ($1, $2, $3)
         RETURNING id, email`,
        [email, passwordHash, fullName || null]
      );

      const user = userResult.rows[0];

      // Crear cuenta por defecto
      await client.query(
        `INSERT INTO cuentas (usuario_id, tipo, currency, saldo)
         VALUES ($1, 'CHECKING', 'CLP', 0)`,
        [user.id]
      );

      await client.query("COMMIT");

      // Generar token
      const token = signJWT({ sub: user.id, email: user.email });

      return res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        })
        .json({ ok: true });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      return res.status(500).json({ error: "Error interno" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// -----------------------------
// LOGIN
// -----------------------------
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/login", async (req, res) => {
  try {
    const p = LoginSchema.safeParse(req.body);
    if (!p.success)
      return res.status(400).json({ error: p.error.flatten() });

    const { email, password } = p.data;

    // Buscar usuario
    const result = await pool.query(
      `SELECT id, email, password_hash
       FROM usuarios
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const user = result.rows[0];

    // Verificar contraseña
    const ok = await argon2.verify(user.password_hash, password);
    if (!ok)
      return res.status(401).json({ error: "Credenciales inválidas" });

    // Generar token
    const token = signJWT({ sub: user.id, email: user.email });

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// -----------------------------
// LOGOUT
// -----------------------------
router.post("/logout", (_req, res) => {
  res.clearCookie("token").json({ ok: true });
});

export default router;
