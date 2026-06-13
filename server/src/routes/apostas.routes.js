import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../auth.js';
import { gerarOdd } from '../scoring.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const [apostas] = await pool.query(
    `SELECT a.id, a.game_id, a.palpite_gol_a, a.palpite_gol_b, a.valor, a.odd, a.status,
            g.time_a, g.time_b
     FROM apostas a JOIN games g ON g.id = a.game_id
     WHERE a.user_id = ? ORDER BY a.id DESC`,
    [req.user.id]
  );
  res.json(apostas);
});

// Aposta ativa: gera odd aleatoria e ja debita as fichas.
router.post('/', requireAuth, async (req, res) => {
  const { game_id, palpite_gol_a, palpite_gol_b, valor } = req.body || {};
  const aposta = Number(valor);
  if (game_id == null || palpite_gol_a == null || palpite_gol_b == null) {
    return res.status(400).json({ erro: 'Faltou jogo ou placar' });
  }
  if (!Number.isInteger(aposta) || aposta <= 0) {
    return res.status(400).json({ erro: 'Valor da aposta tem que ser inteiro positivo' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[game]] = await conn.query('SELECT status FROM games WHERE id = ?', [game_id]);
    if (!game) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Esse jogo nao existe' });
    }
    if (game.status === 'resolvido') {
      await conn.rollback();
      return res.status(409).json({ erro: 'Jogo ja acabou, sem aposta' });
    }
    const [[user]] = await conn.query(
      'SELECT fichas FROM users WHERE id = ? FOR UPDATE',
      [req.user.id]
    );
    if (user.fichas < aposta) {
      await conn.rollback();
      return res.status(400).json({ erro: 'Fichas insuficientes, vai trabalhar' });
    }
    const odd = gerarOdd();
    await conn.query('UPDATE users SET fichas = fichas - ? WHERE id = ?', [aposta, req.user.id]);
    const [r] = await conn.query(
      `INSERT INTO apostas (user_id, game_id, palpite_gol_a, palpite_gol_b, valor, odd)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, game_id, palpite_gol_a, palpite_gol_b, aposta, odd]
    );
    await conn.commit();
    res.json({ ok: true, id: r.insertId, odd, valor: aposta });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ erro: 'Deu ruim na aposta' });
  } finally {
    conn.release();
  }
});

export default router;
