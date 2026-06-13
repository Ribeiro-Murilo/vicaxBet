import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { sign, requireAuth } from '../auth.js';

const router = Router();

const CAMPOS_PUBLICOS = 'id, username, is_admin, pontos_principais, fichas';

router.post('/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ erro: 'Manda usuario e senha' });
  }
  try {
    const hash = bcrypt.hashSync(password, 8);
    const [r] = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, hash]
    );
    const [[user]] = await pool.query(
      `SELECT ${CAMPOS_PUBLICOS} FROM users WHERE id = ?`,
      [r.insertId]
    );
    res.json({ token: sign(user), user });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Esse nome ja ta na firma' });
    }
    res.status(500).json({ erro: 'Deu ruim no cadastro' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const [[user]] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ erro: 'Usuario ou senha errados' });
  }
  const publico = {
    id: user.id,
    username: user.username,
    is_admin: user.is_admin,
    pontos_principais: user.pontos_principais,
    fichas: user.fichas,
  };
  res.json({ token: sign(publico), user: publico });
});

router.get('/me', requireAuth, async (req, res) => {
  const [[user]] = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM users WHERE id = ?`,
    [req.user.id]
  );
  res.json({ user });
});

export default router;
