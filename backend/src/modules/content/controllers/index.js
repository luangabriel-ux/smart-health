import { uuid } from '../../../shared/validation.js';
import { contentFilters } from '../validators/index.js';

export function createContentController(service) {
  return {
    list: async (req, res) => {
      const filters =
        contentFilters(req.query);

      const content = await service.list(
        req.auth.user.plan,
        filters
      );

      res.json({
        data: content,
        pagination: {
          limit: filters.limit,
          offset: filters.offset
        }
      });
    },

    get: async (req, res) => {
      const content = await service.get(
        req.auth.user.plan,
        uuid(req.params.id)
      );

      res.json({
        data: content
      });
    }
  };
}
