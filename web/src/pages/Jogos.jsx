import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Modal from '../components/Modal.jsx';

export default function Jogos() {
  const { atualizarUser } = useAuth();
  const [games, setGames] = useState([]);
  const [msg, setMsg] = useState('');
  const [apostaModal, setApostaModal] = useState(null); // { game, valor, palpiteA, palpiteB }

  async function carregar() {
    setGames(await api('/games'));
  }

  useEffect(() => {
    carregar().catch((e) => setMsg(e.message));
  }, []);

  function abrirAposta(game) {
    setApostaModal({ game, valor: '', palpiteA: '', palpiteB: '' });
  }

  async function confirmarAposta() {
    const { game, valor, palpiteA, palpiteB } = apostaModal;
    if (palpiteA === '' || palpiteB === '') {
      setMsg('Preenche o palpite de placar antes de apostar.');
      return;
    }
    try {
      const r = await api('/apostas', {
        method: 'POST',
        body: {
          game_id: game.id,
          palpite_gol_a: Number(palpiteA),
          palpite_gol_b: Number(palpiteB),
          valor: Number(valor),
        },
      });
      setMsg(`Aposta feita! Odd travada em ${r.odd}x. Se acertar o placar exato, leva ${Math.round(r.valor * r.odd)} pontos.`);
      setApostaModal(null);
      await atualizarUser();
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <div className="container">
      <h2>Jogos da Copa</h2>
      <p className="ajuda">
        Aposta seus pontos no placar exato. A odd e sorteada na hora (1.1x a 20x).
        Acertou o placar = pontos x odd. Acertar so o vencedor nao da nada. Errou = perde a aposta.
      </p>
      {msg ? <div className="msg">{msg}</div> : null}
      <div className="jogos-grid">
        {games.map((g) => {
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
                <div className="botoes">
                  <button className="apostar" onClick={() => abrirAposta(g)}>
                    Apostar pontos
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        aberto={!!apostaModal}
        titulo={apostaModal ? `Apostar em ${apostaModal.game.time_a} x ${apostaModal.game.time_b}` : ''}
        onFechar={() => setApostaModal(null)}
      >
        {apostaModal ? (
          <>
            <p className="ajuda">
              Voce ganha so se acertar o placar exato. A odd e sorteada na hora (1.1x a 20x).
            </p>
            <div className="modal-palpite">
              <span>Placar:</span>
              <input
                type="number"
                min="0"
                value={apostaModal.palpiteA}
                onChange={(e) => setApostaModal({ ...apostaModal, palpiteA: e.target.value })}
              />
              <span>x</span>
              <input
                type="number"
                min="0"
                value={apostaModal.palpiteB}
                onChange={(e) => setApostaModal({ ...apostaModal, palpiteB: e.target.value })}
              />
            </div>
            <label className="modal-label">Quantos pontos vai queimar?</label>
            <input
              className="modal-input"
              type="number"
              min="1"
              autoFocus
              placeholder="ex: 200"
              value={apostaModal.valor}
              onChange={(e) => setApostaModal({ ...apostaModal, valor: e.target.value })}
            />
            <div className="modal-acoes">
              <button className="secundario" onClick={() => setApostaModal(null)}>
                Cancelar
              </button>
              <button className="apostar" onClick={confirmarAposta}>
                Confirmar aposta
              </button>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
