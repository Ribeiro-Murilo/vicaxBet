import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT username, pontos FROM users
     WHERE is_admin = 0 ORDER BY pontos DESC, username ASC`
  );
  res.json(rows);
});

export default router;
