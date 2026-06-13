import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../auth.js';
import { gerarOddSatirica } from '../scoring.js';
import { jogoFechado } from '../prazo.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const [apostas] = await pool.query(
    `SELECT a.id, a.game_id, a.valor, a.odd, a.status,
            g.time_a, g.time_b,
            p.palpite_gol_a, p.palpite_gol_b
     FROM apostas a
     JOIN games g ON g.id = a.game_id
     LEFT JOIN palpites p ON p.game_id = a.game_id AND p.user_id = a.user_id
     WHERE a.user_id = ? ORDER BY a.id DESC`,
    [req.user.id]
  );
  res.json(apostas);
});

// Aposta (upsert): usa o placar do palpite. A casa sorteia a odd. Trava no prazo.
router.post('/', requireAuth, async (req, res) => {
  const { game_id, valor } = req.body || {};
  const aposta = Number(valor);
  if (game_id == null) return res.status(400).json({ erro: 'Faltou o jogo' });
  if (!Number.isInteger(aposta) || aposta <= 0) {
    return res.status(400).json({ erro: 'Valor da aposta tem que ser inteiro positivo' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[game]] = await conn.query('SELECT status, data_jogo FROM games WHERE id = ?', [game_id]);
    if (!game) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Esse jogo nao existe' });
    }
    if (jogoFechado(game)) {
      await conn.rollback();
      return res.status(409).json({ erro: 'Passou do prazo, aposta trancada' });
    }

    const [[palpite]] = await conn.query(
      'SELECT id FROM palpites WHERE user_id = ? AND game_id = ?',
      [req.user.id, game_id]
    );
    if (!palpite) {
      await conn.rollback();
      return res.status(400).json({ erro: 'Faca o palpite de placar antes de apostar' });
    }

    const [[user]] = await conn.query(
      'SELECT pontos_aposta FROM users WHERE id = ? FOR UPDATE',
      [req.user.id]
    );
    // Se ja existe aposta nesse jogo, devolve o valor antigo antes de re-apostar.
    const [[apostaAntiga]] = await conn.query(
      'SELECT valor FROM apostas WHERE user_id = ? AND game_id = ?',
      [req.user.id, game_id]
    );
    const saldoDisponivel = user.pontos_aposta + (apostaAntiga ? apostaAntiga.valor : 0);
    if (saldoDisponivel < aposta) {
      await conn.rollback();
      return res.status(400).json({ erro: 'Pontos de aposta insuficientes' });
    }

    const odd = gerarOddSatirica();
    await conn.query('UPDATE users SET pontos_aposta = ? WHERE id = ?', [
      saldoDisponivel - aposta,
      req.user.id,
    ]);
    await conn.query(
      `INSERT INTO apostas (user_id, game_id, valor, odd, status)
       VALUES (?, ?, ?, ?, 'pendente')
       ON DUPLICATE KEY UPDATE valor = VALUES(valor), odd = VALUES(odd), status = 'pendente'`,
      [req.user.id, game_id, aposta, odd]
    );
    await conn.commit();
    res.json({ ok: true, odd, valor: aposta });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ erro: 'Deu ruim na aposta' });
  } finally {
    conn.release();
  }
});

export default router;
