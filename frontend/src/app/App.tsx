import { useEffect, useRef, useState } from 'react';
import { createApi, ApiError } from '../services/api.ts';
import type { Session, User } from '../services/types.ts';
import { readSession, writeSession } from '../services/session.ts';
import type { StoredSession } from '../services/session.ts';
import { AuthPage } from '../pages/AuthPage.tsx';
import { ProfilePage } from '../pages/ProfilePage.tsx';
import { ActivitiesPage } from '../pages/ActivitiesPage.tsx';
import { Feedback, errorMessage } from '../components/Feedback.tsx';

export function App() {
  const [session, setSession] = useState<StoredSession | null>(() => readSession(window.sessionStorage));
  const sessionRef = useRef(session);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState<'activities' | 'profile'>('activities');
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
    setUser(value.user); setNotice(''); setPage('activities'); setSession(stored);
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
      {loading ? <p role="status">Carregando seu perfil…</p> : user ? <>
        <div className="welcome"><span className="eyebrow">SUA ROTINA, SEU RITMO</span><h1>Olá, {user.name}</h1><p>Acompanhe seus hábitos e mantenha suas informações atualizadas.</p></div>
        <nav className="tabs" aria-label="Menu principal">
          <button aria-current={page === 'activities' ? 'page' : undefined} className={page === 'activities' ? '' : 'secondary'} onClick={() => setPage('activities')}>Atividades</button>
          <button aria-current={page === 'profile' ? 'page' : undefined} className={page === 'profile' ? '' : 'secondary'} onClick={() => setPage('profile')}>Meu perfil</button>
        </nav>
        {page === 'profile' ? <ProfilePage api={api} user={user} onUpdate={setUser} /> : <ActivitiesPage api={api} />}
      </>
        : <button onClick={() => setSession(current => current && { ...current })}>Tentar carregar novamente</button>}
    </main></>;
}
