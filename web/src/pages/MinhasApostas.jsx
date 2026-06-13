import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function MinhasApostas() {
  const { user } = useAuth();
  const [apostas, setApostas] = useState([]);
  const [msg, setMsg] = useState('');

  async function carregar() {
    setApostas(await api('/apostas'));
  }
  useEffect(() => {
    carregar().catch((e) => setMsg(e.message));
  }, []);

  return (
    <div className="container">
      <h2>Minha banca</h2>
      <div className="saldos">
        <div className="saldo-box pontos-box">
          <span className="num">{user.pontos}</span>
          <span>Pontos</span>
        </div>
      </div>
      {msg ? <div className="msg">{msg}</div> : null}

      <h3>Historico de apostas</h3>
      {apostas.length === 0 ? (
        <p className="ajuda">Nenhuma aposta ainda. Covarde.</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>Jogo</th>
              <th>Palpite</th>
              <th>Valor</th>
              <th>Odd</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {apostas.map((a) => (
              <tr key={a.id} className={`linha-${a.status}`}>
                <td>{a.time_a} x {a.time_b}</td>
                <td>{a.palpite_gol_a} x {a.palpite_gol_b}</td>
                <td>{a.valor}</td>
                <td>{a.odd}x</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
