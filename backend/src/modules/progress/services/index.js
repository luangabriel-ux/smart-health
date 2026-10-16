import {
  progressDayView,
  progressGoalsView
} from '../models/index.js';

export function createProgressService(repository) {
  return {
    async list(userId, range) {
      const rows = await repository.list(
        userId,
        range
      );

      return rows.map(progressDayView);
    },

    async getGoals(userId) {
      const row = await repository.getGoals(
        userId
      );

      return progressGoalsView(row);
    },

    async replaceGoals(userId, input) {
      const row = await repository.replaceGoals(
        userId,
        input
      );

      return progressGoalsView(row);
    }
  };
}
