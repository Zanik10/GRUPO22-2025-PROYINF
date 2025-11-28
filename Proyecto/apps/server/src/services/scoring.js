// apps/server/src/services/scoring.js
export const SALARIO_MINIMO = 500000; // TODO: ajusta al valor que quieras o muévelo a env

function subScoreRCI(cuotaMensual, salario) {
  if (!salario || salario <= 0) return 0;
  const rci = (cuotaMensual / salario) * 100;

  if (rci <= 25) return 100;
  if (rci <= 35) return 80;
  if (rci <= 45) return 60;
  if (rci <= 55) return 30;
  return 0;
}

function subScoreIngreso(salario) {
  if (!salario || salario <= 0) return 10;
  const R = salario / SALARIO_MINIMO;

  if (R >= 4) return 100;
  if (R >= 3) return 80;
  if (R >= 2) return 60;
  if (R >= 1) return 40;
  return 10;
}

function subScoreEstabilidad(antiguedadMeses) {
  const m = antiguedadMeses || 0;
  const años = m / 12;

  if (años >= 5) return 100;
  if (años >= 2) return 80;
  if (años >= 1) return 60;
  if (m >= 6) return 40;
  return 10;
}

function subScoreDeuda(tieneDeuda) {
  return tieneDeuda ? 60 : 100;
}

/**
 * Calcula el score y la decisión de aprobación/rechazo.
 *
 * @param {Object} params
 * @param {number} params.cuotaMensual
 * @param {number} params.salario
 * @param {number} params.antiguedadLaboralMeses
 * @param {boolean} params.tieneDeuda
 * @returns {{
 *   score: number,
 *   estado: 'APROBADO' | 'RECHAZADO',
 *   motivoRechazo: string | null,
 *   detalle: {
 *     S_RCI: number,
 *     S_ING: number,
 *     S_EST: number,
 *     S_DEU: number
 *   }
 * }}
 */
export function calculateScore({
  cuotaMensual,
  salario,
  antiguedadLaboralMeses,
  tieneDeuda,
}) {
  const S_RCI = subScoreRCI(cuotaMensual, salario);
  const S_ING = subScoreIngreso(salario);
  const S_EST = subScoreEstabilidad(antiguedadLaboralMeses);
  const S_DEU = subScoreDeuda(tieneDeuda);

  const rawScore =
    0.40 * S_RCI +
    0.30 * S_ING +
    0.20 * S_EST +
    0.10 * S_DEU;

  const score = Math.round(rawScore * 100) / 100; // 2 decimales

  let estado = 'RECHAZADO';
  let motivoRechazo = null;

  if (score >= 80) {
    estado = 'APROBADO';
    motivoRechazo = null;
  } else if (score >= 60) {
    estado = 'RECHAZADO';
    motivoRechazo = 'Score insuficiente (riesgo medio)';
  } else {
    estado = 'RECHAZADO';
    motivoRechazo = 'Score insuficiente (riesgo alto)';
  }

  return {
    score,
    estado,
    motivoRechazo,
    detalle: { S_RCI, S_ING, S_EST, S_DEU },
  };
}
