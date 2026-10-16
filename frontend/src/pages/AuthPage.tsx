import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Api } from '../services/api.ts';
import type { Session } from '../services/types.ts';
import { Feedback, errorMessage } from '../components/Feedback.tsx';
import { Icon } from '../components/Icon.tsx';
import { Logo, StatusBar } from '../components/Mobile.tsx';
import { InfoDialog } from '../components/InfoDialog.tsx';

export function AuthPage({ api, onLogin, notice }: { api: Api; onLogin: (session: Session) => void; notice: string }) {
  const [screen, setScreen] = useState<'welcome' | 'login' | 'register'>(notice ? 'login' : 'welcome');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState('');
  const register = screen === 'register';
  function change(next: typeof screen) { setScreen(next); setError(''); setMessage(''); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget, values = new FormData(form);
    const input = { email: String(values.get('email')), password: String(values.get('password')) };
    setError(''); setMessage('');
    if (register && values.get('confirmation') !== input.password) { setError('As senhas não coincidem.'); return; }
    setBusy(true);
    try {
      if (register) {
        await api.register({ ...input, name: String(values.get('name')) });
        form.reset(); setScreen('login'); setMessage('Conta criada. Entre para completar seu perfil de saúde.');
      } else onLogin((await api.login(input)).data);
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <div className={`app-shell auth-shell ${screen === 'welcome' ? 'welcome-screen' : ''}`}><StatusBar />
    {screen === 'welcome' ? <main className="splash-screen"><div className="splash-identity"><Logo large /><h1>Smart Health</h1><p>Sua plataforma inteligente para<br />acompanhamento de saúde, treinos e<br />qualidade de vida.</p></div>
      <div className="splash-actions"><button className="primary full" onClick={() => change('register')}>Criar Nova Conta</button><button className="outline full" onClick={() => change('login')}>Já tenho uma conta</button><small>Projeto Integrador · UniEVANGÉLICA</small></div>
    </main> : <><header className="auth-header"><button className="icon-button" aria-label="Voltar" onClick={() => change('welcome')}><Icon name="back" /></button><div className="auth-brand"><Logo /><strong>Smart Health</strong></div><span /></header>
      <main className="auth-content"><h1>{register ? 'Crie sua Conta ✨' : 'Bem-vindo de volta! 👋'}</h1><p className="subtitle">{register ? 'Comece a transformar sua rotina com saúde inteligente.' : 'Digite suas credenciais para acessar sua rotina e progresso.'}</p>
        <Feedback error={error} message={message || notice} />
        <form key={screen} onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
          {register && <label>Nome Completo<input name="name" autoComplete="name" required maxLength={120} placeholder="Seu nome completo" /></label>}
          <label>E-mail<div className="input-with-icon">{!register && <Icon name="mail" size={17} />}<input name="email" type="email" autoComplete="username" required maxLength={254} placeholder="seuemail@exemplo.com" /></div></label>
          <label><span className="label-line">Senha{!register && <button type="button" className="text-button" onClick={() => setInfo('A recuperação de senha ainda não está disponível nesta versão. Use suas credenciais cadastradas para entrar.')}>Esqueci minha senha</button>}</span>
            <div className="input-with-icon">{!register && <Icon name="lock" size={17} />}<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} placeholder={register ? 'Mínimo 8 caracteres' : 'Sua senha'} /></div></label>
          {register && <><label>Confirmar Senha<input name="confirmation" type="password" autoComplete="new-password" required minLength={8} maxLength={128} placeholder="Repita sua senha" /></label>
            <p className="terms-note">Ao continuar, consulte os <button type="button" className="inline-link" onClick={() => setInfo('Os termos formais do projeto ainda serão disponibilizados pela equipe. Este ambiente acadêmico permite cadastrar uma conta e registrar suas atividades.')}>Termos de Serviço</button> e a <button type="button" className="inline-link" onClick={() => setInfo('As informações do perfil e atividades são armazenadas no banco do projeto e acessadas com autenticação. A política formal de privacidade ainda será disponibilizada pela equipe.')}>Política de Privacidade</button> do Smart Health.</p></>}
          <button className="primary full" type="submit">{busy ? 'Aguarde…' : register ? 'Continuar' : 'Entrar na Conta'}</button>
        </fieldset></form>
        {!register && <><div className="divider"><span>ou continue com</span></div><button className="outline google-button full" onClick={() => setInfo('O login com Google ainda não está integrado. Entre com o e-mail e a senha cadastrados no Smart Health.')}><span className="google-g">G</span>Continuar com o Google</button></>}
      </main><footer className="auth-footer">{register ? 'Já possui uma conta?' : 'Ainda não possui conta?'} <button className="inline-link" disabled={busy} onClick={() => change(register ? 'login' : 'register')}>{register ? 'Entrar' : 'Criar conta'}</button></footer>
    </>}{info && <InfoDialog message={info} onClose={() => setInfo('')} />}
  </div>;
}
