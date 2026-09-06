import { invalid, object, string } from '../../../shared/validation.js';

function validateTime(value) {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    invalid('time deve estar no formato HH:mm.');
  }

  return value;
}

function validateWeekdays(value) {
  if (!Array.isArray(value) || value.length === 0) {
    invalid('weekdays deve possuir pelo menos um dia.');
  }

  if (
    value.some(
      (day) =>
        !Number.isInteger(day) ||
        day < 0 ||
        day > 6
    )
  ) {
    invalid('weekdays deve conter apenas inteiros de 0 a 6.');
  }

  if (new Set(value).size !== value.length) {
    invalid('weekdays não pode possuir dias repetidos.');
  }

  return [...value].sort((a, b) => a - b);
}

function validateTimezone(value) {
  if (typeof value !== 'string' || !value.trim()) {
    invalid('timezone inválido.');
  }

  const timezone = value.trim();

  try {
    new Intl.DateTimeFormat('pt-BR', {
      timeZone: timezone
    }).format();
  } catch {
    invalid('timezone deve ser um fuso IANA válido.');
  }

  return timezone;
}

function validateActive(value) {
  if (typeof value !== 'boolean') {
    invalid('active deve ser booleano.');
  }

  return value;
}

export function createReminder(body) {
  object(body, [
    'title',
    'time',
    'weekdays',
    'timezone',
    'active'
  ]);

  if (body.title === undefined) {
    invalid('title é obrigatório.');
  }

  if (body.time === undefined) {
    invalid('time é obrigatório.');
  }

  if (body.weekdays === undefined) {
    invalid('weekdays é obrigatório.');
  }

  return {
    title: string(body.title, 'title', 120),
    time: validateTime(body.time),
    weekdays: validateWeekdays(body.weekdays),
    timezone:
      body.timezone === undefined
        ? 'America/Sao_Paulo'
        : validateTimezone(body.timezone),
    active:
      body.active === undefined
        ? true
        : validateActive(body.active)
  };
}

export function updateReminder(body) {
  object(body, [
    'title',
    'time',
    'weekdays',
    'timezone',
    'active'
  ]);

  if (Object.keys(body).length === 0) {
    invalid('Informe pelo menos um campo para atualização.');
  }

  const result = {};

  if (body.title !== undefined) {
    result.title = string(body.title, 'title', 120);
  }

  if (body.time !== undefined) {
    result.time = validateTime(body.time);
  }

  if (body.weekdays !== undefined) {
    result.weekdays = validateWeekdays(body.weekdays);
  }

  if (body.timezone !== undefined) {
    result.timezone = validateTimezone(body.timezone);
  }

  if (body.active !== undefined) {
    result.active = validateActive(body.active);
  }

  return result;
}
