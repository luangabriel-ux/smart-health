import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Api } from '../services/api.ts';
import type { Reminder, ReminderInput } from '../services/types.ts';
import { Feedback, errorMessage } from '../components/Feedback.tsx';

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export function RemindersPage({ api }: { api: Api }) {
  const [items, setItems] = useState<Reminder[]>([]);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api.listReminders().then(({ data }) => { if (active) setItems(data); })
      .catch(error => { if (active) setError(errorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, revision]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const input: ReminderInput = { title: String(values.get('title')).trim(), time: String(values.get('time')),
      weekdays: values.getAll('weekdays').map(Number), timezone: String(values.get('timezone')).trim(), active: values.has('active') };
    setError(''); setMessage('');
    if (!input.weekdays.length) { setError('Selecione pelo menos um dia da semana.'); return; }
    setBusy(true);
    try {
      if (editing) await api.updateReminder(editing.id, input);
      else await api.createReminder(input);
      setEditing(null); setRevision(value => value + 1); setMessage('Lembrete salvo.');
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  async function change(item: Reminder, remove = false) {
    setBusy(true); setError(''); setMessage('');
    try {
      if (remove) await api.removeReminder(item.id);
      else await api.updateReminder(item.id, { active: !item.active });
      if (editing?.id === item.id) setEditing(null);
      setConfirmId(null); setRevision(value => value + 1); setMessage(remove ? 'Lembrete excluído.' : 'Lembrete atualizado.');
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <div className="stack"><section className="card"><h2>{editing ? 'Editar lembrete' : 'Novo lembrete'}</h2>
    <p>Organize seus horários. Os agendamentos ficam salvos; o envio de notificações ainda não está disponível.</p>
    <Feedback error={error} message={message} />
    <form key={`${editing?.id ?? 'new'}-${revision}`} onSubmit={save} aria-busy={busy}><fieldset disabled={busy || loading}>
      <label>Título<input name="title" required maxLength={120} defaultValue={editing?.title ?? ''} /></label>
      <div className="form-grid"><label>Horário<input type="time" name="time" required defaultValue={editing?.time ?? '09:00'} /></label>
        <label>Fuso horário<input name="timezone" required defaultValue={editing?.timezone ?? 'America/Sao_Paulo'} /></label></div>
      <fieldset><legend>Dias da semana</legend><div className="weekday-options">{weekdays.map((day, index) => <label key={day} className="checkbox-label">
        <input name="weekdays" type="checkbox" value={index} defaultChecked={editing ? editing.weekdays.includes(index) : index > 0 && index < 6} />{day}</label>)}</div></fieldset>
      <label className="checkbox-label"><input name="active" type="checkbox" defaultChecked={editing?.active ?? true} />Lembrete ativo</label>
      <div className="actions"><button type="submit">{busy ? 'Salvando…' : 'Salvar lembrete'}</button>
        {editing && <button className="secondary" type="button" onClick={() => setEditing(null)}>Cancelar edição</button>}</div>
    </fieldset></form></section>
    <section className="card" aria-busy={loading}><div className="section-heading"><h2>Meus lembretes</h2>
      <button className="secondary" disabled={busy || loading} onClick={() => setRevision(value => value + 1)}>Atualizar</button></div>
      {loading ? <p role="status">Carregando lembretes…</p> : <ul className="activity-list">{items.map(item => <li key={item.id}>
        <div><span className="badge">{item.active ? 'Ativo' : 'Pausado'}</span><h3>{item.title}</h3>
          <p>{item.time} · {item.weekdays.map(day => weekdays[day]).join(', ')}<br /><small>{item.timezone}</small></p></div>
        <div className="actions">{confirmId === item.id ? <>
          <button className="danger" disabled={busy} onClick={() => change(item, true)}>Confirmar exclusão</button>
          <button className="secondary" disabled={busy} onClick={() => setConfirmId(null)}>Cancelar</button></> : <>
          <button className="secondary" disabled={busy} onClick={() => { setEditing(item); setError(''); setMessage(''); }}>Editar</button>
          <button className="secondary" disabled={busy} onClick={() => change(item)}>{item.active ? 'Pausar' : 'Ativar'}</button>
          <button className="secondary" disabled={busy} onClick={() => setConfirmId(item.id)}>Excluir</button></>}</div>
      </li>)}</ul>}
      {!loading && !error && !items.length && <p className="empty">Você ainda não tem lembretes.</p>}
    </section></div>;
}
