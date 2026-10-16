import { useEffect, useRef, useState } from 'react';
import { createApi, ApiError } from '../services/api.ts';
import type { Session, User } from '../services/types.ts';
import { readSession, writeSession } from '../services/session.ts';
import type { StoredSession } from '../services/session.ts';
import { AuthPage } from '../pages/AuthPage.tsx';
import { Feedback, errorMessage } from '../components/Feedback.tsx';

export function App() {
  const [session, setSession] = useState<StoredSession | null>(() => readSession(window.sessionStorage));
  const sessionRef = useRef(session);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  function endSession(message = '') {
    sessionRef.current = null; writeSession(window.sessionStorage, null);
    setSession(null); setUser(null); setError(''); setNotice(message); setLoading(false);
  }
  const [api] = useState(() => createApi({
    getToken: () => sessionRef.current?.accessToken ?? null,
    onUnauthorized: () => endSession('Sua sessão expirou. Entre novamente.')
  }));
  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(() => endSession('Sua sessão expirou. Entre novamente.'), Math.max(0, Date.parse(session.expiresAt) - Date.now()));
    return () => window.clearTimeout(timer);
  }, [session]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    setLoading(true); setError('');
    api.me().then(({ data }) => { if (active) setUser(data); })
      .catch(error => { if (active && !(error instanceof ApiError && error.status === 401)) setError(errorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, session]);
  function login(value: Session) {
    const stored = { accessToken: value.accessToken, expiresAt: value.expiresAt };
    sessionRef.current = stored; writeSession(window.sessionStorage, stored);
    setUser(value.user); setNotice(''); setSession(stored);
  }
  async function logout() {
    setBusy(true); setError('');
    try { await api.logout(); endSession('Você saiu da sua conta.'); }
    catch (error) { if (!(error instanceof ApiError && error.status === 401)) setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  if (!session) return <AuthPage api={api} onLogin={login} notice={notice} />;
  return <><header className="header"><a className="brand" href="/">Smart Health<span>Cuide da sua rotina</span></a>
    <button className="secondary" onClick={logout} disabled={busy}>{busy ? 'Saindo…' : 'Sair'}</button></header>
    <main className="container"><Feedback error={error} />
      {loading ? <p role="status">Carregando seu perfil…</p> : user ? <section className="card"><h1>Olá, {user.name}</h1><p>Seu espaço de cuidado está pronto.</p></section>
        : <button onClick={() => setSession(current => current && { ...current })}>Tentar carregar novamente</button>}
    </main></>;
}
