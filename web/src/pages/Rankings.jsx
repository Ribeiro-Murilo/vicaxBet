import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Rankings() {
  const [principal, setPrincipal] = useState([]);
  const [fichas, setFichas] = useState([]);

  useEffect(() => {
    api('/ranking/principal').then(setPrincipal);
    api('/ranking/fichas').then(setFichas);
  }, []);

  return (
    <div className="container">
      <h2>Rankings</h2>
      <div className="rankings-grid">
        <div className="rank-col">
          <h3>Os que entendem de futebol</h3>
          <p className="ajuda">Ranking por Pontos Principais (palpite na lata).</p>
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
          <p className="ajuda">Ranking por Fichas. Sorte e burrice contam igual.</p>
          <ol className="rank-lista">
            {fichas.map((u, i) => (
              <li key={u.username} className={i === 0 ? 'lider' : ''}>
                <span>{u.username}</span>
                <span className="fa">{u.fichas} FA</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
