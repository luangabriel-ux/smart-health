import {
  progressRange,
  progressGoals
} from '../validators/index.js';

export function createProgressController(service) {
  return {
    list: async (req, res) => {
      const range = progressRange(req.query);

      const progress = await service.list(
        req.auth.user.id,
        range
      );

      res.json({
        data: progress
      });
    },

    getGoals: async (req, res) => {
      const goals = await service.getGoals(
        req.auth.user.id
      );

      res.json({
        data: goals
      });
    },

    replaceGoals: async (req, res) => {
      const input = progressGoals(req.body);

      const goals = await service.replaceGoals(
        req.auth.user.id,
        input
      );

      res.json({
        data: goals
      });
    }
  };
}
