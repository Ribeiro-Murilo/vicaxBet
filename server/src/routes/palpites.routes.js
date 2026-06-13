import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const [palpites] = await pool.query(
    'SELECT id, game_id, palpite_gol_a, palpite_gol_b FROM palpites WHERE user_id = ?',
    [req.user.id]
  );
  res.json(palpites);
});

// Palpite oficial (upsert): vale para PP e bonus de fichas.
router.post('/', requireAuth, async (req, res) => {
  const { game_id, palpite_gol_a, palpite_gol_b } = req.body || {};
  if (game_id == null || palpite_gol_a == null || palpite_gol_b == null) {
    return res.status(400).json({ erro: 'Faltou jogo ou placar' });
  }
  const [[game]] = await pool.query('SELECT status FROM games WHERE id = ?', [game_id]);
  if (!game) return res.status(404).json({ erro: 'Esse jogo nao existe' });
  if (game.status === 'resolvido') {
    return res.status(409).json({ erro: 'Jogo ja acabou, perdeu a janela' });
  }
  await pool.query(
    `INSERT INTO palpites (user_id, game_id, palpite_gol_a, palpite_gol_b)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE palpite_gol_a = VALUES(palpite_gol_a),
                             palpite_gol_b = VALUES(palpite_gol_b)`,
    [req.user.id, game_id, palpite_gol_a, palpite_gol_b]
  );
  res.json({ ok: true });
});

export default router;
