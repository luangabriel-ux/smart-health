import { Router } from 'express';
import { createRemindersController } from '../controllers/index.js';

export function createRemindersRouter(service, authenticate) {
  const router = Router();
  const controller = createRemindersController(service);

  router.use(authenticate);

  router.post('/', controller.create);
  router.get('/', controller.list);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
