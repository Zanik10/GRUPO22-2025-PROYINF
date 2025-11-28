// apps/server/src/routes/loans.js
import { Router } from 'express'
import { pool } from '../db.js'
import { authGuard } from '../helpers/auth.js'

const router = Router()
router.use(authGuard)

// Crear solicitud de préstamo
router.post('/request', async (req, res) => {
  try {
    const usuarioId = req.user.sub
    const { simulacionId } = req.body

    if (!simulacionId) {
      return res.status(400).json({ error: 'simulacionId es requerido' })
    }

    // 1. Verificar que la simulación exista y sea del usuario
    const simQ = `SELECT * FROM simulaciones WHERE id=$1 AND usuario_id=$2`
    const { rows: simRows } = await pool.query(simQ, [simulacionId, usuarioId])
    if (simRows.length === 0) {
      return res.status(404).json({ error: 'Simulación no encontrada' })
    }

    // 2. Verificar que no exista ya una solicitud con esa simulación
    const checkQ = `
      SELECT * FROM solicitudes_prestamo
      WHERE simulacion_id=$1 AND usuario_id=$2
    `
    const { rows: existing } = await pool.query(checkQ, [simulacionId, usuarioId])
    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Ya existe una solicitud para esta simulación'
      })
    }

    // 3. Crear solicitud
    const insertQ = `
      INSERT INTO solicitudes_prestamo (usuario_id, simulacion_id)
      VALUES ($1, $2)
      RETURNING *
    `
    const { rows } = await pool.query(insertQ, [usuarioId, simulacionId])

    return res.status(201).json(rows[0])
  } catch (error) {
    console.error('Error en POST /api/loans/request:', error)
    res.status(500).json({ error: 'Error interno' })
  }
})

// Obtener mis solicitudes
router.get('/mine', async (req, res) => {
  try {
    const usuarioId = req.user.sub

    const q = `
      SELECT sp.*, s.monto, s.tasa_anual, s.plazo_meses, s.cuota_mensual, s.total_pagar
      FROM solicitudes_prestamo sp
      JOIN simulaciones s ON sp.simulacion_id = s.id
      WHERE sp.usuario_id = $1
      ORDER BY sp.created_at DESC
    `

    const { rows } = await pool.query(q, [usuarioId])
    res.json(rows)
  } catch (error) {
    console.error('Error en GET /api/loans/mine:', error)
    res.status(500).json({ error: 'Error interno' })
  }
})

// Obtener detalle de solicitud
router.get('/:id', async (req, res) => {
  try {
    const usuarioId = req.user.sub
    const solicitudId = req.params.id

    const q = `
      SELECT sp.*, s.*
      FROM solicitudes_prestamo sp
      JOIN simulaciones s ON sp.simulacion_id = s.id
      WHERE sp.id = $1 AND sp.usuario_id = $2
    `
    const { rows } = await pool.query(q, [solicitudId, usuarioId])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Error en GET /api/loans/:id:', error)
    res.status(500).json({ error: 'Error interno' })
  }
})

export default router
