export function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(value);
}

export function toNumber(val: unknown) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}
