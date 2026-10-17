import type { Caja } from '../../hooks/useShelf';

interface Props { cajas: Caja[]; peligro: boolean }

export function Shelf({ cajas, peligro }: Props) {
  const n = cajas.filter((c) => !c.saliendo).length;
  return (
    <div className={`estante ${peligro ? 'estante--peligro' : ''}`} role="img" aria-label={`Estantería con ${n} cajas`}>
      <div className={`baliza ${peligro ? 'baliza--activa' : ''}`} />
      <div className="estante__fila">
        {cajas.map((c) => (
          <div key={c.id} className={`caja ${c.saliendo ? 'caja--sale' : ''}`} />
        ))}
      </div>
      <div className="estante__tabla"><span>celda de carga HX711</span></div>
      <div className="estante__patas" />
    </div>
  );
}
