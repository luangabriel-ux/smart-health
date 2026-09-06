import { Router } from 'express';
import { createContentController } from '../controllers/index.js';

export function createContentRouter(
  service,
  authenticate
) {
  const router = Router();
  const controller =
    createContentController(service);

  router.use(authenticate);

  router.get('/', controller.list);
  router.get('/:id', controller.get);

  return router;
}
