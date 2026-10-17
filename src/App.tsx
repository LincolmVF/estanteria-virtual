import { Almacen } from './components/almacen/Almacen';
import { LoginPanel } from './components/auth/LoginPanel';
import { useProductos } from './hooks/useProductos';

export default function App() {
  const p = useProductos();
  const { vista } = p;

  if (vista.tipo === 'cargando') {
    return <main className="app"><p className="nota">Cargando productos del backend…</p></main>;
  }
  if (vista.tipo === 'sin-sesion') {
    return (
      <LoginPanel mensaje={vista.mensaje} onEntrar={p.entrar}
        onLocal={() => p.usarLocales('Sin sesión: se usan datos locales.')} />
    );
  }
  if (vista.tipo === 'error') {
    return (
      <main className="app">
        <h1>Estanterías virtuales</h1>
        <p className="nota" role="alert">{vista.mensaje}</p>
        <div className="botones">
          <button className="btn btn--principal" onClick={p.sincronizar}>Reintentar</button>
          <button className="btn" onClick={() => p.usarLocales(`${vista.mensaje} Se usan datos locales.`)}>Usar datos locales</button>
        </div>
      </main>
    );
  }
  return (
    <Almacen key={p.version} productos={vista.productos} origen={vista.origen}
      aviso={vista.aviso} onSincronizar={p.sincronizar} />
  );
}
