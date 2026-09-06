import { activity } from '../validators/index.js';
import { pagination, uuid } from '../../../shared/validation.js';
export function createActivitiesController(service) {
  return {
    create: async (req,res) => res.status(201).json({ data: await service.create(req.auth.user.id, activity(req.body)) }),
    list: async (req,res) => { const page = pagination(req.query); res.json({ data: await service.list(req.auth.user.id, page), pagination: page }); },
    get: async (req,res) => res.json({ data: await service.get(req.auth.user.id, uuid(req.params.id)) }),
    remove: async (req,res) => { await service.remove(req.auth.user.id, uuid(req.params.id)); res.sendStatus(204); }
  };
}
