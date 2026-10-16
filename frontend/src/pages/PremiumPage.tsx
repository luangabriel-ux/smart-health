import { useState } from 'react';
import { Icon } from '../components/Icon.tsx';
export function PremiumPage({ onBack, onInfo }: { onBack: () => void; onInfo: (message: string) => void }) {
  const [annual, setAnnual] = useState(true);
  return <main className="premium-screen"><div className="premium-close"><button className="icon-button" aria-label="Fechar plano Premium" onClick={onBack}><Icon name="close" size={18} /></button></div>
    <div className="premium-heading"><span className="premium-crown">👑</span><h1>Smart Health Premium</h1><p>Acelere seus resultados com recursos exclusivos<br />e acompanhamento profissional.</p><span className="prototype-label">Prévia do plano · contratação em breve</span></div>
    <div className="premium-benefits">{['Biblioteca completa de treinos em vídeo em 4K', 'Até 25% de desconto em consultas com especialistas', 'Análise avançada de métricas e evolução com IA', 'Experiência 100% livre de propagandas'].map(text => <div key={text}><span><Icon name="check" size={15} /></span><p>{text}</p></div>)}</div>
    <div className="plan-options"><button aria-pressed={annual} className={annual ? 'selected' : ''} onClick={() => setAnnual(true)}><span className="popular-label">33% OFF · MAIS POPULAR</span><div><strong>Plano Anual</strong><small>Cobrado anualmente (R$ 238,80)</small></div><div className="plan-price"><strong>R$ 19,90</strong><small>/mês</small></div></button>
      <button aria-pressed={!annual} className={!annual ? 'selected' : ''} onClick={() => setAnnual(false)}><div><strong>Plano Mensal</strong><small>Flexibilidade para cancelar a<br />qualquer momento</small></div><div className="plan-price"><strong>R$ 29,90</strong><small>/mês</small></div></button></div>
    <button className="premium-cta full" onClick={() => onInfo('A contratação do Premium ainda não está disponível. Os preços e benefícios desta tela são a proposta apresentada no protótipo. Nenhuma cobrança será realizada e seu plano não será alterado.')}>Assinar Agora</button><small className="premium-disclaimer">Valores e benefícios do protótipo. Nenhuma cobrança nesta versão.</small>
  </main>;
}
