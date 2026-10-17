import type { ProductoBackend } from '../types/product';

/**
 * Cada estantería es un "slot" físico (sensor + celda de carga). El producto, su stock y su
 * umbral ya NO viven aquí: se leen del backend. Solo se queda lo que el backend no conoce
 * (el peso de una unidad) y una sugerencia de qué producto va en cada slot.
 */
export interface EstanteriaConfig {
  id: string;
  sensorId: string;
  /** Nombre sugerido: se enlaza con el producto del backend cuyo nombre coincida. */
  producto: string;
  pesoUnitarioKg: number;
  /** Solo se usan en modo local (sin backend). */
  umbralMinimo: number;
  cajasIniciales: number;
}

/** Cajas visibles por estantería (el dibujo tiene 8 columnas). */
export const CAPACIDAD = 8;

export const ESTANTERIAS: EstanteriaConfig[] = [
  { id: 'A1', sensorId: 'ESP32-HX711-A1', producto: 'Mouse inalámbrico', pesoUnitarioKg: 0.5, umbralMinimo: 1, cajasIniciales: 5 },
  { id: 'A2', sensorId: 'ESP32-HX711-A2', producto: 'Teclado mecánico', pesoUnitarioKg: 1.2, umbralMinimo: 1, cajasIniciales: 4 },
  { id: 'A3', sensorId: 'ESP32-HX711-A3', producto: 'Audífonos Bluetooth', pesoUnitarioKg: 0.4, umbralMinimo: 2, cajasIniciales: 6 },
  { id: 'A4', sensorId: 'ESP32-HX711-A4', producto: 'Cable HDMI', pesoUnitarioKg: 0.3, umbralMinimo: 2, cajasIniciales: 7 },
  { id: 'B1', sensorId: 'ESP32-HX711-B1', producto: 'Memoria USB 64GB', pesoUnitarioKg: 0.2, umbralMinimo: 1, cajasIniciales: 5 },
  { id: 'B2', sensorId: 'ESP32-HX711-B2', producto: 'Webcam Full HD', pesoUnitarioKg: 0.35, umbralMinimo: 1, cajasIniciales: 4 },
  { id: 'B3', sensorId: 'ESP32-HX711-B3', producto: 'Monitor 24 pulgadas', pesoUnitarioKg: 4, umbralMinimo: 1, cajasIniciales: 3 },
  { id: 'B4', sensorId: 'ESP32-HX711-B4', producto: 'Router WiFi', pesoUnitarioKg: 0.6, umbralMinimo: 2, cajasIniciales: 5 },
];

/** Catálogo de respaldo cuando no hay backend: mismos datos que antes, con la forma del backend. */
export const productosLocales = (): ProductoBackend[] =>
  ESTANTERIAS.map((e, i) => ({
    id: -(i + 1),
    sku: `LOCAL-${e.id}`,
    name: e.producto,
    currentStock: e.cajasIniciales,
    dynamicThreshold: e.umbralMinimo,
  }));
