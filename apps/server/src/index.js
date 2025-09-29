import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/health', async (req, res) => {
  try {
    const r = await pool.query('SELECT 1 as ok');
    res.json({ api: 'ok', db: r.rows[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ api: 'ok', db: false, error: e.message });
  }
});

app.get('/loans', (req, res) => res.json([]));

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
