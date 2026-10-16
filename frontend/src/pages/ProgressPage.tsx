import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Api } from '../services/api.ts';
import type { Goals, GoalsInput, ProgressDay } from '../services/types.ts';
import { Feedback, errorMessage } from '../components/Feedback.tsx';

const metrics = [['waterMl', 'Água (ml)'], ['steps', 'Passos'], ['durationMinutes', 'Exercício (min)'], ['calories', 'Gasto (kcal)']] as const;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export function ProgressPage({ api }: { api: Api }) {
  const [range, setRange] = useState(() => { const to = today(); return { from: `${to.slice(0, 7)}-01`, to }; });
  const [days, setDays] = useState<ProgressDay[]>([]);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    Promise.all([api.progress(range.from, range.to), api.getGoals()])
      .then(([progress, goals]) => { if (active) { setDays(progress.data); setGoals(goals.data); } })
      .catch(error => { if (active) setError(errorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, range, revision]);
  async function saveGoals(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget), input: GoalsInput = {};
    for (const [key] of metrics) if (values.get(key) !== '') input[key] = Number(values.get(key));
    setError(''); setMessage('');
    if (!Object.keys(input).length) { setError('Informe pelo menos uma meta.'); return; }
    setBusy(true);
    try { setGoals((await api.saveGoals(input)).data); setMessage('Metas salvas.'); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  const totals = Object.fromEntries(metrics.map(([key]) => [key, days.reduce((sum, day) => sum + day[key], 0)]));
  return <div className="stack"><section className="card"><h2>Meu progresso</h2><p>Registros agrupados por dia no fuso America/Sao_Paulo.</p>
    <form onSubmit={event => { event.preventDefault(); const values = new FormData(event.currentTarget); setRange({ from: String(values.get('from')), to: String(values.get('to')) }); }}>
      <fieldset disabled={loading || busy}><div className="form-grid"><label>De<input type="date" name="from" defaultValue={range.from} required /></label>
        <label>Até<input type="date" name="to" defaultValue={range.to} required /></label></div><small>Selecione um intervalo de até 366 dias.</small><button type="submit">Consultar período</button></fieldset></form>
    <Feedback error={error} message={message} />
    {error && <button className="secondary" disabled={loading || busy} onClick={() => setRevision(value => value + 1)}>Tentar novamente</button>}
    {loading ? <p role="status">Carregando progresso…</p> : !error && <>
      <div className="summary-grid">{metrics.map(([key, label]) => <div className="summary-item" key={key}><span>{label}</span><strong>{totals[key].toLocaleString('pt-BR')}</strong><small>Total no período</small></div>)}</div>
      {days.length ? <div className="table-scroll"><table><caption>Atividades registradas por dia</caption><thead><tr><th scope="col">Data</th>{metrics.map(([key, label]) => <th scope="col" key={key}>{label}</th>)}</tr></thead>
        <tbody>{days.map(day => <tr key={day.date}><th scope="row">{day.date.split('-').reverse().join('/')}</th>{metrics.map(([key]) => <td key={key}>{day[key].toLocaleString('pt-BR')}</td>)}</tr>)}</tbody></table></div>
        : <p className="empty">Nenhuma atividade registrada neste período.</p>}
    </>}
  </section><section className="card"><h2>Minhas metas diárias</h2><p>Defina suas próprias metas. Campos deixados vazios serão removidos ao salvar.</p>
    <form key={goals?.updatedAt ?? 'empty'} onSubmit={saveGoals}><fieldset disabled={busy || loading}>
      <div className="form-grid">{metrics.map(([key, label]) => <label key={key}>{label}<input name={key} type="number" min={1} max={2147483647} step={1} defaultValue={goals?.[key] ?? ''} /></label>)}</div>
      <button type="submit">{busy ? 'Salvando…' : 'Salvar metas'}</button>
    </fieldset></form></section></div>;
}
