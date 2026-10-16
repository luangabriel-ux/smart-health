import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dateKey,
  shiftDate,
  sumProgress,
  activeStreak,
} from '../src/services/health.ts';

test('datas e indicadores usam o dia correto em São Paulo sem inventar registros', () => {
  assert.equal(dateKey(new Date('2026-10-16T02:30:00Z')), '2026-10-15');
  assert.equal(shiftDate('2026-03-01', -1), '2026-02-28');
  const days = [
    {
      date: '2026-10-14',
      waterMl: 250,
      steps: 1500,
      durationMinutes: 20,
      calories: 90,
    },
    {
      date: '2026-10-15',
      waterMl: 500,
      steps: 0,
      durationMinutes: 0,
      calories: 0,
    },
  ];
  assert.deepEqual(sumProgress(days), {
    waterMl: 750,
    steps: 1500,
    durationMinutes: 20,
    calories: 90,
  });
  assert.equal(activeStreak(days, '2026-10-16'), 2);
  assert.equal(activeStreak(days, '2026-10-17'), 0);
  assert.equal(activeStreak([], '2026-10-16'), 0);
});
