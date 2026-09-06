import { randomUUID, randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { AppError } from '../../../shared/errors.js';
import { publicUser } from '../models/index.js';
const scrypt = promisify(scryptCallback);
export const tokenHash = token => createHash('sha256').update(token).digest('hex');
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${(await scrypt(password, salt, 64)).toString('hex')}`;
}
export async function verifyPassword(password, hash) {
  const [salt, key] = hash.split(':');
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(key, 'hex'));
}
export function createUsersService(repository) {
  return {
    async register(input) {
      try { return publicUser(await repository.create({ ...input, id: randomUUID(), passwordHash: await hashPassword(input.password) })); }
      catch (error) { if (error.code === '23505') throw new AppError(409, 'EMAIL_EXISTS', 'E-mail já cadastrado.'); throw error; }
    },
    async login({ email, password }) {
      const user = await repository.byEmail(email);
      // Execute the same expensive derivation even for unknown accounts.
      const hash = user?.password_hash ?? `${'0'.repeat(32)}:${'0'.repeat(128)}`;
      const valid = await verifyPassword(password, hash);
      if (!user || !valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciais inválidas.');
      const accessToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await repository.session(tokenHash(accessToken), user.id, expiresAt);
      return { accessToken, tokenType: 'Bearer', expiresAt, user: publicUser(user) };
    },
    async authenticate(token) {
      const user = await repository.authenticated(tokenHash(token));
      if (!user) throw new AppError(401, 'UNAUTHENTICATED', 'Sessão inválida ou expirada.');
      return publicUser(user);
    },
    async update(id, values) { return publicUser(await repository.update(id, values)); },
    async logout(token) { await repository.revoke(tokenHash(token)); }
  };
}
