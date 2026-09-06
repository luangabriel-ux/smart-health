import { Router } from 'express';
import { createRecommendationsController } from '../controllers/index.js';

export function createRecommendationsRouter(
  service,
  authenticate
) {
  const router = Router();

  const controller =
    createRecommendationsController(service);

  router.use(authenticate);

  router.get('/', controller.list);

  return router;
}
