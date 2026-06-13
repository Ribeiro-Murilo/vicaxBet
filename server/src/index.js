import './env.js';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import gamesRoutes from './routes/games.routes.js';
import palpitesRoutes from './routes/palpites.routes.js';
import apostasRoutes from './routes/apostas.routes.js';
import rankingRoutes from './routes/ranking.routes.js';
import conversaoRoutes from './routes/conversao.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, casa: 'vicaxBet' }));
app.use('/api', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/palpites', palpitesRoutes);
app.use('/api/apostas', apostasRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/conversao', conversaoRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`vicaxBet rodando na porta ${PORT}. A casa sempre... empata.`);
});
