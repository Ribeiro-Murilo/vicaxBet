import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { pontosPrincipais, placarExato, resolveAposta } from '../scoring.js';

const router = Router();

router.use(requireAuth, requireAdmin);

// Cartola cadastra um jogo. data_jogo (prazo) e obrigatorio.
router.post('/games', async (req, res) => {
  const { time_a, time_b, data_jogo } = req.body || {};
  if (!time_a || !time_b) {
    return res.status(400).json({ erro: 'Manda os dois times' });
  }
  if (!data_jogo) {
    return res.status(400).json({ erro: 'Defina a data/hora do jogo (o prazo do palpite)' });
  }
  const [r] = await pool.query(
    'INSERT INTO games (time_a, time_b, data_jogo, created_by) VALUES (?, ?, ?, ?)',
    [time_a, time_b, data_jogo, req.user.id]
  );
  res.json({ ok: true, id: r.insertId });
});

// Cartola lanca o placar final -> credita ponto principal e resolve apostas.
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

    // Ponto principal: credita quem acertou o placar exato.
    const [palpites] = await conn.query('SELECT * FROM palpites WHERE game_id = ?', [gameId]);
    for (const p of palpites) {
      const pp = pontosPrincipais({ a: p.palpite_gol_a, b: p.palpite_gol_b }, real);
      if (pp > 0) {
        await conn.query(
          'UPDATE users SET pontos_principais = pontos_principais + ? WHERE id = ?',
          [pp, p.user_id]
        );
      }
    }

    // Aposta: resolve usando o placar do palpite do mesmo usuario.
    const [apostas] = await conn.query(
      `SELECT a.*, p.palpite_gol_a, p.palpite_gol_b
       FROM apostas a
       LEFT JOIN palpites p ON p.game_id = a.game_id AND p.user_id = a.user_id
       WHERE a.game_id = ? AND a.status = 'pendente'`,
      [gameId]
    );
    for (const a of apostas) {
      const exato =
        a.palpite_gol_a != null && placarExato({ a: a.palpite_gol_a, b: a.palpite_gol_b }, real);
      const { status, credito } = resolveAposta(a, exato);
      if (credito > 0) {
        await conn.query('UPDATE users SET pontos_aposta = pontos_aposta + ? WHERE id = ?', [
          credito,
          a.user_id,
        ]);
      }
      await conn.query('UPDATE apostas SET status = ? WHERE id = ?', [status, a.id]);
    }

    await conn.query(
      "UPDATE games SET gol_a = ?, gol_b = ?, status = 'resolvido' WHERE id = ?",
      [gol_a, gol_b, gameId]
    );
    await conn.commit();
    res.json({ ok: true, palpites: palpites.length, apostas: apostas.length });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ erro: 'Deu ruim ao resolver o jogo' });
  } finally {
    conn.release();
  }
});

export default router;
