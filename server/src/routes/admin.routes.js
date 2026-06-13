import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { resolveAposta } from '../scoring.js';

const router = Router();

router.use(requireAuth, requireAdmin);

// Cartola cadastra um jogo
router.post('/games', async (req, res) => {
  const { time_a, time_b, data_jogo } = req.body || {};
  if (!time_a || !time_b) {
    return res.status(400).json({ erro: 'Manda os dois times' });
  }
  const [r] = await pool.query(
    'INSERT INTO games (time_a, time_b, data_jogo, created_by) VALUES (?, ?, ?, ?)',
    [time_a, time_b, data_jogo || null, req.user.id]
  );
  res.json({ ok: true, id: r.insertId });
});

// Cartola lanca o placar final -> resolve as apostas do jogo
router.post('/games/:id/resultado', async (req, res) => {
  const gameId = Number(req.params.id);
  const gol_a = Number(req.body?.gol_a);
  const gol_b = Number(req.body?.gol_b);
  if (!Number.isInteger(gol_a) || !Number.isInteger(gol_b) || gol_a < 0 || gol_b < 0) {
    return res.status(400).json({ erro: 'Placar invalido' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[game]] = await conn.query('SELECT status FROM games WHERE id = ? FOR UPDATE', [gameId]);
    if (!game) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Jogo nao existe' });
    }
    if (game.status === 'resolvido') {
      await conn.rollback();
      return res.status(409).json({ erro: 'Esse jogo ja foi resolvido' });
    }

    const real = { a: gol_a, b: gol_b };

    // Apostas: credita valor*odd so para quem acertou o placar exato
    const [apostas] = await conn.query(
      "SELECT * FROM apostas WHERE game_id = ? AND status = 'pendente'",
      [gameId]
    );
    for (const a of apostas) {
      const { status, credito } = resolveAposta(a, real);
      if (credito > 0) {
        await conn.query('UPDATE users SET pontos = pontos + ? WHERE id = ?', [credito, a.user_id]);
      }
      await conn.query('UPDATE apostas SET status = ? WHERE id = ?', [status, a.id]);
    }

    await conn.query(
      "UPDATE games SET gol_a = ?, gol_b = ?, status = 'resolvido' WHERE id = ?",
      [gol_a, gol_b, gameId]
    );
    await conn.commit();
    res.json({ ok: true, apostas: apostas.length });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ erro: 'Deu ruim ao resolver o jogo' });
  } finally {
    conn.release();
  }
});

export default router;
