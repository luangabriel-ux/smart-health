import { object, string, number, invalid } from '../../../shared/validation.js';
export function activity(body) {
  object(body, ['type', 'description', 'occurredAt', 'durationMinutes', 'waterMl', 'steps', 'calories']);
  if (!['exercise', 'water', 'meal', 'habit'].includes(body.type)) invalid('Tipo inválido.');
  const result = { type: body.type, description: string(body.description, 'Descrição', 500) };
  if (typeof body.occurredAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.test(body.occurredAt) || !Number.isFinite(Date.parse(body.occurredAt))) invalid('occurredAt deve ser uma data ISO com fuso.');
  const day = body.occurredAt.slice(0, 10);
  if (new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day) invalid('Data inválida.');
  if (Date.parse(body.occurredAt) > Date.now()) invalid('Atividade não pode estar no futuro.');
  result.occurredAt = body.occurredAt;
  if (body.type === 'water') result.waterMl = number(body.waterMl, 'waterMl', 1, 20000, true);
  else if (body.waterMl !== undefined) invalid('waterMl só é permitido para água.');
  for (const [key, min, max] of [['durationMinutes', 1, 1440], ['steps', 0, 200000], ['calories', 0, 30000]]) {
    if (body[key] !== undefined) {
      if (body.type !== 'exercise') invalid(`${key} só é permitido para exercício.`);
      result[key] = number(body[key], key, min, max, true);
    }
  }
  return result;
}
