import { useEffect, useState } from 'react';
import type { Api } from '../services/api.ts';
import type { Content, ContentFilters } from '../services/types.ts';
import { Feedback, errorMessage } from '../components/Feedback.tsx';
import { Icon } from '../components/Icon.tsx';
import { EmptyState, PageHeader } from '../components/Mobile.tsx';
import { ActivityForm } from '../components/ActivityForm.tsx';
import { readFavorites, saveFavorites } from '../services/favorites.ts';
import functional from '../assets/functional.webp';
import yoga from '../assets/yoga.webp';
import hiit from '../assets/hiit.webp';

const pageSize = 12;
function photo(item: Content) {
  return /yoga|mobilidade/i.test(item.title)
    ? yoga
    : /hiit|intens/i.test(item.title)
      ? hiit
      : functional;
}
function localStorage() {
  try {
    return window.localStorage;
  } catch {
    return {
      getItem: () => null,
      setItem: () => {
        throw new Error('Storage indisponível');
      },
    };
  }
}
export function ContentPage({
  api,
  userId = '',
  initialType = 'video',
  favoritesOnly = false,
  onPremium = () => {},
  onActivityCreated = () => {},
}: {
  api: Api;
  userId?: string;
  initialType?: 'article' | 'video';
  favoritesOnly?: boolean;
  onPremium?: () => void;
  onActivityCreated?: () => void;
}) {
  const [items, setItems] = useState<Content[]>([]);
  const [selected, setSelected] = useState<Content | null>(null);
  const [filters, setFilters] = useState<ContentFilters>({
    type: favoritesOnly ? undefined : initialType,
  });
  const [query, setQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [favorites, setFavorites] = useState(() =>
    readFavorites(localStorage(), userId),
  );
  const [savedOnly, setSavedOnly] = useState(favoritesOnly);
  const [mode, setMode] = useState<'detail' | 'timer' | 'record'>('detail');
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const load = async () => {
      if (savedOnly) {
        const records = await Promise.all(
          favorites.map((id) =>
            api
              .getContent(id)
              .then((response) => response.data)
              .catch((error) => {
                if (error.status === 404) return null;
                throw error;
              }),
          ),
        );
        const data = records
          .filter((item): item is Content => item !== null)
          .filter(
            (item) =>
              (!filters.type || item.type === filters.type) &&
              (!filters.category || item.category === filters.category) &&
              (!filters.search ||
                `${item.title} ${item.category}`
                  .toLocaleLowerCase('pt-BR')
                  .includes(filters.search.toLocaleLowerCase('pt-BR'))),
          );
        return { data: data.slice(offset, offset + pageSize + 1) };
      }
      return api.listContent(filters, pageSize + 1, offset);
    };
    load()
      .then(({ data }) => {
        if (active) {
          setItems(data.slice(0, pageSize));
          setHasNext(data.length > pageSize);
        }
      })
      .catch((error) => {
        if (active) setError(errorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [api, filters, offset, savedOnly, favorites]);
  useEffect(() => {
    if (mode !== 'timer' || !running) return;
    const started = Date.now() - elapsed * 1000;
    const timer = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      500,
    );
    return () => window.clearInterval(timer);
  }, [mode, running]);
  function favorite(item: Content) {
    const next = favorites.includes(item.id)
      ? favorites.filter((id) => id !== item.id)
      : [item.id, ...favorites].slice(0, 100);
    setFavorites(next);
    setMessage(
      saveFavorites(localStorage(), userId, next)
        ? 'Favoritos atualizados neste dispositivo.'
        : 'Favorito atualizado nesta sessão. Não foi possível salvar neste dispositivo.',
    );
  }
  async function open(id: string) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      setSelected((await api.getContent(id)).data);
      setMode('detail');
      setElapsed(0);
      setRunning(false);
      window.scrollTo(0, 0);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function share(item: Content) {
    try {
      if (navigator.share)
        await navigator.share({
          title: item.title,
          text: item.textContent ?? item.title,
        });
      else {
        await navigator.clipboard.writeText(
          `${item.title}${item.textContent ? '\n\n' + item.textContent : ''}`,
        );
        setMessage('Conteúdo copiado.');
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError'))
        setError('Não foi possível compartilhar este conteúdo.');
    }
  }
  if (selected) {
    if (mode === 'record')
      return (
        <div className="content-detail-screen">
          <ActivityForm
            api={api}
            initialType="exercise"
            initialMinutes={Math.min(
              1440,
              Math.max(1, Math.round(elapsed / 60)),
            )}
            onBack={() => setMode('timer')}
            onCreated={() => {
              setMode('detail');
              setMessage('Treino registrado.');
              onActivityCreated();
            }}
          />
        </div>
      );
    if (mode === 'timer')
      return (
        <div className="content-detail-screen timer-screen">
          <PageHeader
            title="Cronômetro de Treino"
            onBack={() => {
              setRunning(false);
              setMode('detail');
            }}
          />
          <main className="timer-content">
            <span className="badge">
              {running ? 'Treino em andamento' : 'Treino pausado'}
            </span>
            <div className="timer-title">
              <small>{selected.category}</small>
              <h1>{selected.title}</h1>
              <p>Acompanhe o tempo da sua atividade</p>
            </div>
            <div className="timer-ring">
              <strong>
                {String(Math.floor(elapsed / 60)).padStart(2, '0')}:
                {String(elapsed % 60).padStart(2, '0')}
              </strong>
              <span className="badge">
                {running ? 'Em andamento' : 'Pausado'}
              </span>
            </div>
            <div className="timer-reference white-card">
              <span className="soft-icon orange">
                <Icon name="dumbbell" />
              </span>
              <p>Registre a duração e as métricas ao finalizar.</p>
            </div>
            <div className="timer-controls">
              <button
                className="icon-button"
                onClick={() => {
                  setRunning(false);
                  setElapsed(0);
                }}
                aria-label="Reiniciar cronômetro"
              >
                <Icon name="clock" />
              </button>
              <button
                className="timer-pause"
                aria-label={running ? 'Pausar treino' : 'Continuar treino'}
                onClick={() => setRunning((value) => !value)}
              >
                <Icon name={running ? 'pause' : 'play'} size={29} />
              </button>
            </div>
            <button
              className="danger full"
              onClick={() => {
                setRunning(false);
                setMode('record');
              }}
            >
              Finalizar Treino
            </button>
          </main>
        </div>
      );
    const article = selected.type === 'article';
    return (
      <div className="content-detail-screen">
        <PageHeader
          title={article ? 'Artigo Educativo' : 'Detalhes do Treino'}
          onBack={() => setSelected(null)}
          action={
            <button
              className="icon-button"
              aria-label={
                article ? 'Compartilhar artigo' : 'Favoritar conteúdo'
              }
              onClick={() => (article ? share(selected) : favorite(selected))}
            >
              <Icon name={article ? 'share' : 'heart'} size={18} />
            </button>
          }
        />
        <article className="content-reading">
          <Feedback error={error} message={message} />
          {article ? (
            <div className="article-hero">
              <Icon name="clock" size={45} />
              <strong>SMART HEALTH</strong>
              <span>{selected.category.toLocaleUpperCase('pt-BR')}</span>
            </div>
          ) : (
            <div className="video-detail-hero">
              <img
                src={photo(selected)}
                alt="Imagem ilustrativa do protótipo para atividades físicas"
              />
              {!selected.locked &&
                selected.url &&
                /^https:\/\//i.test(selected.url) && (
                  <a
                    className="video-play"
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Abrir vídeo"
                  >
                    <Icon name="play" size={25} />
                  </a>
                )}
              <span className="badge">{selected.difficulty ?? 'Vídeo'}</span>
            </div>
          )}
          <div className="article-meta">
            <span className="badge">{selected.category}</span>
            {article && selected.textContent && (
              <small>
                ·{' '}
                {Math.max(
                  1,
                  Math.ceil(selected.textContent.split(/\s+/).length / 200),
                )}{' '}
                min de leitura
              </small>
            )}
          </div>
          <h1>{selected.title}</h1>
          <div className="article-author">
            <span className="mini-logo">S</span>
            <div>
              <strong>Conteúdo Smart Health</strong>
              <small>
                Publicado em{' '}
                {new Date(selected.createdAt).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </small>
            </div>
          </div>
          {selected.locked ? (
            <div className="empty-state">
              <Icon name="lock" size={26} />
              <p>Este conteúdo está disponível no plano Premium.</p>
              <button className="primary full" onClick={onPremium}>
                Conhecer plano Premium
              </button>
            </div>
          ) : (
            <>
              {article ? (
                <div className="article-body">
                  {selected.textContent?.split(/\n\n+/).map((text, index) => (
                    <p key={index}>{text}</p>
                  ))}
                </div>
              ) : (
                <>
                  <p className="video-description">
                    Abra o vídeo da biblioteca para acompanhar este conteúdo.
                    Você também pode usar o cronômetro para registrar a duração
                    da sua própria atividade.
                  </p>
                  <div className="video-facts">
                    <div>
                      ▶<strong>Vídeo</strong>
                      <small>Formato</small>
                    </div>
                    <div>
                      ✦
                      <strong>
                        {selected.isPremium ? 'Premium' : 'Livre'}
                      </strong>
                      <small>Acesso</small>
                    </div>
                    <div>
                      ⌁<strong>{selected.difficulty ?? 'Não informado'}</strong>
                      <small>Nível</small>
                    </div>
                  </div>
                  <h2 className="session-heading">Sua Sessão</h2>
                  <div className="session-step">
                    <span>1</span>
                    <div>
                      <strong>Abra o conteúdo da biblioteca</strong>
                      <small>A sequência é apresentada no vídeo.</small>
                    </div>
                  </div>
                  <div className="session-step">
                    <span>2</span>
                    <div>
                      <strong>Acompanhe seu tempo</strong>
                      <small>Use o cronômetro e registre sua atividade.</small>
                    </div>
                  </div>
                  <button
                    className="primary full start-workout"
                    onClick={() => {
                      setElapsed(0);
                      setRunning(true);
                      setMode('timer');
                    }}
                  >
                    <Icon name="play" size={17} />
                    Começar Treino
                  </button>
                </>
              )}
            </>
          )}
          <button
            className={`full ${article ? 'primary' : 'outline'} save-content`}
            onClick={() => favorite(selected)}
          >
            <Icon name="bookmark" size={16} />
            {favorites.includes(selected.id)
              ? 'Remover dos Favoritos'
              : article
                ? 'Salvar Artigo nos Favoritos'
                : 'Salvar nos Favoritos'}
          </button>
          <small className="local-favorites-note">
            Favoritos salvos neste dispositivo.
          </small>
        </article>
      </div>
    );
  }
  const categories = Array.from(
    new Set([
      'Todos',
      'Emagrecimento',
      'Força',
      'Funcional',
      ...(filters.category ? [filters.category] : []),
      ...items.map((item) => item.category),
    ]),
  );
  return (
    <>
      <h1>
        {favoritesOnly
          ? 'Meus Favoritos'
          : initialType === 'article'
            ? 'Notícias & Dicas'
            : 'Vídeos'}
      </h1>
      <p className="subtitle">
        {favoritesOnly
          ? 'Seus conteúdos salvos neste dispositivo.'
          : initialType === 'article'
            ? 'Informação para acompanhar sua rotina.'
            : 'Encontre o treino ideal para você'}
      </p>
      <form
        className="library-search"
        onSubmit={(event) => {
          event.preventDefault();
          setOffset(0);
          setFilters((current) => ({
            ...current,
            ...(query.trim()
              ? { search: query.trim() }
              : { search: undefined }),
          }));
        }}
      >
        <div className="input-with-icon search-field">
          <Icon name="search" size={16} />
          <input
            aria-label="Buscar conteúdos"
            placeholder="Buscar treinos…"
            value={query}
            maxLength={200}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button aria-label="Pesquisar conteúdos" type="submit">
            <Icon name="next" size={15} />
          </button>
        </div>
      </form>
      {!favoritesOnly && (
        <div className="chips library-categories">
          {categories.map((item) => (
            <button
              key={item}
              className={
                filters.category === item ||
                (item === 'Todos' && !filters.category)
                  ? 'active'
                  : ''
              }
              onClick={() => {
                setFilters((current) => ({
                  ...current,
                  category: item === 'Todos' ? undefined : item,
                }));
                setOffset(0);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
      <div className="library-tabs">
        <button
          className={!savedOnly ? 'active' : ''}
          onClick={() => {
            setSavedOnly(false);
            setOffset(0);
          }}
        >
          Recentes
        </button>
        <button
          className={savedOnly ? 'active' : ''}
          onClick={() => {
            setSavedOnly(true);
            setOffset(0);
          }}
        >
          Favoritos
        </button>
      </div>
      <Feedback error={error} message={message} />
      {loading ? (
        <p role="status" className="loading-text">
          Carregando conteúdos…
        </p>
      ) : items.length ? (
        <div className="video-grid">
          {items.map((item) => (
            <article className="video-card" key={item.id}>
              <button
                className="video-thumbnail"
                disabled={busy}
                onClick={() => open(item.id)}
                aria-label={`Abrir ${item.title}`}
              >
                <img src={photo(item)} alt="" />
                {item.locked ? (
                  <span className="premium-video-badge">👑 Premium</span>
                ) : (
                  <span className="video-play">
                    <Icon
                      name={item.type === 'article' ? 'bookmark' : 'play'}
                      size={23}
                    />
                  </span>
                )}
              </button>
              <div className="video-card-body">
                <button disabled={busy} onClick={() => open(item.id)}>
                  <h2>{item.title}</h2>
                </button>
                <div>
                  <span
                    className={`level-badge ${item.locked ? 'advanced' : ''}`}
                  >
                    {item.difficulty ??
                      (item.type === 'article' ? 'Artigo' : 'Vídeo')}
                  </span>
                  <small>{item.category}</small>
                  <button
                    aria-label={`Favoritar ${item.title}`}
                    onClick={() => favorite(item)}
                  >
                    <Icon name="heart" size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        !error && (
          <EmptyState icon={savedOnly ? 'heart' : 'play'}>
            {savedOnly
              ? 'Você ainda não salvou conteúdos nesta seleção.'
              : 'Nenhum conteúdo disponível para esta seleção. Novos materiais aparecerão aqui quando forem publicados.'}
          </EmptyState>
        )
      )}
      {error && (
        <button
          className="outline full"
          onClick={() => setFilters((current) => ({ ...current }))}
        >
          Tentar novamente
        </button>
      )}
      <nav className="pagination" aria-label="Paginação dos conteúdos">
        <button
          className="outline"
          disabled={loading || busy || offset === 0}
          onClick={() => setOffset(offset - pageSize)}
        >
          Anterior
        </button>
        <span>Página {Math.floor(offset / pageSize) + 1}</span>
        <button
          className="outline"
          disabled={loading || busy || !hasNext || Boolean(error)}
          onClick={() => setOffset(offset + pageSize)}
        >
          Próxima
        </button>
      </nav>
    </>
  );
}
