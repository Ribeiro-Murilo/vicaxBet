import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { entrar, cadastrar, user } = useAuth();
  const nav = useNavigate();
  const [modo, setModo] = useState('entrar');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  if (user) {
    nav('/');
  }

  async function submit(e) {
    e.preventDefault();
    setErro('');
    try {
      if (modo === 'entrar') await entrar(username, password);
      else await cadastrar(username, password);
      nav('/');
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="logo grande">vicaxBet</h1>
        <p className="slogan">A unica bet onde voce so perde tempo, nao dinheiro</p>
        <div className="tabs">
          <button className={modo === 'entrar' ? 'ativo' : ''} onClick={() => setModo('entrar')}>
            Entrar
          </button>
          <button className={modo === 'cadastrar' ? 'ativo' : ''} onClick={() => setModo('cadastrar')}>
            Cadastrar
          </button>
        </div>
        <form onSubmit={submit}>
          <input
            placeholder="Usuario da firma"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha (qualquer uma serve, e brincadeira)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {erro ? <div className="erro">{erro}</div> : null}
          <button type="submit" className="btn-grande">
            {modo === 'entrar' ? 'Apostar minha dignidade' : 'Criar conta na firma'}
          </button>
        </form>
        <p className="dica">Admin de teste: admin / admin</p>
      </div>
    </div>
  );
}
