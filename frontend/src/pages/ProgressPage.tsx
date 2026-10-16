import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Api } from '../services/api.ts';
import type { GoalsInput } from '../services/types.ts';
import { useHealthData } from '../app/useHealthData.ts';
import { Feedback, errorMessage } from '../components/Feedback.tsx';
import { Icon } from '../components/Icon.tsx';
import { MetricCards } from '../components/MetricCards.tsx';
import { EmptyState, PageHeader, SectionTitle } from '../components/Mobile.tsx';
import { formatNumber, shiftDate } from '../services/health.ts';

const metrics = [
  ['steps', 'Passos Diários', 'steps', 500, 'passos'],
  ['calories', 'Gasto Calórico', 'fire', 50, 'kcal'],
  ['waterMl', 'Ingestão de Água', 'water', 250, 'ml'],
  ['durationMinutes', 'Tempo de Exercício', 'clock', 10, 'min'],
] as const;
export function ProgressPage({
  api,
  revision = 0,
  onRegister = () => {},
  onHistory = () => {
    window.location.hash = 'activities';
  },
  onChanged = () => {},
}: {
  api: Api;
  revision?: number;
  onRegister?: () => void;
  onHistory?: () => void;
  onChanged?: () => void;
}) {
  const [reload, setReload] = useState(0);
  const health = useHealthData(api, revision + reload);
  const [monthly, setMonthly] = useState(false);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  function openGoals() {
    setValues(
      Object.fromEntries(
        metrics.map(([key]) => [key, health.goals?.[key]?.toString() ?? '']),
      ),
    );
    setError('');
    setEditing(true);
    window.scrollTo(0, 0);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: GoalsInput = {};
    for (const [key] of metrics)
      if (values[key] !== '') input[key] = Number(values[key]);
    setError('');
    if (!Object.keys(input).length) {
      setError('Informe pelo menos uma meta.');
      return;
    }
    setBusy(true);
    try {
      await api.saveGoals(input);
      setEditing(false);
      setReload((value) => value + 1);
      onChanged();
      setMessage('Metas atualizadas.');
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  if (editing)
    return (
      <div className="goals-editor">
        <PageHeader
          title="Editar Metas de Saúde"
          onBack={() => setEditing(false)}
        />
        <div className="editor-content">
          <p className="subtitle">
            Ajuste seus objetivos diários para acompanhar sua rotina.
          </p>
          <Feedback error={error} />
          <form onSubmit={save}>
            <fieldset disabled={busy}>
              {metrics.map(([key, label, icon, increment, unit]) => (
                <section className="goal-editor-card white-card" key={key}>
                  <div>
                    <h2>
                      <Icon name={icon} size={17} />
                      {label}
                    </h2>
                    <label className="goal-value">
                      <input
                        name={key}
                        type="number"
                        min={1}
                        max={2147483647}
                        step={1}
                        aria-label={label}
                        value={values[key] ?? ''}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                      />
                      <span>{unit}</span>
                    </label>
                  </div>
                  <div className="goal-stepper">
                    <button
                      type="button"
                      aria-label={`Diminuir ${label}`}
                      onClick={() =>
                        setValues((current) => ({
                          ...current,
                          [key]: String(
                            Math.max(
                              1,
                              Number(current[key] || increment) - increment,
                            ),
                          ),
                        }))
                      }
                    >
                      −{increment}
                    </button>
                    <small>Definida por você</small>
                    <button
                      type="button"
                      aria-label={`Aumentar ${label}`}
                      onClick={() =>
                        setValues((current) => ({
                          ...current,
                          [key]: String(
                            Math.min(
                              2147483647,
                              Number(current[key] || 0) + increment,
                            ),
                          ),
                        }))
                      }
                    >
                      +{increment}
                    </button>
                  </div>
                </section>
              ))}
              <small>
                Campos vazios removem as metas anteriores. Informe pelo menos
                uma meta.
              </small>
              <button className="primary full" type="submit">
                {busy ? 'Salvando…' : 'Salvar Novas Metas'}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    );
  const percent = health.goals?.steps
    ? Math.round((health.daily.steps / health.goals.steps) * 100)
    : 0;
  const chartDates = Array.from({ length: monthly ? 30 : 7 }, (_, index) =>
    shiftDate(health.today, index - (monthly ? 29 : 6)),
  );
  const chart = chartDates.map((date) => ({
    date,
    value: health.days.find((day) => day.date === date)?.durationMinutes ?? 0,
  }));
  const max = Math.max(...chart.map((day) => day.value), 1);
  return (
    <>
      <div className="progress-heading">
        <div>
          <h1>Progresso</h1>
          <p className="subtitle">Acompanhe sua evolução</p>
        </div>
        <button
          className="round-add"
          onClick={onRegister}
          aria-label="Registrar atividade"
        >
          <Icon name="plus" size={24} />
        </button>
      </div>
      <Feedback error={health.error} message={message} />
      {health.loading ? (
        <p className="loading-text" role="status">
          Carregando progresso…
        </p>
      ) : health.error ? (
        <button
          className="outline full"
          onClick={() => setReload((value) => value + 1)}
        >
          Tentar novamente
        </button>
      ) : (
        <>
          <button className="movement-card teal-panel" onClick={openGoals}>
            <div>
              <span>Meta de Movimentação</span>
              <strong>{formatNumber(health.daily.steps)}</strong>
              <small>
                {health.goals?.steps
                  ? `de ${formatNumber(health.goals.steps)} passos`
                  : 'Toque para definir suas metas'}
              </small>
              <p>
                🔥 {formatNumber(health.daily.calories)} kcal&nbsp; ⏱{' '}
                {health.daily.durationMinutes} min
              </p>
            </div>
            <div
              className="goal-ring"
              style={{
                background: `conic-gradient(white ${Math.min(100, percent)}%,#ffffff44 0)`,
              }}
            >
              <span>{percent}%</span>
            </div>
          </button>
          <MetricCards values={health.daily} goals={health.goals} />
          <div className="period-tabs">
            <button
              className={!monthly ? 'active' : ''}
              onClick={() => setMonthly(false)}
            >
              Semanal
            </button>
            <button
              className={monthly ? 'active' : ''}
              onClick={() => setMonthly(true)}
            >
              Mensal
            </button>
          </div>
          <section className="activity-chart white-card">
            <h2>Atividade {monthly ? 'Mensal' : 'Semanal'}</h2>
            <p>Minutos de exercício registrados</p>
            <div
              className={`chart-bars ${monthly ? 'monthly' : ''}`}
              role="img"
              aria-label={`Gráfico de minutos de exercício nos últimos ${chart.length} dias`}
            >
              {chart.map((day, index) => (
                <div key={day.date}>
                  <span className="chart-value">{day.value || ''}</span>
                  <div className="chart-bar-space">
                    <i style={{ height: `${(day.value / max) * 100}%` }} />
                  </div>
                  <small>
                    {monthly
                      ? index % 7 === 0
                        ? new Date(`${day.date}T12:00:00Z`).getUTCDate()
                        : ''
                      : new Date(`${day.date}T12:00:00Z`)
                          .toLocaleDateString('pt-BR', {
                            weekday: 'short',
                            timeZone: 'UTC',
                          })
                          .slice(0, 3)}
                  </small>
                </div>
              ))}
            </div>
          </section>
          <SectionTitle action="Ver mais ›" onAction={onHistory}>
            Histórico de Progresso
          </SectionTitle>
          {health.days.length ? (
            <div className="stack">
              {health.days
                .slice(-5)
                .reverse()
                .map((day) => (
                  <button
                    className="progress-history white-card"
                    key={day.date}
                    onClick={onHistory}
                  >
                    <div>
                      <h3>
                        {new Date(`${day.date}T12:00:00Z`).toLocaleDateString(
                          'pt-BR',
                          { weekday: 'long', timeZone: 'UTC' },
                        )}
                      </h3>
                      <p>
                        <Icon name="steps" size={12} />
                        {formatNumber(day.steps)}&nbsp; 🔥{' '}
                        {formatNumber(day.calories)} kcal&nbsp; ⏱{' '}
                        {day.durationMinutes} min
                      </p>
                    </div>
                    <small>
                      {day.date.slice(5).split('-').reverse().join('/')}
                    </small>
                  </button>
                ))}
            </div>
          ) : (
            <EmptyState icon="chart">
              Registre sua primeira atividade para começar a acompanhar seu
              progresso.
            </EmptyState>
          )}
        </>
      )}
    </>
  );
}
