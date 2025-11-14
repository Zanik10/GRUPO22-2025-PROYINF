import express from "express";
const router = express.Router();

router.get("/verify", (req, res) => {
  console.log("▶ Iniciando verificación de identidad (mock ClaveÚnica)...");
  res.redirect("http://localhost:4000/api/auth/claveunica/callback");
});

router.post("/complete", (req, res) => {
  const { rut, name, salario } = req.body;

  console.log("📥 Datos recibidos en /loan/complete:");
  console.log({ rut, name, salario });

  res.json({ ok: true });
});

export default router;
