export function monthlyPayment(monto, tasaAnualPercent, meses) {
  const r = (tasaAnualPercent / 100) / 12;
  if (r === 0) return monto / meses;
  return monto * (r / (1 - Math.pow(1 + r, -meses)));
}

// opcional: redondear a 2 decimales si quieres igual que el front
export function round2(x) {
  return Math.round(x * 100) / 100;
}