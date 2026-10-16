import {
  object,
  number,
  invalid
} from '../../../shared/validation.js';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function date(value, name) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    invalid(`${name} deve estar no formato YYYY-MM-DD.`);
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    invalid(`${name} possui uma data inválida.`);
  }

  return value;
}

export function progressRange(query) {
  object(query, ['from', 'to']);

  if (query.from === undefined) {
    invalid('from é obrigatório.');
  }

  if (query.to === undefined) {
    invalid('to é obrigatório.');
  }

  const from = date(query.from, 'from');
  const to = date(query.to, 'to');

  const fromTime = Date.parse(`${from}T00:00:00Z`);
  const toTime = Date.parse(`${to}T00:00:00Z`);

  if (toTime < fromTime) {
    invalid('O período final não pode ser anterior ao inicial.');
  }

  const numberOfDays =
    Math.floor((toTime - fromTime) / ONE_DAY_MS) + 1;

  if (numberOfDays > 366) {
    invalid('O período não pode ultrapassar 366 dias.');
  }

  return {
    from,
    to
  };
}

export function progressGoals(body) {
  object(body, [
    'steps',
    'waterMl',
    'durationMinutes',
    'calories'
  ]);

  if (Object.keys(body).length === 0) {
    invalid('Informe pelo menos uma meta.');
  }

  const result = {};

  if (body.steps !== undefined) {
    result.steps = number(
      body.steps,
      'steps',
      1,
      2147483647,
      true
    );
  }

  if (body.waterMl !== undefined) {
    result.waterMl = number(
      body.waterMl,
      'waterMl',
      1,
      2147483647,
      true
    );
  }

  if (body.durationMinutes !== undefined) {
    result.durationMinutes = number(
      body.durationMinutes,
      'durationMinutes',
      1,
      2147483647,
      true
    );
  }

  if (body.calories !== undefined) {
    result.calories = number(
      body.calories,
      'calories',
      1,
      2147483647,
      true
    );
  }

  return result;
}
