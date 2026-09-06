import { randomUUID } from 'node:crypto';
import { AppError } from '../../../shared/errors.js';
import { activityView } from '../models/index.js';
const notFound = () => { throw new AppError(404, 'ACTIVITY_NOT_FOUND', 'Atividade não encontrada.'); };
export function createActivitiesService(repository) {
  return {
    async create(userId, input) { return activityView(await repository.create(randomUUID(), userId, input)); },
    async list(userId, page) { return (await repository.list(userId, page)).map(activityView); },
    async get(userId, id) { const row = await repository.get(userId,id); if (!row) notFound(); return activityView(row); },
    async remove(userId, id) { if (!await repository.remove(userId,id)) notFound(); }
  };
}
