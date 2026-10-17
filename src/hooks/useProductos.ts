import { useCallback, useEffect, useState } from 'react';
import { productosLocales } from '../config/estanterias';
import { iniciarSesion, obtenerProductos } from '../services/productsApi';
import type { ProductoBackend } from '../types/product';

export type Origen = 'backend' | 'local';

export type Vista =
  | { tipo: 'cargando' }
  | { tipo: 'sin-sesion'; mensaje: string }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; origen: Origen; productos: ProductoBackend[]; aviso: string | null };

export function useProductos() {
  const [vista, setVista] = useState<Vista>({ tipo: 'cargando' });
  /** Cambia en cada sincronización para que el almacén se vuelva a armar desde cero. */
  const [version, setVersion] = useState(0);

  const cargar = useCallback(async () => {
    const r = await obtenerProductos();
    if (r.ok) {
      setVista({ tipo: 'listo', origen: 'backend', productos: r.productos, aviso: null });
    } else if (r.motivo === 'sin-sesion') {
      setVista({ tipo: 'sin-sesion', mensaje: r.mensaje });
    } else {
      setVista({ tipo: 'error', mensaje: r.mensaje });
    }
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const sincronizar = () => { setVista({ tipo: 'cargando' }); void cargar(); };

  const entrar = async (email: string, password: string): Promise<string | null> => {
    const r = await iniciarSesion(email, password);
    if (!r.ok) return r.mensaje;
    setVista({ tipo: 'cargando' });
    await cargar();
    return null;
  };

  const usarLocales = (aviso: string) => {
    setVista({ tipo: 'listo', origen: 'local', productos: productosLocales(), aviso });
    setVersion((v) => v + 1);
  };

  return { vista, version, sincronizar, entrar, usarLocales };
}
