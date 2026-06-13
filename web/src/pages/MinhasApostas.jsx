import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function MinhasApostas() {
  const { user, atualizarUser } = useAuth();
  const [apostas, setApostas] = useState([]);
  const [msg, setMsg] = useState('');

  async function carregar() {
    setApostas(await api('/apostas'));
  }
  useEffect(() => {
    carregar().catch((e) => setMsg(e.message));
  }, []);

  async function converter(tipo) {
    const label = tipo === 'pp_para_fa' ? 'Quantos PP virar fichas (1 PP = 500 fichas)?' : 'Quantas fichas virar PP (250 fichas = 1 PP, multiplo de 250)?';
    const quantidade = prompt(label);
    if (!quantidade) return;
    try {
      await api('/conversao', { method: 'POST', body: { tipo, quantidade: Number(quantidade) } });
      await atualizarUser();
      setMsg('Cambio feito. A casa agradece a sua ingenuidade.');
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <div className="container">
      <h2>Minha banca</h2>
      <div className="saldos">
        <div className="saldo-box pp-box">
          <span className="num">{user.pontos_principais}</span>
          <span>Pontos Principais</span>
        </div>
        <div className="saldo-box fa-box">
          <span className="num">{user.fichas}</span>
          <span>Fichas</span>
        </div>
      </div>
      <div className="conversao">
        <button onClick={() => converter('pp_para_fa')}>PP -&gt; Fichas (1:500)</button>
        <button onClick={() => converter('fa_para_pp')}>Fichas -&gt; PP (250:1)</button>
      </div>
      {msg ? <div className="msg">{msg}</div> : null}

      <h3>Histórico de apostas</h3>
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
