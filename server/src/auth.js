import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'segredo-da-firma';

export function sign(user) {
  return jwt.sign(
    { id: user.id, username: user.username, is_admin: !!user.is_admin },
    SECRET,
    { expiresIn: '7d' }
  );
}

export function verify(token) {
  return jwt.verify(token, SECRET);
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ erro: 'Faca login, anonimo' });
  try {
    req.user = verify(token);
    next();
  } catch {
    return res.status(401).json({ erro: 'Token invalido ou vencido' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) {
    return res.status(403).json({ erro: 'So o Cartola pode fazer isso' });
  }
  next();
}
