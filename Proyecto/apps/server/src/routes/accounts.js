import { Router } from "express";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { authGuard } from "../helpers/auth.js";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

router.get("/me", authGuard, async (req, res) => {
  const userId = req.user.sub;

  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true, type: true, currency: true }
  });

  const withBalance = await Promise.all(
    accounts.map(async (a) => {
      const txs = await prisma.transaction.findMany({
        where: { accountId: a.id, isBlocked: false },
        select: { direction: true, amount: true }
      });
      const balance = txs.reduce((acc, t) =>
        acc + Number(t.amount) * (t.direction === "CREDIT" ? 1 : -1), 0);
      return { ...a, availableBalance: balance };
    })
  );

  res.json({ accounts: withBalance });
});

const FakeTxSchema = z.object({
  accountId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
});

router.post("/deposit", authGuard, async (req, res) => {
  const p = FakeTxSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });

  const { accountId, amount, description } = p.data;
  await prisma.transaction.create({
    data: { accountId, amount, direction: "CREDIT", description }
  });
  res.json({ ok: true });
});

router.post("/withdraw", authGuard, async (req, res) => {
  const p = FakeTxSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });

  const { accountId, amount, description } = p.data;
  await prisma.transaction.create({
    data: { accountId, amount, direction: "DEBIT", description }
  });
  res.json({ ok: true });
});

export default router;
