export interface AlertaStockPayload {
  sensorId: string;
  producto: string;
  pesoBrutoKg: number;
  pesoUnitarioKg: number;
  stockFisico: number;
  umbralMinimo: number;
  timestamp: string;
}
