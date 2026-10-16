import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Api } from '../services/api.ts';
import type {
  Reminder,
  ReminderCategory,
  ReminderInput,
} from '../services/types.ts';
import { Feedback, errorMessage } from '../components/Feedback.tsx';
import { Icon } from '../components/Icon.tsx';
import { EmptyState, PageHeader, SectionTitle } from '../components/Mobile.tsx';
import { dateKey, shiftDate } from '../services/health.ts';

const weekdays = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];
const categories: {
  value: ReminderCategory;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { value: 'exercise', label: 'Exercício', emoji: '🏃', color: 'blue' },
  { value: 'medication', label: 'Medicamento', emoji: '💊', color: 'red' },
  { value: 'water', label: 'Ingestão de Água', emoji: '💧', color: 'teal' },
  { value: 'meal', label: 'Refeição', emoji: '🥗', color: 'green' },
  { value: 'habit', label: 'Hábito', emoji: '📌', color: 'purple' },
];
export function RemindersPage({ api }: { api: Api }) {
  const [items, setItems] = useState<Reminder[]>([]);
  const [editor, setEditor] = useState<Reminder | null | false>(false);
  const [category, setCategory] = useState<ReminderCategory>('exercise');
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dateKey);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api
      .listReminders()
      .then(({ data }) => {
        if (active) setItems(data);
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
  }, [api, revision]);
  function open(item: Reminder | null) {
    setEditor(item);
    setCategory(item?.category ?? 'exercise');
    setError('');
    setMessage('');
    setConfirm(false);
    window.scrollTo(0, 0);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const input: ReminderInput = {
      title: String(values.get('title')).trim(),
      time: String(values.get('time')),
      weekdays: values.getAll('weekdays').map(Number),
      timezone: String(values.get('timezone')).trim(),
      active: values.has('active'),
      category,
    };
    setError('');
    setMessage('');
    if (!input.weekdays.length) {
      setError('Selecione pelo menos um dia da semana.');
      return;
    }
    setBusy(true);
    try {
      if (editor) await api.updateReminder(editor.id, input);
      else await api.createReminder(input);
      setEditor(false);
      setRevision((value) => value + 1);
      setMessage('Lembrete salvo.');
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function toggle(item: Reminder) {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.updateReminder(item.id, {
        active: !item.active,
      });
      setItems((values) =>
        values.map((value) => (value.id === data.id ? data : value)),
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!editor) return;
    setBusy(true);
    setError('');
    try {
      await api.removeReminder(editor.id);
      setEditor(false);
      setRevision((value) => value + 1);
      setMessage('Lembrete excluído.');
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  if (editor !== false)
    return (
      <div className="reminder-editor">
        <PageHeader
          title={editor ? 'Editar Lembrete' : 'Novo Lembrete'}
          onBack={() => setEditor(false)}
        />
        <div className="editor-content">
          <Feedback error={error} />
          <form onSubmit={save}>
            <fieldset disabled={busy}>
              <label>
                Nome da Atividade ou Medicamento
                <input
                  name="title"
                  required
                  maxLength={120}
                  defaultValue={editor?.title ?? ''}
                  placeholder="Ex.: Corrida matinal, Beber água"
                />
              </label>
              <section>
                <h2 className="field-heading">Categoria</h2>
                <div className="reminder-categories">
                  {categories
                    .filter(
                      (item) => item.value !== 'habit' || category === 'habit',
                    )
                    .map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        className={category === item.value ? 'selected' : ''}
                        aria-pressed={category === item.value}
                        onClick={() => setCategory(item.value)}
                      >
                        <span>{item.emoji}</span>
                        {item.label}
                      </button>
                    ))}
                </div>
              </section>
              <label>
                Horário de Notificação
                <div className="time-input">
                  <input
                    name="time"
                    type="time"
                    required
                    defaultValue={editor?.time ?? '07:30'}
                  />
                  <Icon name="clock" size={19} />
                </div>
              </label>
              <fieldset>
                <legend>Repetir nos Dias</legend>
                <div className="weekday-options">
                  {weekdays.map((day, index) => (
                    <label key={day} className="weekday-choice">
                      <input
                        type="checkbox"
                        name="weekdays"
                        value={index}
                        aria-label={day}
                        defaultChecked={
                          editor
                            ? editor.weekdays.includes(index)
                            : [1, 3, 5].includes(index)
                        }
                      />
                      <span>{day[0]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="reminder-active white-card">
                <div>
                  <strong>Lembrete ativo</strong>
                  <small>Manter este agendamento na sua rotina</small>
                </div>
                <input
                  name="active"
                  type="checkbox"
                  role="switch"
                  className="switch"
                  defaultChecked={editor?.active ?? true}
                />
              </label>
              <details className="record-date">
                <summary>Fuso horário</summary>
                <label>
                  Fuso IANA
                  <input
                    name="timezone"
                    required
                    defaultValue={editor?.timezone ?? 'America/Sao_Paulo'}
                  />
                </label>
              </details>
              <small>
                O agendamento será salvo. O envio de notificações ainda não está
                disponível.
              </small>
              <button className="primary full" type="submit">
                {busy ? 'Salvando…' : 'Salvar Lembrete'}
              </button>
              {editor &&
                (confirm ? (
                  <div className="delete-confirm">
                    <p>Excluir este lembrete?</p>
                    <div className="actions">
                      <button className="danger" type="button" onClick={remove}>
                        Confirmar exclusão
                      </button>
                      <button
                        className="secondary"
                        type="button"
                        onClick={() => setConfirm(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="danger"
                    type="button"
                    onClick={() => setConfirm(true)}
                  >
                    Excluir lembrete
                  </button>
                ))}
            </fieldset>
          </form>
        </div>
      </div>
    );
  const date = new Date(`${selectedDate}T12:00:00Z`),
    weekday = date.getUTCDay(),
    start = shiftDate(selectedDate, -((weekday + 6) % 7));
  const visible = items.filter((item) => item.weekdays.includes(weekday));
  return (
    <>
      <h1>Programas</h1>
      <p className="subtitle">Gerencie seus lembretes e rotinas</p>
      <section className="calendar-panel teal-panel">
        <div>
          <div>
            <small>
              {date.toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })}
            </small>
            <h2>
              {date.toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: 'numeric',
                timeZone: 'UTC',
              })}
            </h2>
          </div>
          <label className="calendar-picker" aria-label="Selecionar data">
            <Icon name="calendar" size={20} />
            <input
              aria-label="Selecionar data"
              type="date"
              value={selectedDate}
              onChange={(event) => {
                if (event.target.value) setSelectedDate(event.target.value);
              }}
            />
          </label>
        </div>
        <div className="calendar-week">
          {Array.from({ length: 7 }, (_, index) => {
            const key = shiftDate(start, index),
              value = new Date(`${key}T12:00:00Z`);
            return (
              <button
                key={key}
                className={key === selectedDate ? 'selected' : ''}
                onClick={() => setSelectedDate(key)}
              >
                <small>
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][index]}
                </small>
                <strong>{value.getUTCDate()}</strong>
              </button>
            );
          })}
        </div>
      </section>
      <button
        className="outline teal-outline full add-reminder"
        onClick={() => open(null)}
      >
        <Icon name="plus" size={17} />
        Adicionar Lembrete
      </button>
      <SectionTitle
        action="Atualizar"
        onAction={() => setRevision((value) => value + 1)}
      >
        Seus Lembretes
      </SectionTitle>
      <Feedback error={error} message={message} />
      {loading ? (
        <p role="status" className="loading-text">
          Carregando lembretes…
        </p>
      ) : visible.length ? (
        <div className="reminder-list">
          {visible.map((item) => {
            const kind = categories.find(
              (category) => category.value === (item.category ?? 'habit'),
            )!;
            return (
              <article className="reminder-item white-card" key={item.id}>
                <button className="reminder-main" onClick={() => open(item)}>
                  <span className={`reminder-icon ${kind.color}`}>
                    {kind.emoji}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      <Icon name="clock" size={11} />
                      {item.time} ·{' '}
                      {item.weekdays
                        .map((day) => weekdays[day].slice(0, 3))
                        .join(', ')}
                    </p>
                  </div>
                </button>
                <button
                  className={`reminder-dot ${item.active ? 'active' : ''}`}
                  disabled={busy}
                  aria-label={`${item.active ? 'Pausar' : 'Ativar'} ${item.title}`}
                  onClick={() => toggle(item)}
                >
                  <span />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        !error && (
          <EmptyState icon="bell">
            Nenhum lembrete para este dia. Adicione um agendamento à sua rotina.
          </EmptyState>
        )
      )}
    </>
  );
}
