import {
  object,
  string,
  pagination,
  invalid
} from '../../../shared/validation.js';

export function contentFilters(query) {
  object(query, [
    'category',
    'type',
    'difficulty',
    'limit',
    'offset'
  ]);

  const page = pagination(query);
  const filters = {};

  if (query.category !== undefined) {
    filters.category = string(
      query.category,
      'category',
      100
    );
  }

  if (query.type !== undefined) {
    if (
      query.type !== 'article' &&
      query.type !== 'video'
    ) {
      invalid('type deve ser article ou video.');
    }

    filters.type = query.type;
  }

  if (query.difficulty !== undefined) {
    filters.difficulty = string(
      query.difficulty,
      'difficulty',
      100
    );
  }

  return {
    ...filters,
    ...page
  };
}
