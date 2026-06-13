import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../auth.js';
import { converter } from '../scoring.js';

const router = Router();

// Cambio entre moedas: pp_para_fa (1 PP -> 500 FA) ou fa_para_pp (250 FA -> 1 PP).
router.post('/', requireAuth, async (req, res) => {
  const { tipo, quantidade } = req.body || {};
  let deltas;
  try {
    deltas = converter(tipo, Number(quantidade));
  } catch (e) {
    return res.status(400).json({ erro: e.message });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[user]] = await conn.query(
      'SELECT pontos_principais, fichas FROM users WHERE id = ? FOR UPDATE',
      [req.user.id]
    );
    const novoPP = user.pontos_principais + deltas.deltaPP;
    const novoFA = user.fichas + deltas.deltaFA;
    if (novoPP < 0 || novoFA < 0) {
      await conn.rollback();
      return res.status(400).json({ erro: 'Saldo insuficiente pra essa troca' });
    }
    await conn.query(
      'UPDATE users SET pontos_principais = ?, fichas = ? WHERE id = ?',
      [novoPP, novoFA, req.user.id]
    );
    await conn.commit();
    res.json({ ok: true, pontos_principais: novoPP, fichas: novoFA });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ erro: 'Deu ruim na conversao' });
  } finally {
    conn.release();
  }
});

export default router;
