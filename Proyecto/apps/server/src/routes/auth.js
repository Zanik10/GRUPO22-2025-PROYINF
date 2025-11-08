import { Router } from "express";
import { z } from "zod";
import argon2 from "argon2";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { signJWT } from "../helpers/auth.js";

const prisma = new PrismaClient();
const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).optional(),
});


router.post("/register", async (req, res) => {
  const p = RegisterSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });

  const { email, password, fullName } = p.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "Email ya registrado" });

  const passwordHash = await argon2.hash(password);

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({ data: { email, passwordHash, fullName } });
    await tx.account.create({ data: { userId: u.id, type: "CHECKING", currency: "CLP" } });
    return u;
  });

  const token = signJWT({ sub: user.id, email: user.email });
  res
    .cookie("token", token, { httpOnly: true, sameSite: "lax", secure: false })
    .json({ ok: true });
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});


router.post("/login", async (req, res) => {
  const p = LoginSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });

  const { email, password } = p.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = signJWT({ sub: user.id, email: user.email });
  res
    .cookie("token", token, { httpOnly: true, sameSite: "lax", secure: false })
    .json({ ok: true });
});


router.post("/logout", (_req, res) => {
  res.clearCookie("token").json({ ok: true });
});

export default router;
