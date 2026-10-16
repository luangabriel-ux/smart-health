import { AppError } from '../../../shared/errors.js';
import { contentView } from '../models/index.js';

export function createContentService(repository) {
  return {
    async list(userPlan, filters) {
      const rows = await repository.list(filters);

      return rows.map((row) =>
        contentView(row, userPlan)
      );
    },

    async get(userPlan, id) {
      const row = await repository.get(id);

      if (!row) {
        throw new AppError(
          404,
          'CONTENT_NOT_FOUND',
          'Conteúdo não encontrado.'
        );
      }

      return contentView(row, userPlan);
    }
  };
}
