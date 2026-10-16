import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Api } from '../services/api.ts';
import type {
  Activity,
  ActivityInput,
  ActivityType,
} from '../services/types.ts';
import { Feedback, errorMessage } from './Feedback.tsx';
import { Icon } from './Icon.tsx';
import { PageHeader, SectionTitle } from './Mobile.tsx';
import { useHealthData } from '../app/useHealthData.ts';
import { dateKey, formatNumber } from '../services/health.ts';

export const activityLabels = {
  exercise: 'Exercício',
  water: 'Água',
  meal: 'Alimentação',
  habit: 'Hábito',
};
function localDateTime() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
export function ActivityForm({
  api,
  onCreated,
  onBack = () => {},
  initialType = 'exercise',
  initialMinutes,
}: {
  api: Api;
  onCreated: () => void;
  onBack?: () => void;
  initialType?: ActivityType;
  initialMinutes?: number;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [water, setWater] = useState(250);
  const [sport, setSport] = useState('Corrida');
  const [intensity, setIntensity] = useState('Moderada');
  const [calories, setCalories] = useState('');
  const [history, setHistory] = useState<Activity[]>([]);
  const [historyError, setHistoryError] = useState('');
  const health = useHealthData(api);
  const isWater = initialType === 'water',
    isExercise = initialType === 'exercise';
  useEffect(() => {
    if (!isWater) return;
    let active = true;
    api
      .listActivities(100)
      .then(({ data }) => {
        if (active)
          setHistory(
            data.filter(
              (item) =>
                item.type === 'water' &&
                dateKey(new Date(item.occurredAt)) === dateKey(),
            ),
          );
      })
      .catch((error) => {
        if (active) setHistoryError(errorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [api, isWater]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const input: ActivityInput = {
        type: initialType,
        description:
          String(values.get('description') ?? '').trim() ||
          (isWater
            ? 'Registro de água'
            : `${sport} · intensidade ${intensity.toLowerCase()}`),
        occurredAt: new Date(String(values.get('occurredAt'))).toISOString(),
      };
      if (isWater) input.waterMl = water;
      if (isExercise)
        for (const key of ['durationMinutes', 'steps', 'calories'] as const) {
          if (values.get(key) !== '') input[key] = Number(values.get(key));
        }
      await api.createActivity(input);
      onCreated();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  const goal = health.goals?.waterMl,
    percentage = goal ? Math.round((health.daily.waterMl / goal) * 100) : 0;
  return (
    <>
      <PageHeader
        title={
          isWater
            ? 'Registro de Água'
            : isExercise
              ? 'Registrar Exercício'
              : 'Registrar ' + activityLabels[initialType]
        }
        onBack={onBack}
      />
      <main className="screen no-nav registration-screen">
        <Feedback error={error} />
        <form onSubmit={submit} aria-busy={busy}>
          <fieldset disabled={busy}>
            {isWater ? (
              <>
                <div className="water-panel teal-panel">
                  <span className="water-drop">💧</span>
                  {health.loading ? (
                    <p role="status">Carregando…</p>
                  ) : health.error ? (
                    <Feedback error={health.error} />
                  ) : (
                    <>
                      <strong>{formatNumber(health.daily.waterMl)} ml</strong>
                      <p>
                        {goal
                          ? `de ${formatNumber(goal)} ml de meta diária`
                          : 'registrados hoje'}{' '}
                      </p>
                      <div className="meter">
                        <span
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                      <small>
                        {goal
                          ? `${percentage}% da sua meta concluída hoje!`
                          : 'Sua meta pode ser definida em Progresso.'}
                      </small>
                    </>
                  )}
                </div>
                <SectionTitle>Adicionar rapidamente</SectionTitle>
                <div className="water-quick">
                  {[150, 250, 500].map((amount, index) => (
                    <button
                      type="button"
                      key={amount}
                      onClick={() =>
                        setWater((value) => Math.min(20000, value + amount))
                      }
                    >
                      <span>{['🥛', '🥤', '🍶'][index]}</span>
                      <strong>+{amount} ml</strong>
                    </button>
                  ))}
                </div>
                <label>
                  Quantidade a registrar (ml)
                  <input
                    name="waterMl"
                    type="number"
                    min={1}
                    max={20000}
                    required
                    value={water}
                    onChange={(event) => setWater(Number(event.target.value))}
                  />
                </label>
                <section className="white-card water-history">
                  <h2>Histórico de hoje</h2>
                  <Feedback error={historyError} />
                  {history.length
                    ? history.slice(0, 6).map((item) => (
                        <div key={item.id}>
                          <span>
                            <Icon name="clock" size={12} />
                            {new Date(item.occurredAt).toLocaleTimeString(
                              'pt-BR',
                              { hour: '2-digit', minute: '2-digit' },
                            )}
                          </span>
                          <strong>+{formatNumber(item.waterMl ?? 0)} ml</strong>
                        </div>
                      ))
                    : !historyError && (
                        <p>Seu próximo registro aparecerá aqui.</p>
                      )}
                </section>
              </>
            ) : isExercise ? (
              <>
                <section>
                  <h2 className="field-heading">Modalidade Esportiva</h2>
                  <div className="sport-options">
                    {[
                      'Corrida',
                      'Caminhada',
                      'Musculação',
                      'Ciclismo',
                      'Natação',
                      'Outro',
                    ].map((item, index) => (
                      <button
                        type="button"
                        key={item}
                        className={sport === item ? 'selected' : ''}
                        onClick={() => setSport(item)}
                      >
                        <span>
                          {['🏃', '🚶', '🏋️', '🚴', '🏊', '⚡'][index]}
                        </span>
                        {item}
                      </button>
                    ))}
                  </div>
                </section>
                <label>
                  Duração do Exercício (min)
                  <input
                    name="durationMinutes"
                    type="number"
                    required
                    min={1}
                    max={1440}
                    step={1}
                    defaultValue={initialMinutes ?? ''}
                    placeholder="Ex.: 30"
                  />
                </label>
                <section>
                  <h2 className="field-heading">Nível de Intensidade</h2>
                  <div className="intensity-options">
                    {['Leve', 'Moderada', 'Intensa'].map((item) => (
                      <button
                        type="button"
                        key={item}
                        className={intensity === item ? 'selected' : ''}
                        onClick={() => setIntensity(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </section>
                <div className="form-grid">
                  <label>
                    Passos (opcional)
                    <input
                      name="steps"
                      type="number"
                      min={0}
                      max={200000}
                      step={1}
                    />
                  </label>
                  <label>
                    Gasto (kcal, opcional)
                    <input
                      name="calories"
                      type="number"
                      min={0}
                      max={30000}
                      step={1}
                      value={calories}
                      onChange={(event) => setCalories(event.target.value)}
                    />
                  </label>
                </div>
                <div className="calorie-notice">
                  <Icon name="fire" size={23} />
                  <div>
                    <strong>GASTO INFORMADO</strong>
                    <p>
                      {calories
                        ? `${formatNumber(Number(calories))} kcal`
                        : 'Informe o gasto, se você tiver essa medição.'}
                    </p>
                  </div>
                </div>
              </>
            ) : null}
            <label>
              Descrição
              <input
                name="description"
                required={!isWater && !isExercise}
                maxLength={500}
                placeholder={
                  isWater
                    ? 'Ex.: água depois do almoço'
                    : isExercise
                      ? 'Ex.: caminhada no parque'
                      : 'Descreva seu registro'
                }
              />
            </label>
            <details className="record-date">
              <summary>Data e horário do registro</summary>
              <label>
                Horário local
                <input
                  name="occurredAt"
                  type="datetime-local"
                  defaultValue={localDateTime()}
                  required
                />
              </label>
            </details>
            <button className="primary full" type="submit">
              {busy
                ? 'Salvando…'
                : isWater
                  ? 'Confirmar Registro'
                  : 'Salvar Atividade'}
            </button>
          </fieldset>
        </form>
      </main>
    </>
  );
}
