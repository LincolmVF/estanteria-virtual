import { useEffect, useRef, useState } from 'react';
import { construirPayload } from '../core/payload';
import { enviarAlertaStock } from '../services/iotApi';
import { CAPACIDAD, ESTANTERIAS, type EstanteriaConfig } from '../config/estanterias';
import { useRequestLog } from './useRequestLog';

export interface Caja { id: number; saliendo: boolean }

interface Dato { cfg: EstanteriaConfig; producto: string; cajas: Caja[]; enviando: boolean }

export interface EstanteriaEstado extends Dato {
  unidades: number;
  pesoKg: number;
  enPeligro: boolean;
}

let siguienteId = 0;
const crearCajas = (n: number): Caja[] =>
  Array.from({ length: n }, () => ({ id: siguienteId++, saliendo: false }));

const inicial = (): Dato[] =>
  ESTANTERIAS.map((cfg) => ({ cfg, producto: cfg.producto, cajas: crearCajas(cfg.cajasIniciales), enviando: false }));

export function useAlmacen() {
  const [datos, setDatos] = useState<Dato[]>(inicial);
  const [auto, setAuto] = useState(true);
  const [ruidos, setRuidos] = useState<number[]>(() => ESTANTERIAS.map(() => 0));
  const avisadas = useRef(new Set<string>());
  const { entradas, agregar } = useRequestLog();

  useEffect(() => {
    const t = setInterval(
      () => setRuidos(ESTANTERIAS.map(() => (Math.random() * 2 - 1) * 0.02)),
      700,
    );
    return () => clearInterval(t);
  }, []);

  const actualizar = (i: number, fn: (d: Dato) => Dato) =>
    setDatos((p) => p.map((d, k) => (k === i ? fn(d) : d)));

  const estados: EstanteriaEstado[] = datos.map((d, i) => {
    const unidades = d.cajas.filter((c) => !c.saliendo).length;
    const bruto = unidades * d.cfg.pesoUnitarioKg + (ruidos[i] ?? 0);
    return { ...d, unidades, pesoKg: Math.max(0, Math.round(bruto * 1000) / 1000), enPeligro: unidades <= d.cfg.umbralMinimo };
  });

  const enviar = async (i: number, d: Dato, unidades: number) => {
    actualizar(i, (x) => ({ ...x, enviando: true }));
    const payload = construirPayload({
      sensorId: d.cfg.sensorId, producto: d.producto, unidades,
      pesoUnitarioKg: d.cfg.pesoUnitarioKg, umbralMinimo: d.cfg.umbralMinimo,
    });
    const r = await enviarAlertaStock(payload);
    agregar({ ...r, sensorId: d.cfg.sensorId, producto: d.producto, stockFisico: payload.stockFisico });
    actualizar(i, (x) => ({ ...x, enviando: false }));
  };

  const sacarCaja = (i: number) => {
    const d = datos[i];
    const objetivo = d && [...d.cajas].reverse().find((c) => !c.saliendo);
    if (!d || !objetivo) return;
    actualizar(i, (x) => ({ ...x, cajas: x.cajas.map((c) => (c.id === objetivo.id ? { ...c, saliendo: true } : c)) }));
    setTimeout(() => actualizar(i, (x) => ({ ...x, cajas: x.cajas.filter((c) => c.id !== objetivo.id) })), 500);
    const restantes = d.cajas.filter((c) => !c.saliendo).length - 1;
    if (auto && restantes <= d.cfg.umbralMinimo && !avisadas.current.has(d.cfg.id)) {
      avisadas.current.add(d.cfg.id);
      void enviar(i, d, restantes);
    }
  };

  const reponerCaja = (i: number) => {
    const d = datos[i];
    if (!d || d.cajas.length >= CAPACIDAD) return;
    actualizar(i, (x) => ({ ...x, cajas: [...x.cajas, ...crearCajas(1)] }));
    if (d.cajas.filter((c) => !c.saliendo).length + 1 > d.cfg.umbralMinimo) avisadas.current.delete(d.cfg.id);
  };

  const enviarAhora = (i: number) => {
    const d = datos[i];
    if (d) void enviar(i, d, d.cajas.filter((c) => !c.saliendo).length);
  };

  const setProducto = (i: number, producto: string) => actualizar(i, (x) => ({ ...x, producto }));

  const reiniciarTodo = () => {
    avisadas.current.clear();
    setDatos(inicial());
  };

  return { estados, auto, setAuto, entradas, sacarCaja, reponerCaja, enviarAhora, setProducto, reiniciarTodo };
}
