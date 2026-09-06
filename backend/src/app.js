import express from 'express';
import { createUsersRepository } from './modules/users/repositories/index.js';
import { createUsersService } from './modules/users/services/index.js';
import { createUsersRouter } from './modules/users/routes/index.js';
import { createAuthentication } from './middlewares/authentication/index.js';
import { createActivitiesRepository } from './modules/activities/repositories/index.js';
import { createActivitiesService } from './modules/activities/services/index.js';
import { createActivitiesRouter } from './modules/activities/routes/index.js';
import { errorHandler } from './middlewares/error-handling/index.js';

export function createApp({ pool, registerModules = () => {} }) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req,res,next) => { res.set('Cache-Control','no-store'); res.set('X-Content-Type-Options','nosniff'); next(); });
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (req,res) => res.json({ status: 'ok' }));
  app.get('/ready', async (req,res) => {
    try { await pool.query('SELECT 1'); res.json({ status: 'ready' }); }
    catch { res.status(503).json({ status: 'unavailable' }); }
  });
  const usersService = createUsersService(createUsersRepository(pool));
  const authenticate = createAuthentication(usersService);
  app.use('/api', createUsersRouter(usersService, authenticate));
  app.use('/api/activities', createActivitiesRouter(createActivitiesService(createActivitiesRepository(pool)), authenticate));
  registerModules(app, { pool, authenticate });
  app.use((req,res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' } }));
  app.use(errorHandler);
  return app;
}
