import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Modal from '../components/Modal.jsx';

export default function MinhasApostas() {
  const { user, atualizarUser } = useAuth();
  const [apostas, setApostas] = useState([]);
  const [msg, setMsg] = useState('');
  const [conversaoModal, setConversaoModal] = useState(null); // { tipo, quantidade }

  async function carregar() {
    setApostas(await api('/apostas'));
  }
  useEffect(() => {
    carregar().catch((e) => setMsg(e.message));
  }, []);

  function abrirConversao(tipo) {
    setConversaoModal({ tipo, quantidade: '' });
  }

  async function confirmarConversao() {
    const { tipo, quantidade } = conversaoModal;
    try {
      await api('/conversao', { method: 'POST', body: { tipo, quantidade: Number(quantidade) } });
      await atualizarUser();
      setConversaoModal(null);
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
        <button onClick={() => abrirConversao('pp_para_fa')}>PP -&gt; Fichas (1:500)</button>
        <button onClick={() => abrirConversao('fa_para_pp')}>Fichas -&gt; PP (250:1)</button>
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

      <Modal
        aberto={!!conversaoModal}
        titulo={
          conversaoModal?.tipo === 'pp_para_fa'
            ? 'Trocar PP por Fichas'
            : 'Trocar Fichas por PP'
        }
        onFechar={() => setConversaoModal(null)}
      >
        {conversaoModal ? (
          <>
            <p className="ajuda">
              {conversaoModal.tipo === 'pp_para_fa'
                ? 'Cambio: 1 PP = 500 fichas. Quantos PP quer queimar?'
                : 'Cambio (proposital ruim): 250 fichas = 1 PP. Tem que ser multiplo de 250.'}
            </p>
            <label className="modal-label">Quantidade</label>
            <input
              className="modal-input"
              type="number"
              min="1"
              autoFocus
              placeholder={conversaoModal.tipo === 'pp_para_fa' ? 'ex: 10' : 'ex: 250'}
              value={conversaoModal.quantidade}
              onChange={(e) =>
                setConversaoModal({ ...conversaoModal, quantidade: e.target.value })
              }
            />
            <div className="modal-acoes">
              <button className="secundario" onClick={() => setConversaoModal(null)}>
                Cancelar
              </button>
              <button onClick={confirmarConversao}>Confirmar troca</button>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
