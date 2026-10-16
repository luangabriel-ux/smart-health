import { PageHeader } from '../components/Mobile.tsx';
import { Icon } from '../components/Icon.tsx';
export function SettingsPage({
  onBack,
  darkMode,
  onDarkMode,
  onInfo,
}: {
  onBack: () => void;
  darkMode: boolean;
  onDarkMode: (value: boolean) => void;
  onInfo: (message: string) => void;
}) {
  const pending =
    'Este recurso ainda não está disponível nesta versão do Smart Health.';
  return (
    <>
      <PageHeader title="Configurações" onBack={onBack} />
      <main className="screen no-nav settings-screen">
        <h2>NOTIFICAÇÕES E HÁBITOS</h2>
        <div className="settings-group">
          {[
            'Notificações Push',
            'Lembretes de Água',
            'Sons durante Treino',
          ].map((label) => (
            <div className="settings-row" key={label}>
              <span>
                {label}
                <small>Em breve</small>
              </span>
              <input
                type="checkbox"
                role="switch"
                aria-label={label}
                className="switch"
                disabled
              />
            </div>
          ))}
          <label className="settings-row">
            <span>Modo Escuro</span>
            <input
              type="checkbox"
              role="switch"
              className="switch"
              checked={darkMode}
              onChange={(event) => onDarkMode(event.target.checked)}
            />
          </label>
        </div>
        <h2>PREFERÊNCIAS</h2>
        <div className="settings-group">
          <button
            onClick={() =>
              onInfo(
                'Seus registros utilizam quilogramas, centímetros, mililitros e minutos. Outras unidades ainda não estão disponíveis.',
              )
            }
          >
            <span>Unidades de Medida</span>
            <small>Métrico (kg / cm)</small>
            <Icon name="next" size={14} />
          </button>
          <button
            onClick={() =>
              onInfo('O Smart Health está disponível em Português do Brasil.')
            }
          >
            <span>Idioma</span>
            <small>Português (BR)</small>
            <Icon name="next" size={14} />
          </button>
        </div>
        <h2>SEGURANÇA E LEGAL</h2>
        <div className="settings-group">
          <button
            onClick={() =>
              onInfo(
                'A alteração de senha ainda não está disponível. Sua senha é protegida no servidor usando scrypt com salt.',
              )
            }
          >
            <span>Alterar Senha</span>
            <Icon name="next" size={14} />
          </button>
          <div className="settings-row">
            <span>
              Acesso por Biometria<small>Em breve</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              aria-label="Acesso por Biometria"
              className="switch"
              disabled
            />
          </div>
          <button
            onClick={() =>
              onInfo(
                'Os termos formais de uso ainda serão disponibilizados pela equipe do projeto.',
              )
            }
          >
            <span>Termos de Uso</span>
            <Icon name="next" size={14} />
          </button>
          <button
            onClick={() =>
              onInfo(
                'A política formal de privacidade ainda será disponibilizada pela equipe. Os dados pessoais da aplicação são acessados pelo titular autenticado.',
              )
            }
          >
            <span>Política de Privacidade</span>
            <Icon name="next" size={14} />
          </button>
        </div>
        <p className="settings-footer">Smart Health · UniEVANGÉLICA 2026</p>
        <button className="text-button" onClick={() => onInfo(pending)}>
          Sobre os recursos em breve
        </button>
      </main>
    </>
  );
}
