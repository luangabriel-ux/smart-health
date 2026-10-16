import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { createPool } from '../src/database/connection/index.js';
import { migrate } from '../src/database/migrate.js';
import { createApp } from '../src/app.js';
import { registerModules } from '../src/modules/register-extra.js';

test(
  'Conteúdos - filtros, paginação e controle Premium',
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    const admin = createPool(process.env.TEST_DATABASE_URL);

    const schema =
      `test_${randomUUID().replaceAll('-', '')}`;

    await admin.query(`CREATE SCHEMA ${schema}`);

    const url = new URL(process.env.TEST_DATABASE_URL);

    url.searchParams.set(
      'options',
      `-c search_path=${schema}`
    );

    const pool = createPool(url.toString());

    let server;

    try {
      await migrate(pool);

      server = createApp({
        pool,
        registerModules
      }).listen(0, '127.0.0.1');

      await new Promise((resolve) =>
        server.once('listening', resolve)
      );

      async function call(
        path,
        method = 'GET',
        body,
        token
      ) {
        const response = await fetch(
          `http://127.0.0.1:${server.address().port}/api${path}`,
          {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {})
            },
            ...(body
              ? { body: JSON.stringify(body) }
              : {})
          }
        );

        return {
          status: response.status,
          body:
            response.status === 204
              ? null
              : await response.json()
        };
      }

      // Cria usuário Free
      const email = 'content.user@example.com';

      assert.equal(
        (
          await call('/auth/register', 'POST', {
            name: 'Lucas',
            email,
            password: 'password123'
          })
        ).status,
        201
      );

      const login = await call(
        '/auth/login',
        'POST',
        {
          email,
          password: 'password123'
        }
      );

      assert.equal(login.status, 200);

      const token = login.body.data.accessToken;

      // Conteúdos inseridos diretamente para demonstração
      const freeArticleId = randomUUID();
      const premiumArticleId = randomUUID();
      const premiumVideoId = randomUUID();

      await pool.query(
        `INSERT INTO contents(
          id,
          title,
          category,
          type,
          text_content,
          url,
          difficulty,
          is_premium,
          created_at
        )
        VALUES
        (
          $1,
          'Hidratação básica',
          'saude',
          'article',
          'Conteúdo demonstrativo sobre hidratação.',
          NULL,
          'iniciante',
          false,
          '2026-01-01T10:00:00Z'
        ),
        (
          $2,
          'Sono e recuperação',
          'bem-estar',
          'article',
          'Conteúdo Premium demonstrativo.',
          NULL,
          'intermediario',
          true,
          '2026-01-02T10:00:00Z'
        ),
        (
          $3,
          'Treino demonstrativo',
          'treino',
          'video',
          NULL,
          'https://example.com/video',
          'iniciante',
          true,
          '2026-01-03T10:00:00Z'
        )`,
        [
          freeArticleId,
          premiumArticleId,
          premiumVideoId
        ]
      );

      // Sem autenticação deve bloquear
      assert.equal(
        (await call('/content')).status,
        401
      );

      // Listagem
      const list = await call(
        '/content',
        'GET',
        undefined,
        token
      );

      assert.equal(list.status, 200);
      assert.equal(list.body.data.length, 3);

      // Conteúdo Free deve estar liberado
      const freeArticle = list.body.data.find(
        (item) => item.id === freeArticleId
      );

      assert.equal(freeArticle.locked, false);
      assert.equal(
        freeArticle.textContent,
        'Conteúdo demonstrativo sobre hidratação.'
      );

      // Premium aparece na listagem, mas protegido
      const premiumArticle = list.body.data.find(
        (item) => item.id === premiumArticleId
      );

      assert.equal(premiumArticle.isPremium, true);
      assert.equal(premiumArticle.locked, true);
      assert.equal(premiumArticle.textContent, null);
      assert.equal(premiumArticle.url, null);

      const premiumVideo = list.body.data.find(
        (item) => item.id === premiumVideoId
      );

      assert.equal(premiumVideo.locked, true);
      assert.equal(premiumVideo.url, null);

      // GET individual Premium também não pode vazar
      const lockedDetail = await call(
        `/content/${premiumVideoId}`,
        'GET',
        undefined,
        token
      );

      assert.equal(lockedDetail.status, 200);
      assert.equal(lockedDetail.body.data.locked, true);
      assert.equal(lockedDetail.body.data.url, null);

      // Filtro por tipo
      const videos = await call(
        '/content?type=video',
        'GET',
        undefined,
        token
      );

      assert.equal(videos.status, 200);
      assert.equal(videos.body.data.length, 1);
      assert.equal(videos.body.data[0].type, 'video');

      // Filtro por categoria
      const health = await call(
        '/content?category=saude',
        'GET',
        undefined,
        token
      );

      assert.equal(health.status, 200);
      assert.equal(health.body.data.length, 1);
      assert.equal(
        health.body.data[0].category,
        'saude'
      );

      // Paginação
      const paginated = await call(
        '/content?limit=1&offset=0',
        'GET',
        undefined,
        token
      );

      assert.equal(paginated.status, 200);
      assert.equal(paginated.body.data.length, 1);
      assert.equal(paginated.body.pagination.limit, 1);
      assert.equal(paginated.body.pagination.offset, 0);

      // Tipo inválido
      assert.equal(
        (
          await call(
            '/content?type=podcast',
            'GET',
            undefined,
            token
          )
        ).status,
        400
      );

      // UUID inválido
      assert.equal(
        (
          await call(
            '/content/id-invalido',
            'GET',
            undefined,
            token
          )
        ).status,
        400
      );

      // Conteúdo inexistente
      assert.equal(
        (
          await call(
            `/content/${randomUUID()}`,
            'GET',
            undefined,
            token
          )
        ).status,
        404
      );

      // Promove usuário diretamente no banco apenas no teste
      await pool.query(
        `UPDATE users
         SET plan = 'premium'
         WHERE email = $1`,
        [email]
      );

      // O mesmo token passa a autenticar o usuário como Premium
      const unlocked = await call(
        `/content/${premiumVideoId}`,
        'GET',
        undefined,
        token
      );

      assert.equal(unlocked.status, 200);
      assert.equal(unlocked.body.data.locked, false);
      assert.equal(
        unlocked.body.data.url,
        'https://example.com/video'
      );
    } finally {
      if (server) {
        await new Promise((resolve) =>
          server.close(resolve)
        );
      }

      await pool.end();

      await admin.query(
        `DROP SCHEMA ${schema} CASCADE`
      );

      await admin.end();
    }
  }
);
