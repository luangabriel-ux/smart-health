import { useState } from 'react';
import { Icon } from '../components/Icon.tsx';
import { PageHeader } from '../components/Mobile.tsx';
const specialists = [
  {
    name: 'Dra. Camila Silva',
    specialty: 'Nutricionista Esportiva & Clínica',
    category: 'Nutricionistas',
    emoji: '👩‍⚕️',
    stars: '4.9',
    reviews: 128,
    price: '150,00',
    tags: ['Hipertrofia', 'Emagrecimento', 'Dieta Flexível'],
    about:
      'Perfil ilustrativo do protótipo com foco em nutrição esportiva e acompanhamento de hábitos. As informações não representam um profissional disponível para contratação nesta versão.',
  },
  {
    name: 'Rodrigo Santos',
    specialty: 'Personal Trainer & Fisiologista',
    category: 'Personal Trainers',
    emoji: '🏋️',
    stars: '5.0',
    reviews: 54,
    price: '180,00',
    tags: ['Funcional', 'Condicionamento', 'Treino em Casa'],
    about:
      'Perfil ilustrativo do protótipo para apresentar a experiência de acompanhamento de atividades físicas. Agendamentos ainda não estão disponíveis.',
  },
  {
    name: 'Dra. Mariana Costa',
    specialty: 'Psicóloga da Saúde & Bem-estar',
    category: 'Bem-estar',
    emoji: '🧠',
    stars: '4.8',
    reviews: 87,
    price: '140,00',
    tags: ['Ansiedade', 'Hábitos Saudáveis', 'Mindfulness'],
    about:
      'Perfil ilustrativo do protótipo para apresentar a área de bem-estar. Não oferece atendimento ou orientação clínica nesta versão.',
  },
];
export function ProfessionalsPage({
  onBack,
  onInfo,
}: {
  onBack: () => void;
  onInfo: (message: string) => void;
}) {
  const [selected, setSelected] = useState<(typeof specialists)[number] | null>(
    null,
  );
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('Online');
  const [time, setTime] = useState('10:30');
  if (selected)
    return (
      <>
        <PageHeader
          title="Perfil do Especialista"
          onBack={() => setSelected(null)}
          action={
            <button
              className="icon-button"
              aria-label="Favoritar especialista"
              onClick={() =>
                onInfo(
                  'O salvamento de profissionais favoritos ainda não está disponível.',
                )
              }
            >
              <Icon name="heart" size={17} />
            </button>
          }
        />
        <main className="screen no-nav specialist-detail">
          <div className="specialist-identity">
            <span className="specialist-portrait">{selected.emoji}</span>
            <h1>{selected.name}</h1>
            <p>{selected.specialty}</p>
            <small>Perfil ilustrativo do protótipo</small>
          </div>
          <div className="specialist-stats white-card">
            <div>
              <strong>⭐ {selected.stars}</strong>
              <small>{selected.reviews} avaliações</small>
            </div>
            <div>
              <strong>450+</strong>
              <small>Consultas</small>
            </div>
            <div>
              <strong>100%</strong>
              <small>Pontualidade</small>
            </div>
          </div>
          <span className="prototype-label">
            Dados ilustrativos · sem atendimento disponível
          </span>
          <h2>Sobre a Especialista</h2>
          <div className="white-card">
            <p>{selected.about}</p>
          </div>
          <h2>Modalidade de Atendimento</h2>
          <div className="form-grid">
            {['Online', 'Presencial'].map((item) => (
              <button
                className={`modality ${mode === item ? 'selected' : ''}`}
                key={item}
                onClick={() => setMode(item)}
              >
                <span>{item === 'Online' ? '💻' : '🏥'}</span>
                <div>
                  <strong>{item}</strong>
                  <small>
                    {item === 'Online' ? 'Vídeo chamada' : 'Clínica Anápolis'}
                  </small>
                </div>
              </button>
            ))}
          </div>
          <h2>Horários do Protótipo</h2>
          <div className="appointment-times">
            {['09:00', '10:30', '14:00', '16:00'].map((item) => (
              <button
                key={item}
                className={time === item ? 'selected' : ''}
                onClick={() => setTime(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="booking-footer">
            <div>
              <small>Valor ilustrativo</small>
              <strong>R$ {selected.price}</strong>
            </div>
            <button
              className="primary"
              onClick={() =>
                onInfo(
                  'O agendamento com especialistas ainda não está integrado. A seleção de horário serve apenas para visualizar o protótipo. Nenhuma consulta foi marcada.',
                )
              }
            >
              Confirmar Agendamento
            </button>
          </div>
        </main>
      </>
    );
  return (
    <>
      <PageHeader title="Especialistas de Saúde" onBack={onBack} />
      <main className="screen no-nav">
        <div className="input-with-icon search-field">
          <Icon name="search" size={16} />
          <input
            aria-label="Buscar especialista"
            placeholder="Buscar especialista ou especialidade…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="chips">
          {['Todos', 'Nutricionistas', 'Personal Trainers'].map((item) => (
            <button
              key={item}
              className={category === item ? 'active' : ''}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="prototype-note">Perfis ilustrativos do protótipo</p>
        <div className="stack">
          {specialists
            .filter(
              (item) =>
                (category === 'Todos' || item.category === category) &&
                `${item.name} ${item.specialty}`
                  .toLocaleLowerCase('pt-BR')
                  .includes(query.toLocaleLowerCase('pt-BR')),
            )
            .map((item) => (
              <article className="specialist-card white-card" key={item.name}>
                <div className="specialist-row">
                  <span className="specialist-avatar">{item.emoji}</span>
                  <div>
                    <h2>{item.name}</h2>
                    <p>{item.specialty}</p>
                    <small>
                      ⭐ {item.stars} ({item.reviews} avaliações)
                    </small>
                  </div>
                </div>
                <div className="specialist-tags">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="specialist-price">
                  <div>
                    <small>Consulta online</small>
                    <strong>R$ {item.price}</strong>
                  </div>
                  <button className="primary" onClick={() => setSelected(item)}>
                    Agendar
                  </button>
                </div>
              </article>
            ))}
        </div>
      </main>
    </>
  );
}
