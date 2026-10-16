import type { Api } from '../services/api.ts';
import type { User } from '../services/types.ts';
import type { Navigate, Page } from '../components/Mobile.tsx';
import { Icon } from '../components/Icon.tsx';
import type { IconName } from '../components/Icon.tsx';
import { useHealthData } from '../app/useHealthData.ts';
import { activeStreak, formatNumber } from '../services/health.ts';
import { Feedback } from '../components/Feedback.tsx';

const menu: {
  label: string;
  icon: IconName;
  page?: Page;
  info?: string;
  color?: string;
}[] = [
  { label: 'Plano Premium', icon: 'crown', page: 'premium', color: 'gold' },
  { label: 'Meus Favoritos', icon: 'heart', page: 'favorites', color: 'red' },
  { label: 'Lembretes', icon: 'bell', page: 'reminders', color: 'gold' },
  {
    label: 'Histórico de Progresso',
    icon: 'chart',
    page: 'activities',
    color: 'blue',
  },
  { label: 'Configurações', icon: 'settings', page: 'settings' },
  {
    label: 'Ajuda e Suporte',
    icon: 'help',
    info: 'Para ajuda com o ambiente acadêmico, procure a equipe do projeto Smart Health. O atendimento por chat ainda não está disponível.',
  },
  {
    label: 'Privacidade',
    icon: 'shield',
    info: 'Seu perfil, atividades, lembretes e metas são acessados por sua sessão autenticada. O Smart Health não compartilha esses registros entre as contas da aplicação.',
  },
];
export function UserProfilePage({
  api,
  user,
  navigate,
  revision,
  onInfo,
  onLogout,
  busy,
}: {
  api: Api;
  user: User;
  navigate: Navigate;
  revision: number;
  onInfo: (message: string) => void;
  onLogout: () => void;
  busy: boolean;
}) {
  const health = useHealthData(api, revision);
  return (
    <>
      <h1 className="page-title">Perfil</h1>
      <div className="profile-banner teal-panel">
        <div className="profile-identity">
          <button
            className="profile-avatar"
            aria-label="Editar perfil"
            onClick={() => navigate('profile-edit')}
          >
            <Icon name="user" size={32} />
            <span>
              <Icon name="edit" size={10} />
            </span>
          </button>
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <div>
              <span className="plan-pill">
                Plano {user.plan === 'premium' ? 'Premium' : 'Free'}
              </span>
              <small>
                Desde{' '}
                {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  month: 'short',
                  year: 'numeric',
                })}
              </small>
            </div>
          </div>
        </div>
        <div className="profile-stats">
          <div>
            <strong>
              {health.loading ? '…' : health.error ? '—' : health.days.length}
            </strong>
            <small>Dias ativos</small>
          </div>
          <div>
            <strong>
              {health.loading
                ? '…'
                : health.error
                  ? '—'
                  : formatNumber(health.totals.calories)}
            </strong>
            <small>Calorias</small>
          </div>
          <div>
            <strong>
              {health.loading
                ? '…'
                : health.error
                  ? '—'
                  : `${activeStreak(health.days)} ${activeStreak(health.days) === 1 ? 'dia' : 'dias'}`}
            </strong>
            <small>Sequência</small>
          </div>
        </div>
        <small className="profile-period">Atividade dos últimos 30 dias</small>
      </div>
      <Feedback error={health.error} />
      <button className="premium-banner" onClick={() => navigate('premium')}>
        <span>👑</span>
        <div>
          <h3>Seja Premium</h3>
          <small>Desbloqueie todos os recursos</small>
        </div>
        <Icon name="next" size={19} />
      </button>
      <nav className="menu-card" aria-label="Menu do perfil">
        {menu.map((item) => (
          <button
            key={item.label}
            onClick={() =>
              item.page ? navigate(item.page) : onInfo(item.info!)
            }
          >
            <Icon name={item.icon} size={18} className={item.color ?? ''} />
            <span>{item.label}</span>
            {item.page === 'premium' && (
              <small className="new-label">Novo</small>
            )}
            <Icon name="next" size={15} />
          </button>
        ))}
      </nav>
      <button className="logout-button full" onClick={onLogout} disabled={busy}>
        <Icon name="logout" size={16} />
        {busy ? 'Saindo…' : 'Sair da conta'}
      </button>
    </>
  );
}
