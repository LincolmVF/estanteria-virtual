export interface EstanteriaConfig {
  id: string;
  sensorId: string;
  producto: string;
  pesoUnitarioKg: number;
  umbralMinimo: number;
  cajasIniciales: number;
}

export const CAPACIDAD = 8;

// Productos que Infotec vende, para que el RPA encuentre resultados.
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
