import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Jogos() {
  const { atualizarUser } = useAuth();
  const [games, setGames] = useState([]);
  const [palpites, setPalpites] = useState({});
  const [msg, setMsg] = useState('');

  async function carregar() {
    const [gs, ps] = await Promise.all([api('/games'), api('/palpites')]);
    setGames(gs);
    const mapa = {};
    for (const p of ps) mapa[p.game_id] = { a: p.palpite_gol_a, b: p.palpite_gol_b };
    setPalpites(mapa);
  }

  useEffect(() => {
    carregar().catch((e) => setMsg(e.message));
  }, []);

  function setPalpite(gameId, campo, valor) {
    setPalpites((p) => ({
      ...p,
      [gameId]: { ...(p[gameId] || { a: '', b: '' }), [campo]: valor },
    }));
  }

  async function salvarPalpite(gameId) {
    const p = palpites[gameId] || {};
    try {
      await api('/palpites', {
        method: 'POST',
        body: { game_id: gameId, palpite_gol_a: Number(p.a), palpite_gol_b: Number(p.b) },
      });
      setMsg('Palpite oficial registrado. Agora reza.');
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function apostar(gameId) {
    const p = palpites[gameId] || {};
    const valor = prompt('Quantas fichas vai queimar nessa? (placar exato paga odd)');
    if (!valor) return;
    try {
      const r = await api('/apostas', {
        method: 'POST',
        body: {
          game_id: gameId,
          palpite_gol_a: Number(p.a),
          palpite_gol_b: Number(p.b),
          valor: Number(valor),
        },
      });
      setMsg(`Aposta feita! Odd travada em ${r.odd}x. Se acertar o placar exato, leva ${Math.round(r.valor * r.odd)} fichas.`);
      await atualizarUser();
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <div className="container">
      <h2>Jogos da Copa</h2>
      <p className="ajuda">
        Palpite oficial: placar exato = 100 PP + 1000 fichas. So o vencedor = 10 PP + 500 fichas.
        Aposta: arrisca fichas no placar exato e leva a odd aleatoria (1.1x a 20x).
      </p>
      {msg ? <div className="msg">{msg}</div> : null}
      <div className="jogos-grid">
        {games.map((g) => {
          const p = palpites[g.id] || { a: '', b: '' };
          const resolvido = g.status === 'resolvido';
          return (
            <div key={g.id} className={`jogo-card ${resolvido ? 'resolvido' : ''}`}>
              <div className="times">
                <span>{g.time_a}</span>
                <span className="vs">x</span>
                <span>{g.time_b}</span>
              </div>
              {resolvido ? (
                <div className="placar-final">
                  Final: {g.gol_a} x {g.gol_b}
                </div>
              ) : (
                <>
                  <div className="palpite-inputs">
                    <input
                      type="number"
                      min="0"
                      value={p.a}
                      onChange={(e) => setPalpite(g.id, 'a', e.target.value)}
                    />
                    <span>x</span>
                    <input
                      type="number"
                      min="0"
                      value={p.b}
                      onChange={(e) => setPalpite(g.id, 'b', e.target.value)}
                    />
                  </div>
                  <div className="botoes">
                    <button onClick={() => salvarPalpite(g.id)}>Palpite oficial</button>
                    <button className="apostar" onClick={() => apostar(g.id)}>
                      Apostar fichas
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
