import { useEffect, useState } from 'react';
import type { Api } from '../services/api.ts';
import type { Goals, ProgressDay } from '../services/types.ts';
import { dateKey, shiftDate, sumProgress } from '../services/health.ts';
import { errorMessage } from '../components/Feedback.tsx';

export function useHealthData(api: Api, revision = 0) {
  const [days, setDays] = useState<ProgressDay[]>([]);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = dateKey();
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([api.progress(shiftDate(today, -29), today), api.getGoals()])
      .then(([progress, targets]) => {
        if (active) {
          setDays(progress.data);
          setGoals(targets.data);
        }
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
  }, [api, today, revision]);
  return {
    days,
    goals,
    loading,
    error,
    today,
    daily: sumProgress(days.filter((day) => day.date === today)),
    totals: sumProgress(days),
  };
}
