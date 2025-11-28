
import { Router } from 'express'
import { pool } from '../db.js'
import { authGuard } from '../helpers/auth.js'

const router = Router()

function computeSimulation(monto, tasaAnual, plazoMeses) {
  const M = Number(monto)
  const T = Number(tasaAnual)
  const N = Number(plazoMeses)

  if (!Number.isFinite(M) || !Number.isFinite(T) || !Number.isFinite(N)) {
    throw new Error('Parámetros numéricos inválidos')
  }
  if (M <= 0 || N <= 0 || T < 0) {
    throw new Error('Parámetros fuera de rango')
  }

  const r = (T / 100) / 12
  let cuota
  if (r === 0) {
    cuota = M / N
  } else {
    cuota = M * (r / (1 - Math.pow(1 + r, -N)))
  }

  // Trabajamos en pesos enteros
  const cuotaMensual = Math.round(cuota)
  const totalPagar = cuotaMensual * N

  return { cuotaMensual, totalPagar }
}

// Todas las rutas de este router requieren usuario logeado
router.use(authGuard)


router.post('/', async (req, res) => {
  try {
    const { monto, tasaAnual, plazoMeses } = req.body || {}
    const usuarioId = req.user?.sub

    if (!usuarioId) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    if (monto == null || tasaAnual == null || plazoMeses == null) {
      return res.status(400).json({ error: 'Faltan parámetros' })
    }

    const { cuotaMensual, totalPagar } = computeSimulation(monto, tasaAnual, plazoMeses)

    const query = `
      INSERT INTO simulaciones (
        usuario_id,
        monto,
        tasa_anual,
        plazo_meses,
        cuota_mensual,
        total_pagar
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        usuario_id,
        monto,
        tasa_anual,
        plazo_meses,
        cuota_mensual,
        total_pagar,
        created_at
    `

    const values = [
      usuarioId,
      Number(monto),
      Number(tasaAnual),
      Number(plazoMeses),
      cuotaMensual,
      totalPagar
    ]

    const { rows } = await pool.query(query, values)
    const sim = rows[0]

    return res.status(201).json(sim)
  } catch (err) {
    console.error('Error en POST /api/simulations:', err)
    return res.status(500).json({ error: 'Error interno al guardar la simulación' })
  }
})

// GET /api/simulations/mine
router.get('/mine', async (req, res) => {
  try {
    const usuarioId = req.user?.sub

    if (!usuarioId) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const query = `
      SELECT
        id,
        usuario_id,
        monto,
        tasa_anual,
        plazo_meses,
        cuota_mensual,
        total_pagar,
        created_at
      FROM simulaciones
      WHERE usuario_id = $1
      ORDER BY created_at DESC
    `
    const { rows } = await pool.query(query, [usuarioId])

    return res.json(rows)
  } catch (err) {
    console.error('Error en GET /api/simulations/mine:', err)
    return res.status(500).json({ error: 'Error interno al obtener simulaciones' })
  }
})

export default router
