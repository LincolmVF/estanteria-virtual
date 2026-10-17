import { env } from '../config/env';
import type { ProductoBackend } from '../types/product';

export type ResultadoProductos =
  | { ok: true; productos: ProductoBackend[] }
  | { ok: false; motivo: 'sin-sesion' | 'no-encontrado' | 'red' | 'error'; mensaje: string };

/** El backend usa cookie httpOnly (token); `credentials: 'include'` la envía. */
export async function iniciarSesion(email: string, password: string): Promise<{ ok: boolean; mensaje: string }> {
  try {
    const res = await fetch(`${env.apiBase}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, mensaje: data.message ?? data.error ?? `Error ${res.status}` };
  } catch {
    return { ok: false, mensaje: 'No se pudo conectar con el backend.' };
  }
}

export async function obtenerProductos(): Promise<ResultadoProductos> {
  try {
    const res = await fetch(`${env.apiBase}/products`, { credentials: 'include' });
    if (res.status === 401 || res.status === 403) {
      return { ok: false, motivo: 'sin-sesion', mensaje: 'Inicia sesión para leer los productos.' };
    }
    if (res.status === 404) {
      return { ok: false, motivo: 'no-encontrado', mensaje: 'El backend no expone /api/products (ruta no montada).' };
    }
    if (!res.ok) return { ok: false, motivo: 'error', mensaje: `El backend respondió ${res.status}.` };
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return { ok: false, motivo: 'error', mensaje: 'Respuesta inesperada de /api/products.' };
    return { ok: true, productos: data as ProductoBackend[] };
  } catch {
    return { ok: false, motivo: 'red', mensaje: 'No se pudo conectar con el backend.' };
  }
}
