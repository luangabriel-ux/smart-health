import {
  createReminder,
  updateReminder
} from '../validators/index.js';

import { uuid } from '../../../shared/validation.js';

export function createRemindersController(service) {
  return {
    create: async (req, res) => {
      const input = createReminder(req.body);

      const reminder = await service.create(
        req.auth.user.id,
        input
      );

      res.status(201).json({
        data: reminder
      });
    },

    list: async (req, res) => {
      const reminders = await service.list(
        req.auth.user.id
      );

      res.json({
        data: reminders
      });
    },

    update: async (req, res) => {
      const id = uuid(req.params.id);
      const input = updateReminder(req.body);

      const reminder = await service.update(
        req.auth.user.id,
        id,
        input
      );

      res.json({
        data: reminder
      });
    },

    remove: async (req, res) => {
      const id = uuid(req.params.id);

      await service.remove(
        req.auth.user.id,
        id
      );

      res.sendStatus(204);
    }
  };
}
