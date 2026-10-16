import type { Goals } from '../services/types.ts';
import { Icon } from './Icon.tsx';
import { formatNumber } from '../services/health.ts';

export function MetricCards({ values, goals, compact = false }: { values: { steps: number; calories: number; waterMl: number; durationMinutes: number }; goals?: Goals | null; compact?: boolean }) {
  const metrics = [
    { key: 'steps', title: 'Passos', icon: 'steps', color: 'blue', value: values.steps, suffix: '' },
    { key: 'calories', title: 'Calorias', icon: 'fire', color: 'orange', value: values.calories, suffix: compact ? ' kcal' : '' },
    { key: 'waterMl', title: compact ? 'Água' : 'Água (ml)', icon: 'water', color: 'blue', value: compact ? values.waterMl / 1000 : values.waterMl, suffix: compact ? ' L' : '' },
    { key: 'durationMinutes', title: 'Exercício', icon: 'clock', color: 'green', value: values.durationMinutes, suffix: compact ? ' min' : '' }
  ] as const;
  return <div className={`metric-grid${compact ? ' metric-compact' : ''}`}>{metrics.map(metric => {
    const target = goals?.[metric.key];
    return <div key={metric.key} className="metric-card"><span className={`metric-label ${metric.color}`}><Icon name={metric.icon} size={13} />{metric.title}</span>
      <strong>{formatNumber(metric.value)}<small>{metric.suffix}</small></strong>
      {!compact && <span className="metric-target">{target ? `Meta: ${formatNumber(target)}` : 'Meta não definida'}</span>}
      <div className="meter"><span style={{ width: `${target ? Math.min(100, values[metric.key] / target * 100) : 0}%` }} /></div>
    </div>;
  })}</div>;
}
