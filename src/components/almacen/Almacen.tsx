import { useEffect } from 'react';
import { ShelfCard } from '../shelf/ShelfCard';
import { RequestLog } from '../log/RequestLog';
import { ESTANTERIAS } from '../../config/estanterias';
import { useAlmacen } from '../../hooks/useAlmacen';
import type { Origen } from '../../hooks/useProductos';
import type { ProductoBackend } from '../../types/product';

interface Props {
  productos: ProductoBackend[];
  origen: Origen;
  aviso: string | null;
  onSincronizar: () => void;
}

export function Almacen({ productos, origen, aviso, onSincronizar }: Props) {
  const a = useAlmacen(productos);
  const criticas = a.estados.filter((e) => e.enPeligro).length;

  const { refrescarRuido } = a;
  useEffect(() => {
    const t = setInterval(refrescarRuido, 700);
    return () => clearInterval(t);
  }, [refrescarRuido]);

  return (
    <main className="app">
      <header className="cabecera">
        <div>
          <h1>Estanterías virtuales</h1>
          <p className="nota">
            {origen === 'backend' ? `Productos del backend (${productos.length})` : 'Modo local: sin conexión al backend'}
            {aviso ? ` · ${aviso}` : ''}
          </p>
        </div>
        <div className="resumen">
          <label className="check">
            <input type="checkbox" checked={a.auto} onChange={(e) => a.setAuto(e.target.checked)} />
            Enviar señales solas
          </label>
          <button className="btn" onClick={onSincronizar}>Sincronizar con backend</button>
          <button className="btn" onClick={a.reiniciarTodo}>Reiniciar todas</button>
          <p className={`insignia ${criticas > 0 ? 'insignia--peligro' : ''}`}>
            {criticas} de {ESTANTERIAS.length} bajo umbral
          </p>
        </div>
      </header>
      <div className="rejilla">
        {a.estados.map((e, i) => (
          <ShelfCard key={e.cfg.id} estado={e} productos={productos}
            ultima={a.entradas.find((x) => x.sensorId === e.cfg.sensorId)}
            onProducto={(id) => a.setProducto(i, id)} onSacar={() => a.sacarCaja(i)}
            onReponer={() => a.reponerCaja(i)} onEnviar={() => a.enviarAhora(i)} />
        ))}
      </div>
      <h2 className="seccion">Respuestas del backend</h2>
      <RequestLog entradas={a.entradas} />
    </main>
  );
}
