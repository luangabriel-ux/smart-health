import { credentials, profile } from '../validators/index.js';
export function createUsersController(service) {
  return {
    register: async (req,res) => res.status(201).json({ data: await service.register(credentials(req.body, true)) }),
    login: async (req,res) => res.json({ data: await service.login(credentials(req.body)) }),
    me: (req,res) => res.json({ data: req.auth.user }),
    update: async (req,res) => res.json({ data: await service.update(req.auth.user.id, profile(req.body)) }),
    logout: async (req,res) => { await service.logout(req.auth.token); res.sendStatus(204); }
  };
}
