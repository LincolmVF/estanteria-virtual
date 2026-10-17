import { CAPACIDAD } from '../../config/estanterias';
import type { EstanteriaEstado } from '../../hooks/useAlmacen';
import type { EntradaLog } from '../../hooks/useRequestLog';
import type { ProductoBackend } from '../../types/product';
import { Shelf } from './Shelf';
import { ScaleDisplay } from './ScaleDisplay';

interface Props {
  estado: EstanteriaEstado;
  productos: ProductoBackend[];
  ultima: EntradaLog | undefined;
  onProducto: (productoId: number) => void;
  onSacar: () => void;
  onReponer: () => void;
  onEnviar: () => void;
}

function textoEstado(peligro: boolean, u: EntradaLog | undefined): string {
  if (!peligro) return 'Normal';
  if (!u) return 'Bajo umbral';
  if (u.ok) return `Enviada (${u.status})`;
  if (u.status === 429) return 'Ya cotizando';
  return `Error (${u.status || 'sin red'})`;
}

export function ShelfCard({ estado, productos, ultima, onProducto, onSacar, onReponer, onEnviar }: Props) {
  const { cfg, producto, unidadesPorCaja, umbral } = estado;
  return (
    <article className={`tarjeta ${estado.enPeligro ? 'tarjeta--peligro' : ''}`}>
      <div className="tarjeta__cab">
        <div>
          <select className="tarjeta__nombre" aria-label={`Producto de ${cfg.sensorId}`}
            value={producto?.id ?? ''} onChange={(e) => onProducto(Number(e.target.value))}>
            {producto === null && <option value="" disabled>Sin producto</option>}
            {productos.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <p className="nota">
            {cfg.sensorId}{producto ? ` · ${producto.sku}` : ''} · {unidadesPorCaja} u/caja · umbral {umbral} u · {estado.unidades} u en estante
          </p>
        </div>
        <p className={`insignia ${estado.enPeligro ? 'insignia--peligro' : ''}`}>
          {textoEstado(estado.enPeligro, ultima)}
        </p>
      </div>
      <Shelf cajas={estado.cajas} peligro={estado.enPeligro} />
      <ScaleDisplay pesoKg={estado.pesoKg} pesoMaxKg={CAPACIDAD * unidadesPorCaja * cfg.pesoUnitarioKg}
        pesoPeligroKg={(umbral + 0.5) * cfg.pesoUnitarioKg} peligro={estado.enPeligro} />
      <div className="botones">
        <button className="btn btn--principal" onClick={onSacar} disabled={!producto || estado.unidades === 0}>Sacar caja</button>
        <button className="btn" onClick={onReponer} disabled={!producto || estado.cajas.length >= CAPACIDAD}>Reponer</button>
        <button className="btn" onClick={onEnviar} disabled={!producto || estado.enviando}>
          {estado.enviando ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </article>
  );
}
