import { useEffect, useState } from 'react';
import type { Api } from '../services/api.ts';
import type { Recommendations } from '../services/types.ts';
import { Feedback, errorMessage } from '../components/Feedback.tsx';
import { Icon } from '../components/Icon.tsx';
import { EmptyState, SectionTitle } from '../components/Mobile.tsx';
const fieldLabels: Record<string, string> = {
  age: 'idade',
  weightKg: 'peso',
  heightCm: 'altura',
  healthGoals: 'objetivos de saúde',
};
export function RecommendationsPage({
  api,
  onProfile,
}: {
  api: Api;
  onProfile: () => void;
}) {
  const [data, setData] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api
      .recommendations()
      .then(({ data }) => {
        if (active) setData(data);
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
  return (
    <>
      <div className="recommendation-intro">
        <h1>Bem-estar</h1>
        <p>Sugestões para acompanhar os seus objetivos.</p>
      </div>
      <SectionTitle
        action="Atualizar"
        onAction={() => setRevision((value) => value + 1)}
      >
        Para Você
      </SectionTitle>
      <Feedback error={error} />
      {loading ? (
        <p role="status" className="loading-text">
          Carregando recomendações…
        </p>
      ) : (
        !error &&
        data && (
          <>
            {data.status === 'profile_incomplete' ? (
              <>
                <EmptyState icon="heart">
                  {data.message} Preencha{' '}
                  {data.missingFields
                    ?.map((field) => fieldLabels[field] ?? field)
                    .join(', ')}
                  .
                </EmptyState>
                <button
                  className="primary full"
                  style={{ marginTop: 18 }}
                  onClick={onProfile}
                >
                  Completar Meu Perfil
                </button>
              </>
            ) : (
              <div className="recommendation-list">
                {data.recommendations.map((item) => (
                  <article className="recommendation-card" key={item.code}>
                    <span
                      className={`soft-icon ${item.code.includes('HYDRATION') ? 'teal' : item.code.includes('ACTIVITY') ? 'orange' : 'pink'}`}
                    >
                      <Icon
                        name={
                          item.code.includes('HYDRATION')
                            ? 'water'
                            : item.code.includes('ACTIVITY')
                              ? 'dumbbell'
                              : 'heart'
                        }
                        size={23}
                      />
                    </span>
                    <h2>{item.title}</h2>
                    <p>{item.message}</p>
                    <small>
                      Com base em{' '}
                      {item.basedOn
                        .map((field) => fieldLabels[field] ?? field)
                        .join(', ')}
                      .
                    </small>
                  </article>
                ))}
              </div>
            )}
            {data.medicalNotice && (
              <p className="feedback success">{data.medicalNotice}</p>
            )}
          </>
        )
      )}
    </>
  );
}
