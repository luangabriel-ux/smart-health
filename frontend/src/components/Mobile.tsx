import type { ReactNode } from 'react';
import { Icon } from './Icon.tsx';
import type { IconName } from './Icon.tsx';

export type Page =
  | 'home'
  | 'content'
  | 'articles'
  | 'reminders'
  | 'progress'
  | 'profile'
  | 'profile-edit'
  | 'recommendations'
  | 'settings'
  | 'premium'
  | 'professionals'
  | 'activities'
  | 'favorites';
export type Navigate = (page: Page) => void;
export function StatusBar() {
  return (
    <div className="status-bar" aria-hidden="true">
      <span>
        {new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
      <span className="status-icons">
        <Icon name="chart" size={12} />
        <Icon name="wifi" size={13} />
        <Icon name="battery" size={15} />
      </span>
    </div>
  );
}
export function Logo({ large = false }: { large?: boolean }) {
  return (
    <span className={`logo${large ? ' logo-large' : ''}`} aria-hidden="true">
      S
    </span>
  );
}
export function BrandHeader({ onProfile }: { onProfile: () => void }) {
  return (
    <header className="brand-header">
      <a className="brand" href="#home">
        <Logo />
        <span>Smart Health</span>
      </a>
      <button
        className="icon-button avatar-button"
        aria-label="Abrir perfil"
        onClick={onProfile}
      >
        <Icon name="user" size={19} />
      </button>
    </header>
  );
}
export function PageHeader({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack: () => void;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <button className="icon-button" onClick={onBack} aria-label="Voltar">
        <Icon name="back" />
      </button>
      <h1>{title}</h1>
      <div className="header-action">{action}</div>
    </header>
  );
}
export function BottomNav({
  page,
  navigate,
}: {
  page: Page;
  navigate: Navigate;
}) {
  const links: { page: Page; title: string; icon: IconName }[] = [
    { page: 'home', title: 'Home', icon: 'home' },
    { page: 'content', title: 'Treinos', icon: 'dumbbell' },
    { page: 'reminders', title: 'Programas', icon: 'calendar' },
    { page: 'progress', title: 'Progresso', icon: 'chart' },
  ];
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {links.map((item) => (
        <button
          key={item.page}
          onClick={() => navigate(item.page)}
          aria-current={page === item.page ? 'page' : undefined}
          className={page === item.page ? 'active' : ''}
        >
          <Icon name={item.icon} size={20} />
          <span>{item.title}</span>
        </button>
      ))}
    </nav>
  );
}
export function SectionTitle({
  children,
  action,
  onAction,
}: {
  children: ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {action && (
        <button className="text-button" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
export function EmptyState({
  icon = 'calendar',
  children,
}: {
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="soft-icon teal">
        <Icon name={icon} size={22} />
      </span>
      <p>{children}</p>
    </div>
  );
}
