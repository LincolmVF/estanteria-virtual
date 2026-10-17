import { useRef, useState } from 'react';
import { construirPayload } from '../core/payload';
import { enviarAlertaStock } from '../services/iotApi';
import { CAPACIDAD, ESTANTERIAS, type EstanteriaConfig } from '../config/estanterias';
import type { ProductoBackend } from '../types/product';
import { useRequestLog } from './useRequestLog';

export interface Caja { id: number; saliendo: boolean }

interface Dato { cfg: EstanteriaConfig; producto: ProductoBackend | null; cajas: Caja[]; enviando: boolean }

export interface EstanteriaEstado extends Dato {
  /** Unidades del backend que representa cada caja dibujada. */
  unidadesPorCaja: number;
  /** Umbral de reorden del producto en el backend (dynamicThreshold), en unidades. */
  umbral: number;
  unidades: number;
  pesoKg: number;
  enPeligro: boolean;
}

let siguienteId = 0;
const crearCajas = (n: number): Caja[] =>
  Array.from({ length: n }, () => ({ id: siguienteId++, saliendo: false }));

/**
 * El dibujo muestra máximo CAPACIDAD cajas. Si el producto tiene más unidades en el backend,
 * cada caja agrupa varias para que el umbral (en unidades) siga siendo el del backend.
 */
export const unidadesPorCaja = (p: ProductoBackend | null): number =>
  p ? Math.max(1, Math.ceil(Math.max(p.currentStock, p.dynamicThreshold * 2) / CAPACIDAD)) : 1;

const cajasPara = (p: ProductoBackend | null): number => {
  if (!p || p.currentStock <= 0) return 0;
  return Math.min(CAPACIDAD, Math.max(1, Math.round(p.currentStock / unidadesPorCaja(p))));
};

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

/** Enlaza cada estantería con un producto del backend: primero por nombre, luego con los que sobren. */
function asignar(productos: ProductoBackend[]): Dato[] {
  const usados = new Set<number>();
  const porNombre = ESTANTERIAS.map((cfg) => {
    const n = norm(cfg.producto);
    const libre = (p: ProductoBackend) => !usados.has(p.id);
    const p =
      productos.find((x) => libre(x) && norm(x.name) === n) ??
      productos.find((x) => libre(x) && (norm(x.name).includes(n) || n.includes(norm(x.name))));
    if (p) usados.add(p.id);
    return p ?? null;
  });
  return ESTANTERIAS.map((cfg, i) => {
    let producto = porNombre[i] ?? null;
    if (!producto) {
      producto = productos.find((x) => !usados.has(x.id)) ?? null;
      if (producto) usados.add(producto.id);
    }
    return { cfg, producto, cajas: crearCajas(cajasPara(producto)), enviando: false };
  });
}

export function useAlmacen(productos: ProductoBackend[]) {
  const [datos, setDatos] = useState<Dato[]>(() => asignar(productos));
  const [auto, setAuto] = useState(true);
  const [ruidos, setRuidos] = useState<number[]>(() => ESTANTERIAS.map(() => 0));
  const avisadas = useRef(new Set<string>());
  const { entradas, agregar } = useRequestLog();

  // Ruido de la celda de carga (se actualiza desde un temporizador, ver Almacen.tsx)
  const refrescarRuido = () => setRuidos(ESTANTERIAS.map(() => (Math.random() * 2 - 1) * 0.02));

  const actualizar = (i: number, fn: (d: Dato) => Dato) =>
    setDatos((p) => p.map((d, k) => (k === i ? fn(d) : d)));

  const estados: EstanteriaEstado[] = datos.map((d, i) => {
    const n = unidadesPorCaja(d.producto);
    const unidades = d.cajas.filter((c) => !c.saliendo).length * n;
    const umbral = d.producto?.dynamicThreshold ?? 0;
    const bruto = unidades * d.cfg.pesoUnitarioKg + (ruidos[i] ?? 0);
    return {
      ...d, unidadesPorCaja: n, umbral, unidades,
      pesoKg: Math.max(0, Math.round(bruto * 1000) / 1000),
      enPeligro: d.producto !== null && unidades <= umbral,
    };
  });

  const enviar = async (i: number, d: Dato, unidades: number) => {
    if (!d.producto) return;
    actualizar(i, (x) => ({ ...x, enviando: true }));
    const payload = construirPayload({
      sensorId: d.cfg.sensorId,
      producto: d.producto.name, // el backend busca el producto por nombre
      unidades,
      pesoUnitarioKg: d.cfg.pesoUnitarioKg,
      umbralMinimo: d.producto.dynamicThreshold,
    });
    const r = await enviarAlertaStock(payload);
    agregar({ ...r, sensorId: d.cfg.sensorId, producto: d.producto.name, stockFisico: payload.stockFisico });
    actualizar(i, (x) => ({ ...x, enviando: false }));
  };

  const sacarCaja = (i: number) => {
    const d = datos[i];
    const objetivo = d && [...d.cajas].reverse().find((c) => !c.saliendo);
    if (!d || !objetivo || !d.producto) return;
    actualizar(i, (x) => ({ ...x, cajas: x.cajas.map((c) => (c.id === objetivo.id ? { ...c, saliendo: true } : c)) }));
    setTimeout(() => actualizar(i, (x) => ({ ...x, cajas: x.cajas.filter((c) => c.id !== objetivo.id) })), 500);
    const restantes = (d.cajas.filter((c) => !c.saliendo).length - 1) * unidadesPorCaja(d.producto);
    if (auto && restantes <= d.producto.dynamicThreshold && !avisadas.current.has(d.cfg.id)) {
      avisadas.current.add(d.cfg.id);
      void enviar(i, d, restantes);
    }
  };

  const reponerCaja = (i: number) => {
    const d = datos[i];
    if (!d || !d.producto || d.cajas.length >= CAPACIDAD) return;
    actualizar(i, (x) => ({ ...x, cajas: [...x.cajas, ...crearCajas(1)] }));
    const unidades = (d.cajas.filter((c) => !c.saliendo).length + 1) * unidadesPorCaja(d.producto);
    if (unidades > d.producto.dynamicThreshold) avisadas.current.delete(d.cfg.id);
  };

  const enviarAhora = (i: number) => {
    const d = datos[i];
    if (d) void enviar(i, d, d.cajas.filter((c) => !c.saliendo).length * unidadesPorCaja(d.producto));
  };

  /** Cambia el producto de la estantería: se reinician sus cajas con el stock que tiene en el backend. */
  const setProducto = (i: number, productoId: number) => {
    const producto = productos.find((p) => p.id === productoId);
    const d = datos[i];
    if (!producto || !d) return;
    avisadas.current.delete(d.cfg.id);
    actualizar(i, (x) => ({ ...x, producto, cajas: crearCajas(cajasPara(producto)), enviando: false }));
  };

  const reiniciarTodo = () => {
    avisadas.current.clear();
    setDatos(asignar(productos));
  };

  return { estados, auto, setAuto, entradas, refrescarRuido, sacarCaja, reponerCaja, enviarAhora, setProducto, reiniciarTodo };
}
