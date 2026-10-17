const redondear3 = (n: number) => Math.round(n * 1000) / 1000;
export function leerPesoBruto(unidades: number, pesoUnitarioKg: number, ruidoKg = 0.02): number {
  const ruido = (Math.random() * 2 - 1) * ruidoKg;
  return Math.max(0, redondear3(unidades * pesoUnitarioKg + ruido));
}
