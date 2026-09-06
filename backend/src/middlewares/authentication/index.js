import { AppError } from '../../shared/errors.js';
export function createAuthentication(usersService) {
  return async (req, res, next) => {
    const match = /^Bearer ([0-9a-f]{64})$/.exec(req.get('authorization') ?? '');
    if (!match) throw new AppError(401, 'UNAUTHENTICATED', 'Informe o token Bearer.');
    req.auth = { user: await usersService.authenticate(match[1]), token: match[1] };
    next();
  };
}
