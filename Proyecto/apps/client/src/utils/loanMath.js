//calculo no definitivo
export function monthlyPayment(monto, tasaAnualPercent, meses) {
  const r = (tasaAnualPercent / 100) / 12
  if (r === 0) return monto / meses
  return monto * (r / (1 - Math.pow(1 + r, -meses)))
}
export function amortizationSchedule(monto, tasaAnualPercent, meses) {
  const cuota = monthlyPayment(monto, tasaAnualPercent, meses)
  const r = (tasaAnualPercent / 100) / 12
  let saldo = monto; const filas = []
  for (let k = 1; k <= meses; k++) {
    const interes = saldo * r
    const abono = Math.min(cuota - interes, saldo)
    saldo = Math.max(saldo - abono, 0)
    filas.push({ n:k, cuota:round2(cuota), interes:round2(interes), abono:round2(abono), saldo:round2(saldo) })
  }
  const totalInteres = round2(filas.reduce((s, f) => s + f.interes, 0))
  return { cuota: round2(cuota), totalInteres, filas }
}
const round2 = x => Math.round(x * 100) / 100
