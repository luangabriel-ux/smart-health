import { Router } from 'express';
import { createProgressController } from '../controllers/index.js';

export function createProgressRouter(service, authenticate) {
  const router = Router();

  const controller =
    createProgressController(service);

  router.use(authenticate);

  router.get('/', controller.list);
  router.get('/goals', controller.getGoals);
  router.put('/goals', controller.replaceGoals);

  return router;
}
