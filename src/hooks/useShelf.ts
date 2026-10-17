import { useEffect, useRef, useState } from 'react';
import { env } from '../config/env';
import { construirPayload } from '../core/payload';
import { enviarAlertaStock } from '../services/iotApi';
import { useRequestLog } from './useRequestLog';

export interface Caja { id: number; saliendo: boolean }

export const PESO_UNITARIO_KG = 0.5;
export const UMBRAL_MINIMO = 1;
export const CAJAS_INICIALES = 5;
export const CAPACIDAD = 8;

let siguienteId = 0;
const crearCajas = (n: number): Caja[] =>
  Array.from({ length: n }, () => ({ id: siguienteId++, saliendo: false }));

export function useShelf() {
  const [cajas, setCajas] = useState<Caja[]>(() => crearCajas(CAJAS_INICIALES));
  const [producto, setProducto] = useState('Mouse inalámbrico');
  const [auto, setAuto] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [ruido, setRuido] = useState(0);
  const yaAvisado = useRef(false);
  const { entradas, agregar } = useRequestLog();

  const unidades = cajas.filter((c) => !c.saliendo).length;
  const pesoKg = Math.max(0, Math.round((unidades * PESO_UNITARIO_KG + ruido) * 1000) / 1000);
  const enPeligro = unidades <= UMBRAL_MINIMO;

  useEffect(() => {
    const t = setInterval(() => setRuido((Math.random() * 2 - 1) * 0.02), 700);
    return () => clearInterval(t);
  }, []);

  const enviar = async (u: number) => {
    setEnviando(true);
    const payload = construirPayload({
      sensorId: env.sensorId, producto, unidades: u,
      pesoUnitarioKg: PESO_UNITARIO_KG, umbralMinimo: UMBRAL_MINIMO,
    });
    const r = await enviarAlertaStock(payload);
    agregar({ ...r, producto, stockFisico: payload.stockFisico });
    setEnviando(false);
  };

  const sacarCaja = () => {
    const objetivo = [...cajas].reverse().find((c) => !c.saliendo);
    if (!objetivo) return;
    setCajas((p) => p.map((c) => (c.id === objetivo.id ? { ...c, saliendo: true } : c)));
    setTimeout(() => setCajas((p) => p.filter((c) => c.id !== objetivo.id)), 500);
    const restantes = unidades - 1;
    if (auto && restantes <= UMBRAL_MINIMO && !yaAvisado.current) {
      yaAvisado.current = true;
      void enviar(restantes);
    }
  };

  const reponerCaja = () => {
    if (cajas.length >= CAPACIDAD) return;
    setCajas((p) => [...p, ...crearCajas(1)]);
    if (unidades + 1 > UMBRAL_MINIMO) yaAvisado.current = false;
  };

  return {
    cajas, unidades, pesoKg, enPeligro, producto, setProducto, auto, setAuto,
    enviando, entradas, sacarCaja, reponerCaja, enviarAhora: () => enviar(unidades),
    puedeSacar: unidades > 0, puedeReponer: cajas.length < CAPACIDAD,
  };
}
