import { env } from '../config/env';
import type { AlertaStockPayload } from '../types/iot';

export interface RespuestaIot { status: number; ok: boolean; mensaje: string }

export async function enviarAlertaStock(payload: AlertaStockPayload): Promise<RespuestaIot> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (env.iotApiKey) headers['x-api-key'] = env.iotApiKey;
    const res = await fetch(`${env.apiBase}/iot/alerta-stock`, { method: 'POST', headers, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, mensaje: data.message ?? data.error ?? 'Sin mensaje' };
  } catch {
    return { status: 0, ok: false, mensaje: 'No se pudo conectar con el backend.' };
  }
}
