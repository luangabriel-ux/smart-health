import type { ProgressDay } from './types.ts';
export function dateKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value);
  const get = (type: string) => parts.find(part => part.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function shiftDate(date: string, amount: number) {
  const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}
export function sumProgress(days: ProgressDay[]) {
  return days.reduce((sum, day) => ({ waterMl: sum.waterMl + day.waterMl, steps: sum.steps + day.steps, durationMinutes: sum.durationMinutes + day.durationMinutes, calories: sum.calories + day.calories }), { waterMl: 0, steps: 0, durationMinutes: 0, calories: 0 });
}
export function activeStreak(days: ProgressDay[], today = dateKey()) {
  const dates = new Set(days.map(day => day.date));
  let cursor = dates.has(today) ? today : shiftDate(today, -1), count = 0;
  while (dates.has(cursor)) { count++; cursor = shiftDate(cursor, -1); }
  return count;
}
export function formatNumber(value: number) { return value.toLocaleString('pt-BR'); }
