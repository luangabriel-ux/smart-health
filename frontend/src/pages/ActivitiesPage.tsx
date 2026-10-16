import { useEffect, useState } from 'react';
import type { Api } from '../services/api.ts';
import type { Activity } from '../services/types.ts';
import { ActivityForm, activityLabels } from '../components/ActivityForm.tsx';
import { Feedback, errorMessage } from '../components/Feedback.tsx';

const pageSize = 20;
export function ActivitiesPage({ api }: { api: Api }) {
  const [items, setItems] = useState<Activity[]>([]);
  const [offset, setOffset] = useState(0);
  const [version, setVersion] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setConfirmId(null);
    api.listActivities(pageSize + 1, offset)
      .then(({ data }) => { if (active) { setItems(data.slice(0, pageSize)); setHasNext(data.length > pageSize); } })
      .catch(error => { if (active) setError(errorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, offset, version]);
  async function remove(id: string) {
    setBusy(true); setError(''); setMessage('');
    try {
      await api.removeActivity(id); setConfirmId(null); setMessage('Atividade excluída.');
      if (items.length === 1 && offset > 0) setOffset(offset - pageSize);
      else setVersion(value => value + 1);
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <div className="stack"><ActivityForm api={api} onCreated={() => { setOffset(0); setVersion(value => value + 1); setMessage(''); }} />
    <section className="card" aria-labelledby="history-title" aria-busy={loading}>
      <div className="section-heading"><div><h2 id="history-title">Minhas atividades</h2><p>Seu histórico de registros.</p></div>
        <button className="secondary" disabled={loading || busy} onClick={() => setVersion(value => value + 1)}>Atualizar</button></div>
      <Feedback error={error} message={message} />
      {loading ? <p role="status">Carregando atividades…</p> : error ? <p>Use Atualizar para tentar carregar o histórico novamente.</p>
        : items.length === 0 ? <p className="empty">Nenhuma atividade nesta página. Registre sua primeira atividade acima.</p>
        : <ul className="activity-list">{items.map(item => <li key={item.id}>
          <div><span className="badge">{activityLabels[item.type]}</span><h3>{item.description}</h3>
            <time dateTime={item.occurredAt}>{new Date(item.occurredAt).toLocaleString('pt-BR')}</time>
            <p className="metrics">{[
              item.waterMl !== null ? `${item.waterMl} ml` : null,
              item.durationMinutes !== null ? `${item.durationMinutes} min` : null,
              item.steps !== null ? `${item.steps} passos` : null,
              item.calories !== null ? `${item.calories} kcal de gasto` : null
            ].filter(value => value !== null).join(' · ')}</p>
          </div>
          {confirmId === item.id ? <div className="delete-confirm"><p>Excluir este registro?</p><div className="actions">
            <button className="danger" disabled={busy} onClick={() => remove(item.id)}>{busy ? 'Excluindo…' : 'Confirmar exclusão'}</button>
            <button className="secondary" disabled={busy} onClick={() => setConfirmId(null)}>Cancelar</button></div></div>
            : <button className="secondary" disabled={busy} onClick={() => { setConfirmId(item.id); setMessage(''); }}>Excluir</button>}
        </li>)}</ul>}
      <nav className="pagination" aria-label="Paginação das atividades">
        <button className="secondary" disabled={loading || busy || offset === 0} onClick={() => setOffset(offset - pageSize)}>Anterior</button>
        <span>Página {Math.floor(offset / pageSize) + 1}</span>
        <button className="secondary" disabled={loading || busy || Boolean(error) || !hasNext} onClick={() => setOffset(offset + pageSize)}>Próxima</button>
      </nav>
    </section></div>;
}
