import express from "express";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.get("/verify", (req, res) => {
  const url =
    `https://accounts.claveunica.gob.cl/openid/authorize/?client_id=${process.env.CLAVEUNICA_CLIENT_ID}` +
    `&response_type=code&scope=openid%20run%20name&redirect_uri=${process.env.CLAVEUNICA_REDIRECT_URI}`;
  
  res.redirect(url);
});

export default router;

router.post("/complete", async (req, res) => {
  const { rut, name, salario } = req.body;

  console.log("📌 Datos recibidos del usuario verificado:");
  console.log({ rut, name, salario });

  return res.json({ ok: true });
});