import { useEffect, useState } from 'react';
import type { Api } from '../services/api.ts';
import type { Recommendations } from '../services/types.ts';
import { Feedback, errorMessage } from '../components/Feedback.tsx';

const fieldLabels: Record<string, string> = { age: 'idade', weightKg: 'peso', heightCm: 'altura', healthGoals: 'objetivos de saúde' };
export function RecommendationsPage({ api, onProfile }: { api: Api; onProfile: () => void }) {
  const [data, setData] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api.recommendations().then(({ data }) => { if (active) setData(data); })
      .catch(error => { if (active) setError(errorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, revision]);
  return <section className="card"><div className="section-heading"><div><h2>Recomendações</h2><p>Sugestões para acompanhar os objetivos registrados no seu perfil.</p></div>
    <button className="secondary" disabled={loading} onClick={() => setRevision(value => value + 1)}>Atualizar</button></div>
    <Feedback error={error} />
    {loading ? <p role="status">Carregando recomendações…</p> : !error && data && <>
      {data.status === 'profile_incomplete' ? <div className="empty"><p>{data.message}</p>
        <p>Preencha: {data.missingFields?.map(field => fieldLabels[field] ?? field).join(', ')}.</p><button onClick={onProfile}>Completar meu perfil</button></div>
        : <div className="content-grid">{data.recommendations.map(item => <article className="content-card" key={item.code}><h3>{item.title}</h3><p>{item.message}</p>
          <small>Com base em: {item.basedOn.map(field => fieldLabels[field] ?? field).join(', ')}.</small></article>)}</div>}
      {data.medicalNotice && <p className="feedback success">{data.medicalNotice}</p>}
    </>}
  </section>;
}
