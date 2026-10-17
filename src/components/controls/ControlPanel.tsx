interface Props {
  producto: string; onProducto: (v: string) => void;
  auto: boolean; onAuto: (v: boolean) => void;
  enviando: boolean; puedeSacar: boolean; puedeReponer: boolean;
  onSacar: () => void; onReponer: () => void; onEnviar: () => void;
}

export function ControlPanel(p: Props) {
  return (
    <section className="panel">
      <label className="campo">Producto
        <input value={p.producto} onChange={(e) => p.onProducto(e.target.value)} />
      </label>
      <div className="botones">
        <button className="btn btn--principal" onClick={p.onSacar} disabled={!p.puedeSacar}>Sacar caja</button>
        <button className="btn" onClick={p.onReponer} disabled={!p.puedeReponer}>Reponer caja</button>
      </div>
      <label className="check">
        <input type="checkbox" checked={p.auto} onChange={(e) => p.onAuto(e.target.checked)} />
        Enviar la señal sola al llegar al peso crítico
      </label>
      <button className="btn" onClick={p.onEnviar} disabled={p.enviando}>
        {p.enviando ? 'Enviando…' : 'Enviar lectura ahora'}
      </button>
    </section>
  );
}
