const key = 'smart-health.session';
export interface StoredSession { accessToken: string; expiresAt: string }
export function readSession(storage: Pick<Storage, 'getItem' | 'removeItem'>): StoredSession | null {
  try {
    const value = JSON.parse(storage.getItem(key) ?? 'null');
    if (typeof value?.accessToken === 'string' && value.accessToken &&
      typeof value.expiresAt === 'string' && Date.parse(value.expiresAt) > Date.now()) {
      return { accessToken: value.accessToken, expiresAt: value.expiresAt };
    }
    storage.removeItem(key);
  } catch { /* Armazenamento indisponível ou sessão inválida: solicitar novo login. */ }
  return null;
}
export function writeSession(storage: Pick<Storage, 'setItem' | 'removeItem'>, session: StoredSession | null) {
  try {
    if (session) storage.setItem(key, JSON.stringify({ accessToken: session.accessToken, expiresAt: session.expiresAt }));
    else storage.removeItem(key);
  } catch { /* A sessão continua em memória quando o armazenamento está bloqueado. */ }
}
