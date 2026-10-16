import { useEffect, useRef, useState } from 'react';
import { createApi, ApiError } from '../services/api.ts';
import type { Session, User } from '../services/types.ts';
import { readSession, writeSession } from '../services/session.ts';
import type { StoredSession } from '../services/session.ts';
import { AuthPage } from '../pages/AuthPage.tsx';
import { ProfilePage } from '../pages/ProfilePage.tsx';
import { ActivitiesPage } from '../pages/ActivitiesPage.tsx';
import { RemindersPage } from '../pages/RemindersPage.tsx';
import { ProgressPage } from '../pages/ProgressPage.tsx';
import { ContentPage } from '../pages/ContentPage.tsx';
import { RecommendationsPage } from '../pages/RecommendationsPage.tsx';
import { Feedback, errorMessage } from '../components/Feedback.tsx';

export function App() {
  const [session, setSession] = useState<StoredSession | null>(() => readSession(window.sessionStorage));
  const sessionRef = useRef(session);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const pages = { activities: 'Atividades', reminders: 'Lembretes', progress: 'Progresso', content: 'Conteúdos', recommendations: 'Recomendações', profile: 'Meu perfil' };
  const [page, setPage] = useState<keyof typeof pages>('activities');
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
          {(Object.entries(pages) as [keyof typeof pages, string][]).map(([key, label]) => <button key={key} aria-current={page === key ? 'page' : undefined} className={page === key ? '' : 'secondary'} onClick={() => setPage(key)}>{label}</button>)}
        </nav>
        {page === 'activities' && <ActivitiesPage api={api} />}
        {page === 'profile' && <ProfilePage api={api} user={user} onUpdate={setUser} />}
        {page === 'reminders' && <RemindersPage api={api} />}
        {page === 'progress' && <ProgressPage api={api} />}
        {page === 'content' && <ContentPage api={api} />}
        {page === 'recommendations' && <RecommendationsPage api={api} onProfile={() => setPage('profile')} />}
      </>
        : <button onClick={() => setSession(current => current && { ...current })}>Tentar carregar novamente</button>}
    </main></>;
}
