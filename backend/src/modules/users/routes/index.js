import { Router } from 'express';
import { createUsersController } from '../controllers/index.js';
export function createUsersRouter(service, authenticate) {
  const router = Router(), controller = createUsersController(service);
  router.post('/auth/register', controller.register);
  router.post('/auth/login', controller.login);
  router.post('/auth/logout', authenticate, controller.logout);
  router.get('/users/me', authenticate, controller.me);
  router.patch('/users/me', authenticate, controller.update);
  return router;
}
