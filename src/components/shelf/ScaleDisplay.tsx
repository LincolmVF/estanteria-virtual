interface Props { pesoKg: number; pesoMaxKg: number; pesoPeligroKg: number; peligro: boolean }

export function ScaleDisplay({ pesoKg, pesoMaxKg, pesoPeligroKg, peligro }: Props) {
  const nivel = Math.min(100, (pesoKg / pesoMaxKg) * 100);
  const zona = (pesoPeligroKg / pesoMaxKg) * 100;
  return (
    <div className="balanza">
      <div className={`balanza__valor ${peligro ? 'is-peligro' : ''}`}>
        {pesoKg.toFixed(3)}<small> kg</small>
      </div>
      <div className="balanza__barra" role="meter" aria-label="Peso sobre la estantería"
        aria-valuenow={pesoKg} aria-valuemin={0} aria-valuemax={pesoMaxKg}>
        <div className="balanza__zona" style={{ width: `${zona}%` }} />
        <div className="balanza__nivel" style={{ width: `${nivel}%` }} />
      </div>
      <p className="nota">Peso crítico: menos de {pesoPeligroKg.toFixed(2)} kg</p>
    </div>
  );
}
