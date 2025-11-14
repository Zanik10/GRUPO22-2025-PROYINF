import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import health from "./routes/health.js";
import loanRoutes from "./routes/loan.js";
import authRoutes from "./routes/auth.js";
import accountRoutes from "./routes/accounts.js";

const app = express();

app.use("/api/loan", loanRoutes);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use("/api", health);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API escuchando en http://localhost:${PORT}`);
});