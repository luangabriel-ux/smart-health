import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Api } from '../services/api.ts';
import type { Profile, User } from '../services/types.ts';
import { Feedback, errorMessage } from '../components/Feedback.tsx';
import { Icon } from '../components/Icon.tsx';
import { PageHeader } from '../components/Mobile.tsx';

const options = [ ['Emagrecimento', 'Equilibrar seus hábitos e acompanhar mudanças.'], ['Ganho de Massa', 'Acompanhar seu objetivo e sua rotina.'], ['Condicionamento', 'Observar sua consistência nas atividades.'], ['Saúde Mental', 'Organizar momentos de cuidado e bem-estar.'] ];
export function ProfilePage({ api, user, onUpdate, onBack, onboarding = false }: { api: Api; user: User; onUpdate: (user: User) => void; onBack: () => void; onboarding?: boolean }) {
  const [goal, setGoal] = useState(user.healthGoals ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const values = new FormData(event.currentTarget);
    const number = (key: string) => values.get(key) === '' ? null : Number(values.get(key));
    const input: Profile = { name: String(values.get('name') ?? user.name).trim(), age: number('age'), weightKg: number('weightKg'), heightCm: number('heightCm'), healthGoals: goal.trim() || null, medicalConditions: String(values.get('medicalConditions') ?? '').trim() || null };
    setBusy(true); setError(''); setMessage('');
    try { onUpdate((await api.updateProfile(input)).data); if (onboarding) onBack(); else setMessage('Perfil atualizado com sucesso.'); }
    catch (error) { setError(errorMessage(error)); } finally { setBusy(false); }
  }
  return <><PageHeader title={onboarding ? '' : 'Editar Perfil'} onBack={onBack} action={onboarding ? <span className="step-label">Etapa 2/2</span> : <button className="text-button" form="profile-form" type="submit" disabled={busy}>Salvar</button>} />
    <main className="screen no-nav"><Feedback error={error} message={message} />
      {onboarding ? <><div className="onboarding-steps"><i /><i /><i /></div><h1>Seu Perfil de Saúde 🩺</h1><p className="subtitle">Personalizamos seus lembretes e treinos conforme seu perfil.</p></>
        : <div className="edit-avatar"><span><Icon name="user" size={40} /></span><small>Sua identificação no Smart Health</small></div>}
      <form id="profile-form" onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
        {!onboarding && <section className="white-card profile-form-card"><h2><Icon name="user" size={16} />INFORMAÇÕES PESSOAIS</h2><label>Nome Completo<input name="name" defaultValue={user.name} required maxLength={120} autoComplete="name" /></label><label>E-mail Cadastrado<input value={user.email} readOnly autoComplete="email" /></label><label>Idade<input name="age" type="number" min={1} max={120} step={1} defaultValue={user.age ?? ''} /></label></section>}
        <section className={onboarding ? 'onboarding-form' : 'white-card profile-form-card'}>{!onboarding && <h2><Icon name="health" size={16} />PERFIL FÍSICO &amp; SAÚDE</h2>}
          <div className={`form-grid ${onboarding ? 'three' : ''}`}>{onboarding && <label>Idade<input name="age" type="number" min={1} max={120} step={1} defaultValue={user.age ?? ''} /></label>}
            <label>Peso {onboarding ? '(kg)' : 'Atual (kg)'}<input name="weightKg" type="number" min={.01} max={500} step="any" defaultValue={user.weightKg ?? ''} /></label><label>Altura (cm)<input name="heightCm" type="number" min={.01} max={300} step="any" defaultValue={user.heightCm ?? ''} /></label></div>
          <label>Qual é o seu objetivo principal?</label><div className={onboarding ? 'goal-options' : 'goal-chips'}>{options.map(([title, description], index) => <button type="button" key={title} className={goal === title ? 'selected' : ''} aria-pressed={goal === title} onClick={() => setGoal(title)}>{onboarding && <><span className="soft-icon"><Icon name={(['health','dumbbell','coffee','heart'] as const)[index]} size={19} /></span>{goal === title && <span className="goal-check"><Icon name="check" size={11} /></span>}</>}<strong>{title}</strong>{onboarding && <small>{description}</small>}</button>)}</div>
          <label>Objetivos de saúde<textarea name="healthGoals" value={goal} onChange={event => setGoal(event.target.value)} maxLength={1000} placeholder="Conte o que você quer acompanhar" /></label>
          <label>Condições médicas ou restrições<textarea name="medicalConditions" maxLength={2000} defaultValue={user.medicalConditions ?? ''} placeholder="Opcional" /></label>
        </section><button className="primary full" type="submit">{!onboarding && <Icon name="check" size={17} />}{busy ? 'Salvando…' : onboarding ? 'Concluir e Começar' : 'Salvar Alterações'}</button>
      </fieldset></form>{onboarding && <button className="text-button skip-profile" onClick={onBack}>Preencher depois</button>}
    </main></>;
}
