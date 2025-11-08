import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import dotenv from "dotenv";
import express from "express";

dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

const CLAVEUNICA_BASE = "https://accounts.claveunica.gob.cl/openid";
const {
  CLAVEUNICA_CLIENT_ID,
  CLAVEUNICA_CLIENT_SECRET,
  CLAVEUNICA_REDIRECT_URI,
  JWT_SECRET = "supersecreto",
} = process.env;

// 1️⃣ Redirigir al login de ClaveÚnica
router.get("/claveunica/login", (req, res) => {
  const authUrl = `${CLAVEUNICA_BASE}/authorize/?client_id=${CLAVEUNICA_CLIENT_ID}&response_type=code&scope=openid run name&redirect_uri=${CLAVEUNICA_REDIRECT_URI}`;
  res.redirect(authUrl);
});

router.get("/claveunica/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ ok: false, error: "Falta código" });

  try {
    // 1️⃣ Intercambiar el code por token
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

    // 2️⃣ Obtener los datos del usuario desde ClaveÚnica
    const userRes = await fetch(`${CLAVEUNICA_BASE}/userinfo/`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userInfo = await userRes.json();

    const run = userInfo.run;
    const name = userInfo.name?.fullName || "Usuario ClaveÚnica";

    // 3️⃣ Verificar si el usuario ya existe
    const user = await prisma.user.findUnique({ where: { rut: run } });

    if (!user) {
      // 🚀 4️⃣ Usuario nuevo → redirigimos al frontend para completar registro
      return res.redirect(
        `http://localhost:5173/register?run=${run}&name=${encodeURIComponent(name)}&claveunica=true`
      );
    }

    // 5️⃣ Usuario existente → autenticación normal
    const token = jwt.sign({ id: user.id, rut: user.rut }, JWT_SECRET, { expiresIn: "2h" });
    res.cookie("token", token, { httpOnly: true });

    // 🔁 Redirige al dashboard si ya está registrado
    res.redirect("http://localhost:5173/dashboard");
  } catch (err) {
    console.error("❌ Error autenticando ClaveÚnica:", err);
    res.status(500).json({ ok: false, error: "Error verificando identidad" });
  }
});

router.post("/claveunica/register", async (req, res) => {
  try {
    const { run, name, salario } = req.body;
    if (!run || !salario) return res.status(400).json({ ok: false, error: "Datos incompletos" });

    const user = await prisma.user.create({
      data: {
        run,
        name,
        salario: Number(salario),
      },
    });

    res.json({ ok: true, user });
  } catch (err) {
    console.error("❌ Error registrando usuario ClaveÚnica:", err);
    res.status(500).json({ ok: false });
  }
});

export default router;