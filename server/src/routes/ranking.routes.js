import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/principal', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT username, pontos_principais FROM users
     WHERE is_admin = 0 ORDER BY pontos_principais DESC, username ASC`
  );
  res.json(rows);
});

router.get('/fichas', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT username, fichas FROM users
     WHERE is_admin = 0 ORDER BY fichas DESC, username ASC`
  );
  res.json(rows);
});

export default router;
