import { useEffect, useRef, useState } from 'react';
import { createApi, ApiError } from '../services/api.ts';
import type { Session, User } from '../services/types.ts';
import { readSession, writeSession } from '../services/session.ts';
import type { StoredSession } from '../services/session.ts';
import { AuthPage } from '../pages/AuthPage.tsx';
import { HomePage } from '../pages/HomePage.tsx';
import { ProfilePage } from '../pages/ProfilePage.tsx';
import { UserProfilePage } from '../pages/UserProfilePage.tsx';
import { ActivitiesPage } from '../pages/ActivitiesPage.tsx';
import { RemindersPage } from '../pages/RemindersPage.tsx';
import { ProgressPage } from '../pages/ProgressPage.tsx';
import { ContentPage } from '../pages/ContentPage.tsx';
import { RecommendationsPage } from '../pages/RecommendationsPage.tsx';
import { SettingsPage } from '../pages/SettingsPage.tsx';
import { PremiumPage } from '../pages/PremiumPage.tsx';
import { ProfessionalsPage } from '../pages/ProfessionalsPage.tsx';
import { Feedback, errorMessage } from '../components/Feedback.tsx';
import { StatusBar, BrandHeader, BottomNav } from '../components/Mobile.tsx';
import type { Page } from '../components/Mobile.tsx';
import { InfoDialog } from '../components/InfoDialog.tsx';
import { ActivitySheet } from '../components/ActivitySheet.tsx';
import type { RegistrationType } from '../components/ActivitySheet.tsx';
import { ActivityForm } from '../components/ActivityForm.tsx';

const pages: Page[] = ['home','content','articles','reminders','progress','profile','profile-edit','recommendations','settings','premium','professionals','activities','favorites'];
function pageFromHash(): Page { const value = window.location.hash.slice(1) as Page; return pages.includes(value) ? value : 'home'; }
function sessionStorage() { try { return window.sessionStorage; } catch { return { getItem: () => null, setItem: () => {}, removeItem: () => {} }; } }
export function App() {
  const [session, setSession] = useState<StoredSession | null>(() => readSession(sessionStorage()));
  const sessionRef = useRef(session);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const [page, setPage] = useState<Page>(pageFromHash);
  const [info, setInfo] = useState(''); const [revision, setRevision] = useState(0);
  const [activity, setActivity] = useState<RegistrationType | 'choose' | null>(null);
  const [onboarding, setOnboarding] = useState(false); const [darkMode, setDarkMode] = useState(false);
  function navigate(next: Page) { setPage(next); setNotice(''); window.location.hash = next; window.scrollTo(0,0); }
  useEffect(() => { const change = () => { setPage(pageFromHash()); setActivity(null); window.scrollTo(0,0); }; window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  function endSession(message = '') {
    sessionRef.current = null; writeSession(sessionStorage(), null); setSession(null); setUser(null); setError(''); setNotice(message); setLoading(false); setActivity(null); setInfo('');
  }
  const [api] = useState(() => createApi({ getToken: () => sessionRef.current?.accessToken ?? null, onUnauthorized: () => endSession('Sua sessão expirou. Entre novamente.') }));
  useEffect(() => { if (!session) return; const timer = window.setTimeout(() => endSession('Sua sessão expirou. Entre novamente.'), Math.max(0, Date.parse(session.expiresAt) - Date.now())); return () => window.clearTimeout(timer); }, [session]);
  useEffect(() => {
    if (!session) return; let active = true; setLoading(true); setError('');
    api.me().then(({ data }) => { if (active) setUser(data); }).catch(error => { if (active && !(error instanceof ApiError && error.status === 401)) setError(errorMessage(error)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, session]);
  useEffect(() => { try { setDarkMode(user ? window.localStorage.getItem(`smart-health.dark.${user.id}`) === 'true' : false); } catch { setDarkMode(false); } }, [user?.id]);
  function changeTheme(value: boolean) { setDarkMode(value); try { window.localStorage.setItem(`smart-health.dark.${user!.id}`, String(value)); } catch { setInfo('O tema foi aplicado nesta sessão, mas não pôde ser salvo neste dispositivo.'); } }
  function login(value: Session) {
    const stored = { accessToken: value.accessToken, expiresAt: value.expiresAt }; sessionRef.current = stored; writeSession(sessionStorage(), stored);
    setUser(value.user); setNotice(''); setSession(stored); const incomplete = value.user.age === null && value.user.weightKg === null && value.user.heightCm === null; setOnboarding(incomplete); navigate(incomplete ? 'profile-edit' : 'home');
  }
  async function logout() { setBusy(true); setError(''); try { await api.logout(); endSession('Você saiu da sua conta.'); } catch (error) { if (!(error instanceof ApiError && error.status === 401)) setError(errorMessage(error)); } finally { setBusy(false); } }
  if (!session) return <AuthPage api={api} onLogin={login} notice={notice} />;
  const fullPage = ['profile-edit','settings','premium','professionals','activities'].includes(page);
  const updateUser = (value: User) => { setUser(value); setRevision(value => value + 1); };
  return <div className="app-shell" data-theme={darkMode ? 'dark' : 'light'}><StatusBar />
    {loading || !user ? <main className="screen-loading"><span className="spinner" /><p role="status">Carregando seu perfil…</p><Feedback error={error} />{error && <button className="primary" onClick={() => setSession(current => current && { ...current })}>Tentar novamente</button>}</main>
      : activity && activity !== 'choose' ? <ActivityForm key={activity} api={api} initialType={activity} onBack={() => setActivity(null)} onCreated={() => { setRevision(value => value + 1); setActivity(null); setNotice('Atividade registrada com sucesso.'); }} />
      : <>{!fullPage && <BrandHeader onProfile={() => navigate('profile')} />}
        {fullPage ? <>
          {page === 'profile-edit' && <ProfilePage api={api} user={user} onUpdate={updateUser} onboarding={onboarding} onBack={() => { setOnboarding(false); navigate(onboarding ? 'home' : 'profile'); }} />}
          {page === 'settings' && <SettingsPage onBack={() => navigate('profile')} darkMode={darkMode} onDarkMode={changeTheme} onInfo={setInfo} />}
          {page === 'premium' && <PremiumPage onBack={() => navigate('profile')} onInfo={setInfo} />}
          {page === 'professionals' && <ProfessionalsPage onBack={() => navigate('home')} onInfo={setInfo} />}
          {page === 'activities' && <ActivitiesPage api={api} />}
        </> : <main className="screen"><Feedback error={error} message={notice} />
          {page === 'home' && <HomePage api={api} user={user} navigate={navigate} revision={revision} onRegister={() => setActivity('choose')} />}
          {page === 'profile' && <UserProfilePage api={api} user={user} navigate={navigate} revision={revision} onInfo={setInfo} onLogout={logout} busy={busy} />}
          {page === 'content' && <ContentPage api={api} />}
          {page === 'articles' && <ContentPage api={api} />}
          {page === 'favorites' && <ContentPage api={api} />}
          {page === 'reminders' && <RemindersPage api={api} />}
          {page === 'progress' && <ProgressPage api={api} />}
          {page === 'recommendations' && <RecommendationsPage api={api} onProfile={() => navigate('profile-edit')} />}
        </main>}
        {!fullPage && <BottomNav page={page} navigate={navigate} />}
      </>}
    {activity === 'choose' && <ActivitySheet onChoose={setActivity} onWeight={() => { setActivity(null); navigate('profile-edit'); }} onClose={() => setActivity(null)} />}
    {info && <InfoDialog message={info} onClose={() => setInfo('')} />}
  </div>;
}
