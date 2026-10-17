import type { EntradaLog } from '../../hooks/useRequestLog';

const clase = (s: number) => (s >= 200 && s < 300 ? 'ok' : s === 429 ? 'aviso' : 'error');

export function RequestLog({ entradas }: { entradas: EntradaLog[] }) {
  if (entradas.length === 0)
    return <p className="nota">Aún no se envió ninguna señal. Saca cajas hasta llegar al peso crítico.</p>;
  return (
    <ul className="log">
      {entradas.map((e) => (
        <li key={e.id}>
          <span className={`estado estado--${clase(e.status)}`}>{e.status || 'sin red'}</span>
          <span className="log__texto">{e.mensaje}</span>
          <span className="nota">{e.hora} · stock {e.stockFisico}</span>
        </li>
      ))}
    </ul>
  );
}
