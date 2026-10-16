import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Api } from '../services/api.ts';
import type { Session } from '../services/types.ts';
import { Feedback, errorMessage } from '../components/Feedback.tsx';

export function AuthPage({ api, onLogin, notice }: { api: Api; onLogin: (session: Session) => void; notice: string }) {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const input = { email: String(values.get('email')), password: String(values.get('password')) };
    setBusy(true); setError(''); setMessage('');
    try {
      if (register) {
        await api.register({ ...input, name: String(values.get('name')) });
        form.reset(); setRegister(false); setMessage('Conta criada. Entre com seu e-mail e senha.');
      } else onLogin((await api.login(input)).data);
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <main className="auth-layout">
    <section className="intro"><span className="eyebrow">SMART HEALTH</span>
      <h1>Seu cuidado começa com pequenos hábitos.</h1>
      <p>Registre suas atividades e mantenha seu perfil de saúde em um só lugar.</p>
    </section>
    <section className="card auth-card" aria-labelledby="auth-title">
      <h2 id="auth-title">{register ? 'Criar sua conta' : 'Bem-vindo de volta'}</h2>
      <p>{register ? 'Preencha seus dados para começar.' : 'Entre para acompanhar sua rotina.'}</p>
      <Feedback error={error} message={message || notice} />
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset disabled={busy}>
          {register && <label>Nome<input name="name" autoComplete="name" required maxLength={120} /></label>}
          <label>E-mail<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
          <label>Senha<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} /></label>
          {register && <small>Use de 8 a 128 caracteres.</small>}
          <button type="submit">{busy ? 'Aguarde…' : register ? 'Criar conta' : 'Entrar'}</button>
        </fieldset>
      </form>
      <button className="text-button" disabled={busy} onClick={() => { setRegister(!register); setError(''); setMessage(''); }}>
        {register ? 'Já tenho uma conta' : 'Ainda não tenho conta'}</button>
    </section>
  </main>;
}
