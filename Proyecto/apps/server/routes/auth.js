import express from "express";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { pool } from "../db.js";

dotenv.config();
const router = express.Router();

const CLAVEUNICA_BASE = "https://accounts.claveunica.gob.cl/openid";
const {
  CLAVEUNICA_CLIENT_ID,
  CLAVEUNICA_CLIENT_SECRET,
  CLAVEUNICA_REDIRECT_URI,
  JWT_SECRET = "supersecreto",
} = process.env;


router.get("/claveunica/login", (req, res) => {
  const authUrl = `${CLAVEUNICA_BASE}/authorize/?client_id=${CLAVEUNICA_CLIENT_ID}&response_type=code&scope=openid run name&redirect_uri=${CLAVEUNICA_REDIRECT_URI}`;
  res.redirect(authUrl);
});


router.get("/claveunica/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ ok: false, error: "Falta código" });

  try {
    
    const tokenRes = await fetch(`${CLAVEUNICA_BASE}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLAVEUNICA_CLIENT_ID,
        client_secret: CLAVEUNICA_CLIENT_SECRET,
        redirect_uri: CLAVEUNICA_REDIRECT_URI,
        grant_type: "authorization_code",
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    
    const userRes = await fetch(`${CLAVEUNICA_BASE}/userinfo/`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userInfo = await userRes.json();

    const run = userInfo.run;
    const name = userInfo.name?.fullName || "Usuario ClaveÚnica";

    
    const existing = await pool.query(
      `SELECT id, rut FROM usuarios WHERE rut = $1`,
      [run]
    );

    if (existing.rows.length === 0) {
      
      return res.redirect(
        `http://localhost:5173/register?run=${run}&name=${encodeURIComponent(
          name
        )}&claveunica=true`
      );
    }

    const user = existing.rows[0];

    
    const token = jwt.sign(
      { id: user.id, rut: user.rut },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, { httpOnly: true });

    
    res.redirect("http://localhost:5173/dashboard");
  } catch (err) {
    console.error("Error autenticando ClaveÚnica:", err);
    res.status(500).json({ ok: false, error: "Error verificando identidad" });
  }
});


router.post("/claveunica/register", async (req, res) => {
  try {
    const { run, name, salario } = req.body;

    if (!run || !salario) {
      return res.status(400).json({
        ok: false,
        error: "Datos incompletos",
      });
    }

    const result = await pool.query(
      `INSERT INTO usuarios (rut, name, salario)
       VALUES ($1, $2, $3)
       RETURNING id, rut, name, salario`,
      [run, name, Number(salario)]
    );

    res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    console.error("Error registrando usuario ClaveÚnica:", err);
    res.status(500).json({ ok: false });
  }
});

export default router;
