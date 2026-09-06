import { AppError } from './errors.js';
export const invalid = (message) => { throw new AppError(400, 'VALIDATION_ERROR', message); };
export function object(value, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('Informe um objeto JSON.');
  if (Object.keys(value).some(key => !allowed.includes(key))) invalid('Campo não permitido.');
  return value;
}
export function string(value, name, max = 200) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) invalid(`${name} inválido.`);
  return value.trim();
}
export function number(value, name, min, max, integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) invalid(`${name} inválido.`);
  return value;
}
export function uuid(value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) invalid('ID inválido.');
  return value;
}
export function pagination(query) {
  const parse = (value, fallback, max) => {
    if (value === undefined) return fallback;
    if (typeof value !== 'string' || !/^\d+$/.test(value)) invalid('Paginação inválida.');
    return number(Number(value), 'Paginação', 0, max, true);
  };
  return { limit: Math.max(1, parse(query.limit, 20, 100)), offset: parse(query.offset, 0, 100000) };
}
