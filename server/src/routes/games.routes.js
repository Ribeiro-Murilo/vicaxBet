import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const [games] = await pool.query(
    `SELECT id, time_a, time_b, data_jogo, gol_a, gol_b, status
     FROM games ORDER BY data_jogo IS NULL, data_jogo ASC, id ASC`
  );
  res.json(games);
});

export default router;
