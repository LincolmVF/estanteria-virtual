export function calcularStockFisico(pesoBrutoKg: number, pesoUnitarioKg: number): number {
  if (pesoUnitarioKg <= 0) return 0;
  return Math.max(0, Math.round(pesoBrutoKg / pesoUnitarioKg));
}
