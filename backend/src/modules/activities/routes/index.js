import { Router } from 'express';
import { createActivitiesController } from '../controllers/index.js';
export function createActivitiesRouter(service, authenticate) {
  const router = Router(), controller = createActivitiesController(service);
  router.use(authenticate);
  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.delete('/:id', controller.remove);
  return router;
}
