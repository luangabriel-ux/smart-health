import { useEffect, useState } from 'react';
import type { Api } from '../services/api.ts';
import type { Activity, ActivityType } from '../services/types.ts';
import { activityLabels } from '../components/ActivityForm.tsx';
import { Feedback, errorMessage } from '../components/Feedback.tsx';
import { Icon } from '../components/Icon.tsx';
import { EmptyState, PageHeader } from '../components/Mobile.tsx';
import { useHealthData } from '../app/useHealthData.ts';
import { activeStreak, dateKey, formatNumber } from '../services/health.ts';

const pageSize = 20;
export function ActivitiesPage({
  api,
  onBack = () => {
    window.location.hash = 'progress';
  },
  onAdd = () => {
    window.location.hash = 'home';
  },
}: {
  api: Api;
  onBack?: () => void;
  onAdd?: () => void;
}) {
  const [items, setItems] = useState<Activity[]>([]);
  const [offset, setOffset] = useState(0);
  const [revision, setRevision] = useState(0);
  const [type, setType] = useState<ActivityType | undefined>();
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const health = useHealthData(api, revision);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setConfirmId(null);
    api
      .listActivities(pageSize + 1, offset, type)
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
  }, [api, offset, revision, type]);
  async function remove(id: string) {
    setBusy(true);
    setError('');
    try {
      await api.removeActivity(id);
      setConfirmId(null);
      setMessage('Atividade excluída.');
      if (items.length === 1 && offset > 0) setOffset(offset - pageSize);
      else setRevision((value) => value + 1);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  const filters: [ActivityType | undefined, string][] = [
    [undefined, 'Todos'],
    ['exercise', 'Treinos'],
    ['water', 'Água'],
    ['habit', 'Hábitos'],
    ['meal', 'Refeições'],
  ];
  return (
    <>
      <PageHeader
        title="Histórico Completo"
        onBack={onBack}
        action={
          <button
            className="icon-button"
            aria-label="Adicionar registro"
            onClick={onAdd}
          >
            <Icon name="plus" size={17} />
          </button>
        }
      />
      <main className="screen no-nav history-screen">
        <div className="history-summary teal-panel">
          <div>
            <strong>{health.days.length}</strong>
            <small>Dias Ativos</small>
          </div>
          <div>
            <strong>{formatNumber(health.totals.durationMinutes)}</strong>
            <small>Minutos</small>
          </div>
          <div>
            <strong>{formatNumber(health.totals.calories)}</strong>
            <small>kcal Queimadas</small>
          </div>
        </div>
        <p className="period-note">Resumo dos últimos 30 dias</p>
        <Feedback error={health.error} />
        {activeStreak(health.days) > 0 && (
          <div className="streak-note">
            🔥{' '}
            <span>
              Você tem{' '}
              <strong>
                {activeStreak(health.days)}{' '}
                {activeStreak(health.days) === 1
                  ? 'dia consecutivo'
                  : 'dias consecutivos'}
              </strong>{' '}
              de atividades registradas!
            </span>
          </div>
        )}
        <div className="chips history-filters">
          {filters.map(([value, label]) => (
            <button
              key={label}
              className={type === value ? 'active' : ''}
              onClick={() => {
                setType(value);
                setOffset(0);
                setMessage('');
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <Feedback error={error} message={message} />
        {error && (
          <button
            className="outline full"
            onClick={() => setRevision((value) => value + 1)}
          >
            Tentar novamente
          </button>
        )}
        {loading ? (
          <p role="status" className="loading-text">
            Carregando atividades…
          </p>
        ) : !error && items.length ? (
          <div className="history-list">
            {items.map((item, index) => {
              const day = dateKey(new Date(item.occurredAt)),
                isToday = day === dateKey();
              return (
                <div key={item.id}>
                  {(index === 0 ||
                    dateKey(new Date(items[index - 1].occurredAt)) !== day) && (
                    <h2 className="history-date">
                      {isToday ? 'HOJE · ' : ''}
                      {new Date(`${day}T12:00:00Z`).toLocaleDateString(
                        'pt-BR',
                        { day: 'numeric', month: 'long', timeZone: 'UTC' },
                      )}
                    </h2>
                  )}
                  <article className="history-item white-card">
                    <span
                      className={`soft-icon ${item.type === 'water' ? 'teal' : item.type === 'exercise' ? 'orange' : item.type === 'meal' ? 'green' : 'purple'}`}
                    >
                      <Icon
                        name={
                          item.type === 'water'
                            ? 'water'
                            : item.type === 'exercise'
                              ? 'dumbbell'
                              : item.type === 'meal'
                                ? 'food'
                                : 'health'
                        }
                        size={20}
                      />
                    </span>
                    <div className="history-description">
                      <h3>{item.description}</h3>
                      <p>
                        {activityLabels[item.type]}
                        {item.durationMinutes !== null
                          ? ` · ${item.durationMinutes} min`
                          : ''}
                        {item.steps !== null
                          ? ` · ${formatNumber(item.steps)} passos`
                          : ''}
                      </p>
                      <button
                        className="text-button history-delete"
                        disabled={busy}
                        onClick={() => setConfirmId(item.id)}
                      >
                        Excluir
                      </button>
                    </div>
                    <div className="history-measure">
                      <strong
                        className={item.type === 'water' ? 'blue' : 'orange'}
                      >
                        {item.type === 'water'
                          ? `${formatNumber(item.waterMl ?? 0)} ml`
                          : item.calories !== null
                            ? `🔥 ${formatNumber(item.calories)} kcal`
                            : ''}
                      </strong>
                      <small>
                        {new Date(item.occurredAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </div>
                  </article>
                  {confirmId === item.id && (
                    <div className="delete-confirm white-card">
                      <p>Excluir este registro?</p>
                      <div className="actions">
                        <button
                          className="danger"
                          disabled={busy}
                          onClick={() => remove(item.id)}
                        >
                          {busy ? 'Excluindo…' : 'Confirmar exclusão'}
                        </button>
                        <button
                          className="secondary"
                          disabled={busy}
                          onClick={() => setConfirmId(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          !error && (
            <EmptyState icon="calendar">
              Nenhuma atividade encontrada. Registre sua rotina para construir
              seu histórico.
            </EmptyState>
          )
        )}
        <nav className="pagination" aria-label="Paginação das atividades">
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
            disabled={loading || busy || Boolean(error) || !hasNext}
            onClick={() => setOffset(offset + pageSize)}
          >
            Próxima
          </button>
        </nav>
      </main>
    </>
  );
}
