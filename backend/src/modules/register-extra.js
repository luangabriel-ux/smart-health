import { createRecommendationsRepository } from './recommendations/repositories/index.js';
import { createRecommendationsService } from './recommendations/services/index.js';
import { createRecommendationsRouter } from './recommendations/routes/index.js';

import { createContentRepository } from './content/repositories/index.js';
import { createContentService } from './content/services/index.js';
import { createContentRouter } from './content/routes/index.js';

import { createRemindersRepository } from './reminders/repositories/index.js';
import { createRemindersService } from './reminders/services/index.js';
import { createRemindersRouter } from './reminders/routes/index.js';

import { createProgressRepository } from './progress/repositories/index.js';
import { createProgressService } from './progress/services/index.js';
import { createProgressRouter } from './progress/routes/index.js';

export function registerModules(
  app,
  { pool, authenticate }
) {
  const remindersRepository =
    createRemindersRepository(pool);

  const remindersService =
    createRemindersService(remindersRepository);

  app.use(
    '/api/reminders',
    createRemindersRouter(
      remindersService,
      authenticate
    )
  );

  const progressRepository =
    createProgressRepository(pool);

  const progressService =
    createProgressService(progressRepository);

  app.use(
    '/api/progress',
    createProgressRouter(
      progressService,
      authenticate
    )
  );
const contentRepository =
  createContentRepository(pool);

const contentService =
  createContentService(contentRepository);

app.use(
  '/api/content',
  createContentRouter(
    contentService,
    authenticate
  )
);
const recommendationsRepository =
  createRecommendationsRepository(pool);

const recommendationsService =
  createRecommendationsService(
    recommendationsRepository
  );

app.use(
  '/api/recommendations',
  createRecommendationsRouter(
    recommendationsService,
    authenticate
  )
);
}
