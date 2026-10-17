import { ShelfCard } from './components/shelf/ShelfCard';
import { RequestLog } from './components/log/RequestLog';
import { ESTANTERIAS } from './config/estanterias';
import { useAlmacen } from './hooks/useAlmacen';

export default function App() {
  const a = useAlmacen();
  const criticas = a.estados.filter((e) => e.enPeligro).length;

  return (
    <main className="app">
      <header className="cabecera">
        <h1>Estanterías virtuales</h1>
        <div className="resumen">
          <label className="check">
            <input type="checkbox" checked={a.auto} onChange={(e) => a.setAuto(e.target.checked)} />
            Enviar señales solas
          </label>
          <button className="btn" onClick={a.reiniciarTodo}>Reiniciar todas</button>
          <p className={`insignia ${criticas > 0 ? 'insignia--peligro' : ''}`}>
            {criticas} de {ESTANTERIAS.length} en peso crítico
          </p>
        </div>
      </header>
      <div className="rejilla">
        {a.estados.map((e, i) => (
          <ShelfCard key={e.cfg.id} estado={e}
            ultima={a.entradas.find((x) => x.sensorId === e.cfg.sensorId)}
            onProducto={(v) => a.setProducto(i, v)} onSacar={() => a.sacarCaja(i)}
            onReponer={() => a.reponerCaja(i)} onEnviar={() => a.enviarAhora(i)} />
        ))}
      </div>
      <h2 className="seccion">Respuestas del backend</h2>
      <RequestLog entradas={a.entradas} />
    </main>
  );
}
