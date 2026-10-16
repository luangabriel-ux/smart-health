import { useEffect, useState } from 'react';
import type { Api } from '../services/api.ts';
import type { Content, User } from '../services/types.ts';
import { useHealthData } from '../app/useHealthData.ts';
import { MetricCards } from '../components/MetricCards.tsx';
import { EmptyState, SectionTitle } from '../components/Mobile.tsx';
import type { Navigate, Page } from '../components/Mobile.tsx';
import { Icon } from '../components/Icon.tsx';
import type { IconName } from '../components/Icon.tsx';
import { Feedback, errorMessage } from '../components/Feedback.tsx';

const shortcuts: {
  label: string;
  page: Page;
  icon: IconName;
  color: string;
}[] = [
  { label: 'Treinos', page: 'content', icon: 'dumbbell', color: 'blue' },
  { label: 'Vídeos', page: 'content', icon: 'play', color: 'yellow' },
  { label: 'Programas', page: 'reminders', icon: 'calendar', color: 'purple' },
  {
    label: 'Profissionais',
    page: 'professionals',
    icon: 'user',
    color: 'green',
  },
  { label: 'Progresso', page: 'progress', icon: 'chart', color: 'blue' },
  { label: 'Bem-estar', page: 'recommendations', icon: 'heart', color: 'pink' },
];
export function HomePage({
  api,
  user,
  navigate,
  revision,
  onRegister,
}: {
  api: Api;
  user: User;
  navigate: Navigate;
  revision: number;
  onRegister: () => void;
}) {
  const health = useHealthData(api, revision);
  const [article, setArticle] = useState<Content | null>(null);
  const [contentError, setContentError] = useState('');
  useEffect(() => {
    let active = true;
    api
      .listContent({ type: 'article' }, 1)
      .then(({ data }) => {
        if (active) setArticle(data[0] ?? null);
      })
      .catch((error) => {
        if (active) setContentError(errorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [api]);
  const hour = new Date().getHours(),
    greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  return (
    <>
      <div className="home-greeting">
        <p>{greeting}</p>
        <h1>{user.name.trim().split(' ')[0]}! 👋</h1>
        <p>
          {new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(new Date())}
        </p>
      </div>
      <SectionTitle>Progresso de Hoje</SectionTitle>
      <Feedback error={health.error} />
      {health.loading ? (
        <p className="loading-text" role="status">
          Carregando seu progresso…
        </p>
      ) : (
        !health.error && (
          <button
            className="home-progress teal-panel"
            onClick={() => navigate('progress')}
            aria-label="Ver progresso de hoje"
          >
            <MetricCards values={health.daily} goals={health.goals} compact />
          </button>
        )
      )}
      <SectionTitle>Em Destaque</SectionTitle>
      <article className="featured-workout">
        <small>Movimento no seu ritmo</small>
        <h2>Treino Funcional</h2>
        <button onClick={() => navigate('content')}>
          <Icon name="play" size={12} />
          Explorar treinos
        </button>
      </article>
      <div className="carousel-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <SectionTitle>Acesso Rápido</SectionTitle>
      <div className="shortcut-grid">
        {shortcuts.map((item) => (
          <button key={item.label} onClick={() => navigate(item.page)}>
            <span className={`soft-icon ${item.color}`}>
              <Icon name={item.icon} size={21} />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <SectionTitle action="Ver todas" onAction={() => navigate('articles')}>
        Notícias &amp; Dicas
      </SectionTitle>
      <Feedback error={contentError} />
      {article ? (
        <button className="news-card" onClick={() => navigate('articles')}>
          <span className="news-icon">
            <Icon name="coffee" size={25} />
          </span>
          <div>
            <small>{article.category}</small>
            <h3>{article.title}</h3>
            <p>
              {article.locked
                ? 'Conteúdo Premium'
                : 'Leia o material na nossa biblioteca.'}
            </p>
          </div>
        </button>
      ) : (
        !contentError && (
          <EmptyState icon="bookmark">
            Novos artigos aparecerão aqui quando estiverem disponíveis na
            biblioteca.
          </EmptyState>
        )
      )}
      <button
        className="floating-add"
        onClick={onRegister}
        aria-label="Registrar atividade de hoje"
      >
        <Icon name="plus" size={25} />
      </button>
    </>
  );
}
