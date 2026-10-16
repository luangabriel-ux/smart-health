import { randomUUID } from 'node:crypto';
import { AppError } from '../../../shared/errors.js';
import { reminderView } from '../models/index.js';

const notFound = () => {
  throw new AppError(
    404,
    'REMINDER_NOT_FOUND',
    'Lembrete não encontrado.'
  );
};

export function createRemindersService(repository) {
  return {
    async create(userId, input) {
      const row = await repository.create(
        randomUUID(),
        userId,
        input
      );

      return reminderView(row);
    },

    async list(userId) {
      const rows = await repository.list(userId);

      return rows.map(reminderView);
    },

    async update(userId, id, values) {
      const row = await repository.update(
        userId,
        id,
        values
      );

      if (!row) {
        notFound();
      }

      return reminderView(row);
    },

    async remove(userId, id) {
      const removed = await repository.remove(
        userId,
        id
      );

      if (!removed) {
        notFound();
      }
    }
  };
}
