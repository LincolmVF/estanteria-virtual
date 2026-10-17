import type { AlertaStockPayload } from '../types/iot';
import { leerPesoBruto } from './loadCell';
import { calcularStockFisico } from './stock';

interface Params { sensorId: string; producto: string; unidades: number; pesoUnitarioKg: number; umbralMinimo: number }

export function construirPayload(p: Params): AlertaStockPayload {
  const pesoBrutoKg = leerPesoBruto(p.unidades, p.pesoUnitarioKg);
  return {
    sensorId: p.sensorId, producto: p.producto, pesoBrutoKg,
    pesoUnitarioKg: p.pesoUnitarioKg,
    stockFisico: calcularStockFisico(pesoBrutoKg, p.pesoUnitarioKg),
    umbralMinimo: p.umbralMinimo, timestamp: new Date().toISOString(),
  };
}
