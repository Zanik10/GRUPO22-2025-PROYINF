import { Router } from "express";
import { z } from "zod";
import { authGuard } from "../helpers/auth.js";
import { pool } from "../db.js";

const router = Router();

router.get("/me", authGuard, async (req, res) => {
  try {
    const userId = req.user.sub; // viene del token (signJWT en auth.js)

    // 1) Traer cuentas del usuario
    const accountsResult = await pool.query(
      `SELECT id, tipo AS type, currency
       FROM cuentas
       WHERE usuario_id = $1`,
      [userId]
    );

    const accounts = accountsResult.rows;

    // 2) Para cada cuenta, calcular balance sumando transacciones no bloqueadas
    const withBalance = await Promise.all(
      accounts.map(async (a) => {
        const txsResult = await pool.query(
          `SELECT direction, amount
           FROM transacciones
           WHERE account_id = $1 AND is_blocked = false`,
          [a.id]
        );

        const txs = txsResult.rows;
        const balance = txs.reduce(
          (acc, t) =>
            acc +
            Number(t.amount) * (t.direction === "CREDIT" ? 1 : -1),
          0
        );

        return { ...a, availableBalance: balance };
      })
    );

    res.json({ accounts: withBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

const FakeTxSchema = z.object({
  accountId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
});

router.post("/deposit", authGuard, async (req, res) => {
  try {
    const p = FakeTxSchema.safeParse(req.body);
    if (!p.success)
      return res.status(400).json({ error: p.error.flatten() });

    const { accountId, amount, description } = p.data;

    await pool.query(
      `INSERT INTO transacciones (account_id, amount, direction, description, is_blocked)
       VALUES ($1, $2, 'CREDIT', $3, false)`,
      [accountId, amount, description || null]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

router.post("/withdraw", authGuard, async (req, res) => {
  try {
    const p = FakeTxSchema.safeParse(req.body);
    if (!p.success)
      return res.status(400).json({ error: p.error.flatten() });

    const { accountId, amount, description } = p.data;

    await pool.query(
      `INSERT INTO transacciones (account_id, amount, direction, description, is_blocked)
       VALUES ($1, $2, 'DEBIT', $3, false)`,
      [accountId, amount, description || null]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;
