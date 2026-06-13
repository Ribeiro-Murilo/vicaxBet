import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Rankings() {
  const [principal, setPrincipal] = useState([]);
  const [aposta, setAposta] = useState([]);

  useEffect(() => {
    api('/ranking/principal').then(setPrincipal);
    api('/ranking/aposta').then(setAposta);
  }, []);

  return (
    <div className="container">
      <h2>Rankings</h2>
      <div className="rankings-grid">
        <div className="rank-col">
          <h3>Ranking oficial da Copa</h3>
          <p className="ajuda">Por Pontos Principais (placar exato). E o que vale de verdade.</p>
          <ol className="rank-lista">
            {principal.map((u, i) => (
              <li key={u.username} className={i === 0 ? 'lider' : ''}>
                <span>{u.username}</span>
                <span className="pp">{u.pontos_principais} PP</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rank-col">
          <h3>Os viciados em odd</h3>
          <p className="ajuda">Por Pontos de Aposta. Pura sorte e sofrimento, nao vale nada.</p>
          <ol className="rank-lista">
            {aposta.map((u, i) => (
              <li key={u.username} className={i === 0 ? 'lider' : ''}>
                <span>{u.username}</span>
                <span className="pa">{u.pontos_aposta} PA</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
