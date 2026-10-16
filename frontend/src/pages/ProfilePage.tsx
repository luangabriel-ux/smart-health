import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Api } from '../services/api.ts';
import type { Profile, User } from '../services/types.ts';
import { Feedback, errorMessage } from '../components/Feedback.tsx';

export function ProfilePage({ api, user, onUpdate }: { api: Api; user: User; onUpdate: (user: User) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const number = (key: string) => values.get(key) === '' ? null : Number(values.get(key));
    const text = (key: string) => String(values.get(key) ?? '').trim() || null;
    const input: Profile = { name: String(values.get('name')).trim(), age: number('age'), weightKg: number('weightKg'),
      heightCm: number('heightCm'), healthGoals: text('healthGoals'), medicalConditions: text('medicalConditions') };
    setBusy(true); setError(''); setMessage('');
    try { onUpdate((await api.updateProfile(input)).data); setMessage('Perfil atualizado.'); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <section className="card" aria-labelledby="profile-title"><h2 id="profile-title">Meu perfil</h2>
    <p>Atualize suas informações. Os campos de saúde são opcionais.</p>
    <p className="account-info">{user.email} · Plano {user.plan}</p>
    <Feedback error={error} message={message} />
    <form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
      <label>Nome<input name="name" autoComplete="name" defaultValue={user.name} required maxLength={120} /></label>
      <div className="form-grid">
        <label>Idade<input name="age" type="number" min={1} max={120} step={1} defaultValue={user.age ?? ''} /></label>
        <label>Peso (kg)<input name="weightKg" type="number" min={0.01} max={500} step="any" defaultValue={user.weightKg ?? ''} /></label>
        <label>Altura (cm)<input name="heightCm" type="number" min={0.01} max={300} step="any" defaultValue={user.heightCm ?? ''} /></label>
      </div>
      <label>Objetivos de saúde<textarea name="healthGoals" maxLength={1000} defaultValue={user.healthGoals ?? ''} /></label>
      <label>Condições médicas<textarea name="medicalConditions" maxLength={2000} defaultValue={user.medicalConditions ?? ''} /></label>
      <small>Deixe um campo opcional vazio para remover a informação salva.</small>
      <button type="submit">{busy ? 'Salvando…' : 'Salvar perfil'}</button>
    </fieldset></form>
  </section>;
}
