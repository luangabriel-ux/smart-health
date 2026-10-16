import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Api } from '../services/api.ts';
import type { ActivityInput, ActivityType } from '../services/types.ts';
import { Feedback, errorMessage } from './Feedback.tsx';

export const activityLabels = { exercise: 'Exercício', water: 'Água', meal: 'Alimentação', habit: 'Hábito' };
function localDateTime() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export function ActivityForm({ api, onCreated }: { api: Api; onCreated: () => void }) {
  const [type, setType] = useState<ActivityType>('exercise');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget, values = new FormData(form);
    setBusy(true); setError(''); setMessage('');
    try {
      const input: ActivityInput = { type, description: String(values.get('description')).trim(), occurredAt: new Date(String(values.get('occurredAt'))).toISOString() };
      for (const key of ['waterMl', 'durationMinutes', 'steps', 'calories'] as const) {
        if (values.has(key) && values.get(key) !== '') input[key] = Number(values.get(key));
      }
      await api.createActivity(input);
      form.reset(); setType('exercise'); setMessage('Atividade registrada.'); onCreated();
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <section className="card" aria-labelledby="activity-title"><h2 id="activity-title">Registrar atividade</h2>
    <p>Adicione um registro da sua rotina.</p><Feedback error={error} message={message} />
    <form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
      <div className="form-grid">
        <label>Tipo<select name="type" value={type} onChange={event => { setType(event.target.value as ActivityType); setError(''); }}>
          {Object.entries(activityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <label>Data e hora<input type="datetime-local" name="occurredAt" defaultValue={localDateTime()} required /></label>
      </div>
      <small>Horário local do seu dispositivo. Registre atividades já realizadas.</small>
      <label>Descrição<input name="description" maxLength={500} required placeholder="Ex.: caminhada no parque" /></label>
      {type === 'water' && <label>Água (ml)<input name="waterMl" type="number" required min={1} max={20000} step={1} /></label>}
      {type === 'exercise' && <div className="form-grid">
        <label>Duração (min)<input name="durationMinutes" type="number" min={1} max={1440} step={1} /></label>
        <label>Passos<input name="steps" type="number" min={0} max={200000} step={1} /></label>
        <label>Gasto (kcal)<input name="calories" type="number" min={0} max={30000} step={1} /></label>
      </div>}
      <button type="submit">{busy ? 'Registrando…' : 'Registrar atividade'}</button>
    </fieldset></form>
  </section>;
}
