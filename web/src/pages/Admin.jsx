import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Admin() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [novo, setNovo] = useState({ time_a: '', time_b: '', data_jogo: '' });
  const [placar, setPlacar] = useState({});
  const [msg, setMsg] = useState('');

  async function carregar() {
    setGames(await api('/games'));
  }
  useEffect(() => {
    carregar().catch((e) => setMsg(e.message));
  }, []);

  if (!user?.is_admin) {
    return <div className="container">So o Cartola entra aqui.</div>;
  }

  async function cadastrarJogo(e) {
    e.preventDefault();
    try {
      await api('/admin/games', { method: 'POST', body: novo });
      setNovo({ time_a: '', time_b: '', data_jogo: '' });
      setMsg('Jogo cadastrado. Que comecem os palpites furados.');
      await carregar();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function lancarResultado(id) {
    const p = placar[id] || {};
    try {
      const r = await api(`/admin/games/${id}/resultado`, {
        method: 'POST',
        body: { gol_a: Number(p.a), gol_b: Number(p.b) },
      });
      setMsg(`Resultado lancado. ${r.palpites} palpites e ${r.apostas} apostas processados.`);
      await carregar();
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="container">
      <h2>Painel do Cartola</h2>
      {msg ? <div className="msg">{msg}</div> : null}

      <form className="form-jogo" onSubmit={cadastrarJogo}>
        <h3>Cadastrar jogo</h3>
        <input
          placeholder="Time A"
          value={novo.time_a}
          onChange={(e) => setNovo({ ...novo, time_a: e.target.value })}
        />
        <input
          placeholder="Time B"
          value={novo.time_b}
          onChange={(e) => setNovo({ ...novo, time_b: e.target.value })}
        />
        <input
          type="datetime-local"
          value={novo.data_jogo}
          onChange={(e) => setNovo({ ...novo, data_jogo: e.target.value })}
        />
        <button type="submit">Cadastrar</button>
      </form>

      <h3>Lançar placar final</h3>
      <table className="tabela">
        <thead>
          <tr>
            <th>Jogo</th>
            <th>Status</th>
            <th>Placar</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {games.map((g) => (
            <tr key={g.id}>
              <td>{g.time_a} x {g.time_b}</td>
              <td>{g.status}</td>
              <td>
                {g.status === 'resolvido' ? (
                  `${g.gol_a} x ${g.gol_b}`
                ) : (
                  <span className="placar-inputs">
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        setPlacar({ ...placar, [g.id]: { ...placar[g.id], a: e.target.value } })
                      }
                    />
                    x
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        setPlacar({ ...placar, [g.id]: { ...placar[g.id], b: e.target.value } })
                      }
                    />
                  </span>
                )}
              </td>
              <td>
                {g.status === 'aberto' ? (
                  <button onClick={() => lancarResultado(g.id)}>Lancar</button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
