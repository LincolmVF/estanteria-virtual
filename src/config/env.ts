export const env = {
  apiBase: import.meta.env.VITE_API_URL ?? '/api',
  sensorId: import.meta.env.VITE_SENSOR_ID ?? 'ESP32-HX711-A1',
  iotApiKey: import.meta.env.VITE_IOT_API_KEY ?? '',
};
