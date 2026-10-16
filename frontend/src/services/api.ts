import type { Activity, ActivityInput, Credentials, Profile, Session, User } from './types.ts';

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function createApi({ getToken = () => null, onUnauthorized = () => {}, fetcher = globalThis.fetch }:
  { getToken?: () => string | null; onUnauthorized?: () => void; fetcher?: typeof fetch } = {}) {
  async function request<T>(path: string, { method = 'GET', body, authenticated = true }:
    { method?: string; body?: unknown; authenticated?: boolean } = {}): Promise<T> {
    const token = authenticated ? getToken() : null;
    let response: Response;
    try {
      response = await fetcher(`/api${path}`, {
        method,
        headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        cache: 'no-store'
      });
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', 'Não foi possível conectar ao servidor. Tente novamente.');
    }
    if (response.status === 401 && authenticated && token === getToken()) onUnauthorized();
    if (response.status === 204 && response.ok) return undefined as T;
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(response.status, payload?.error?.code ?? 'HTTP_ERROR',
      payload?.error?.message ?? 'Não foi possível concluir a solicitação.');
    if (!payload || !Object.hasOwn(payload, 'data')) throw new ApiError(response.status, 'INVALID_RESPONSE', 'Resposta inválida do servidor.');
    return payload as T;
  }
  return {
    register: (input: Credentials & { name: string }) => request<{ data: User }>('/auth/register', { method: 'POST', body: input, authenticated: false }),
    login: (input: Credentials) => request<{ data: Session }>('/auth/login', { method: 'POST', body: input, authenticated: false }),
    logout: () => request<void>('/auth/logout', { method: 'POST' }),
    me: () => request<{ data: User }>('/users/me'),
    updateProfile: (input: Profile) => request<{ data: User }>('/users/me', { method: 'PATCH', body: input }),
    listActivities: (limit = 20, offset = 0) => request<{ data: Activity[]; pagination: { limit: number; offset: number } }>(`/activities?limit=${limit}&offset=${offset}`),
    getActivity: (id: string) => request<{ data: Activity }>(`/activities/${encodeURIComponent(id)}`),
    createActivity: (input: ActivityInput) => request<{ data: Activity }>('/activities', { method: 'POST', body: input }),
    removeActivity: (id: string) => request<void>(`/activities/${encodeURIComponent(id)}`, { method: 'DELETE' })
  };
}
export type Api = ReturnType<typeof createApi>;
