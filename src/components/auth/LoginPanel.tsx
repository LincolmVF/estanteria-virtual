import { useState, type SyntheticEvent } from 'react';

interface Props {
  mensaje: string;
  onEntrar: (email: string, password: string) => Promise<string | null>;
  onLocal: () => void;
}

export function LoginPanel({ mensaje, onEntrar, onLocal }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: SyntheticEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(await onEntrar(email, password));
    setEnviando(false);
  };

  return (
    <main className="app">
      <h1>Estanterías virtuales</h1>
      <form className="login" onSubmit={(e) => void enviar(e)}>
        <p className="nota">{mensaje} Usa una cuenta del sistema para traer los productos reales.</p>
        <label className="campo">Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        </label>
        <label className="campo">Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {error && <p className="nota" role="alert">{error}</p>}
        <div className="botones">
          <button className="btn btn--principal" type="submit" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
          <button className="btn" type="button" onClick={onLocal}>Usar datos locales</button>
        </div>
      </form>
    </main>
  );
}
