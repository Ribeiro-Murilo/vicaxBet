import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Modal from '../components/Modal.jsx';

function fechado(g) {
  return g.status === 'resolvido' || new Date() >= new Date(g.data_jogo);
}

function formatData(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Jogos() {
  const { atualizarUser } = useAuth();
  const [games, setGames] = useState([]);
  const [palpites, setPalpites] = useState({});
  const [msg, setMsg] = useState('');
  const [apostaModal, setApostaModal] = useState(null); // { game, valor }
  const [vicioModal, setVicioModal] = useState(false);

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
    if (p.a === '' || p.a == null || p.b === '' || p.b == null) {
      setMsg('Preenche o placar antes de salvar.');
      return;
    }
    try {
      await api('/palpites', {
        method: 'POST',
        body: { game_id: gameId, palpite_gol_a: Number(p.a), palpite_gol_b: Number(p.b) },
      });
      setMsg('Palpite salvo. Esse e o que vale ponto principal na Copa.');
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function confirmarAposta() {
    const { game, valor } = apostaModal;
    try {
      const r = await api('/apostas', {
        method: 'POST',
        body: { game_id: game.id, valor: Number(valor) },
      });
      const retorno = Math.round(r.valor * r.odd);
      setMsg(
        `Aposta registrada! A casa te deu odd ${r.odd}x. Se o placar bater, voce leva ${retorno} pontos de aposta${r.odd < 1 ? ' (sim, menos do que apostou. a casa avisou)' : ''}.`
      );
      setApostaModal(null);
      await atualizarUser();
    } catch (e) {
      if (e.dados?.limiteVicio) {
        setApostaModal(null);
        setVicioModal(true);
        return;
      }
      setMsg(e.message);
    }
  }

  return (
    <div className="container">
      <h2>Jogos da Copa</h2>
      <p className="ajuda">
        Ponto Principal (serio): so acertar o placar EXATO pontua. Acertar so o vencedor nao da nada.
        Ponto de Aposta (satira): aposta em cima do seu palpite e a casa sorteia uma odd de 0.2x a 20x.
        Depois do prazo do jogo nada pode ser mudado.
      </p>
      {msg ? <div className="msg">{msg}</div> : null}
      <div className="jogos-grid">
        {games.map((g) => {
          const p = palpites[g.id] || { a: '', b: '' };
          const travado = fechado(g);
          return (
            <div key={g.id} className={`jogo-card ${travado ? 'resolvido' : ''}`}>
              <div className="times">
                <span>{g.time_a}</span>
                <span className="vs">x</span>
                <span>{g.time_b}</span>
              </div>
              <div className="data-jogo">prazo: {formatData(g.data_jogo)}</div>

              {g.status === 'resolvido' ? (
                <div className="placar-final">Final: {g.gol_a} x {g.gol_b}</div>
              ) : travado ? (
                <div className="placar-final fechado">Prazo encerrado</div>
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
                    <button onClick={() => salvarPalpite(g.id)}>Salvar palpite</button>
                    <button className="apostar" onClick={() => setApostaModal({ game: g, valor: '' })}>
                      Apostar
                    </button>
                  </div>
                </>
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
              A aposta usa o placar do seu palpite salvo. A casa sorteia a odd na hora (0.2x a 20x,
              metade das vezes abaixo de 1). So ganha se o placar for exato.
              Voce pode apostar ate 2 vezes no mesmo jogo (cada uma com odd propria).
            </p>
            <label className="modal-label">Quantos pontos de aposta vai arriscar?</label>
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

      <Modal aberto={vicioModal} titulo="Calma pai... Respita" onFechar={() => setVicioModal(false)}>
        <div className="vicio">
          <p className="vicio-emoji">✋</p>
          <p>
            <strong>2 apostas no mesmo jogo.</strong> DUAS. Em pontos que nao valem nada, num
            jogo que talvez nem aconteca, palpitando um placar que voce inventou. E ainda veio
            pela terceira.
          </p>
          <p>
            O cafezinho das 15h ja virou "so mais uma oddzinha"? O estagiario ja te chama de
            "o investidor"? Seu mouse ja sabe o caminho do botao Apostar de olho fechado? Pai...
            era pra ser brincadeira de firma, nao um estilo de vida.
          </p>
          <p>
            Agora serio por um segundo: se aposta de verdade estiver pesando ai fora, procurar
            ajuda nao tem nada de vergonha:
          </p>
          <ul className="vicio-contatos">
            <li><strong>Jogadores Anonimos:</strong> www.jogadoresanonimos.com.br</li>
            <li><strong>CVV (apoio emocional, 24h):</strong> 188 - www.cvv.org.br</li>
          </ul>
          <button className="btn-grande" onClick={() => setVicioModal(false)}>
            Ta, vou respirar
          </button>
        </div>
      </Modal>
    </div>
  );
}
