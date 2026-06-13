import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Rankings() {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    api('/ranking').then(setRanking);
  }, []);

  return (
    <div className="container">
      <h2>Ranking</h2>
      <div className="rank-col solo">
        <h3>Os viciados em odd</h3>
        <p className="ajuda">Quem tem mais pontos manda na firma. Sorte e burrice contam igual.</p>
        <ol className="rank-lista">
          {ranking.map((u, i) => (
            <li key={u.username} className={i === 0 ? 'lider' : ''}>
              <span>{u.username}</span>
              <span className="pontos">{u.pontos} pts</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
