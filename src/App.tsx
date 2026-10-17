import { Shelf } from './components/shelf/Shelf';
import { ScaleDisplay } from './components/shelf/ScaleDisplay';
import { ControlPanel } from './components/controls/ControlPanel';
import { RequestLog } from './components/log/RequestLog';
import { useShelf, PESO_UNITARIO_KG, UMBRAL_MINIMO, CAPACIDAD } from './hooks/useShelf';

export default function App() {
  const s = useShelf();
  const ultima = s.entradas[0];
  const estado = !s.enPeligro
    ? 'Stock normal'
    : ultima ? `Señal enviada (${ultima.status || 'sin red'})` : 'Peso crítico';

  return (
    <main className="app">
      <header className="cabecera">
        <h1>Estantería virtual</h1>
        <p className={`insignia ${s.enPeligro ? 'insignia--peligro' : ''}`}>{estado}</p>
      </header>
      <div className="rejilla">
        <div className="escena">
          <Shelf cajas={s.cajas} peligro={s.enPeligro} />
          <ScaleDisplay pesoKg={s.pesoKg} pesoMaxKg={CAPACIDAD * PESO_UNITARIO_KG}
            pesoPeligroKg={(UMBRAL_MINIMO + 0.5) * PESO_UNITARIO_KG} peligro={s.enPeligro} />
        </div>
        <div className="lateral">
          <ControlPanel producto={s.producto} onProducto={s.setProducto} auto={s.auto} onAuto={s.setAuto}
            enviando={s.enviando} puedeSacar={s.puedeSacar} puedeReponer={s.puedeReponer}
            onSacar={s.sacarCaja} onReponer={s.reponerCaja} onEnviar={s.enviarAhora} />
          <h2>Respuestas del backend</h2>
          <RequestLog entradas={s.entradas} />
        </div>
      </div>
    </main>
  );
}
