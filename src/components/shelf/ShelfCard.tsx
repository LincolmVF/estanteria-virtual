import { CAPACIDAD } from '../../config/estanterias';
import type { EstanteriaEstado } from '../../hooks/useAlmacen';
import type { EntradaLog } from '../../hooks/useRequestLog';
import { Shelf } from './Shelf';
import { ScaleDisplay } from './ScaleDisplay';

interface Props {
  estado: EstanteriaEstado;
  ultima: EntradaLog | undefined;
  onProducto: (v: string) => void;
  onSacar: () => void;
  onReponer: () => void;
  onEnviar: () => void;
}

function textoEstado(peligro: boolean, u: EntradaLog | undefined): string {
  if (!peligro) return 'Normal';
  if (!u) return 'Peso crítico';
  if (u.ok) return `Enviada (${u.status})`;
  if (u.status === 429) return 'Ya cotizando';
  return `Error (${u.status || 'sin red'})`;
}

export function ShelfCard({ estado, ultima, onProducto, onSacar, onReponer, onEnviar }: Props) {
  const { cfg } = estado;
  return (
    <article className={`tarjeta ${estado.enPeligro ? 'tarjeta--peligro' : ''}`}>
      <div className="tarjeta__cab">
        <div>
          <input className="tarjeta__nombre" aria-label={`Producto de ${cfg.sensorId}`}
            value={estado.producto} onChange={(e) => onProducto(e.target.value)} />
          <p className="nota">{cfg.sensorId} · {cfg.pesoUnitarioKg} kg por caja</p>
        </div>
        <p className={`insignia ${estado.enPeligro ? 'insignia--peligro' : ''}`}>
          {textoEstado(estado.enPeligro, ultima)}
        </p>
      </div>
      <Shelf cajas={estado.cajas} peligro={estado.enPeligro} />
      <ScaleDisplay pesoKg={estado.pesoKg} pesoMaxKg={CAPACIDAD * cfg.pesoUnitarioKg}
        pesoPeligroKg={(cfg.umbralMinimo + 0.5) * cfg.pesoUnitarioKg} peligro={estado.enPeligro} />
      <div className="botones">
        <button className="btn btn--principal" onClick={onSacar} disabled={estado.unidades === 0}>Sacar</button>
        <button className="btn" onClick={onReponer} disabled={estado.cajas.length >= CAPACIDAD}>Reponer</button>
        <button className="btn" onClick={onEnviar} disabled={estado.enviando}>
          {estado.enviando ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </article>
  );
}
