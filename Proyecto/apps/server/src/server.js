import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import health from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import accountRoutes from "./routes/accounts.js";
import simulationsRouter from './routes/simulations.js'
import loansRouter from './routes/loans.js'
import profileRouter from './routes/profile.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use("/api", health);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use('/api/simulations', simulationsRouter);
app.use('/api/loans', loansRouter)
app.use('/api/profile', profileRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});

console.log("Conectando a base:", process.env.DATABASE_URL);
