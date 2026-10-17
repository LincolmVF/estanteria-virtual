import { useState } from 'react';
import type { RespuestaIot } from '../services/iotApi';

export interface EntradaLog extends RespuestaIot {
  id: number;
  hora: string;
  producto: string;
  stockFisico: number;
}

export function useRequestLog() {
  const [entradas, setEntradas] = useState<EntradaLog[]>([]);
  const agregar = (e: Omit<EntradaLog, 'id' | 'hora'>) =>
    setEntradas((prev) =>
      [{ ...e, id: Date.now() + Math.random(), hora: new Date().toLocaleTimeString() }, ...prev].slice(0, 20),
    );
  return { entradas, agregar };
}
