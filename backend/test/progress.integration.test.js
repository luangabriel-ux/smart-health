import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { createPool } from '../src/database/connection/index.js';
import { migrate } from '../src/database/migrate.js';
import { createApp } from '../src/app.js';
import { registerModules } from '../src/modules/register-extra.js';

test(
  'Progresso - agregação, metas, autenticação e isolamento',
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

      // Usuário 1
      await call('/auth/register', 'POST', {
        name: 'Lucas',
        email: 'lucas.progress@example.com',
        password: 'password123'
      });

      const token1 = (
        await call('/auth/login', 'POST', {
          email: 'lucas.progress@example.com',
          password: 'password123'
        })
      ).body.data.accessToken;

      // Usuário 2
      await call('/auth/register', 'POST', {
        name: 'Luan',
        email: 'luan.progress@example.com',
        password: 'password123'
      });

      const token2 = (
        await call('/auth/login', 'POST', {
          email: 'luan.progress@example.com',
          password: 'password123'
        })
      ).body.data.accessToken;

      // Sem autenticação
      assert.equal(
        (
          await call(
            '/progress?from=2026-01-01&to=2026-01-02'
          )
        ).status,
        401
      );

      // 02:30 UTC ainda pertence ao dia 01 em São Paulo
      assert.equal(
        (
          await call(
            '/activities',
            'POST',
            {
              type: 'exercise',
              description: 'Corrida',
              occurredAt: '2026-01-02T02:30:00Z',
              durationMinutes: 30,
              steps: 4000,
              calories: 250
            },
            token1
          )
        ).status,
        201
      );

      // 03:30 UTC já pertence ao dia 02 em São Paulo
      assert.equal(
        (
          await call(
            '/activities',
            'POST',
            {
              type: 'exercise',
              description: 'Caminhada',
              occurredAt: '2026-01-02T03:30:00Z',
              durationMinutes: 20,
              steps: 2000,
              calories: 100
            },
            token1
          )
        ).status,
        201
      );

      // Água no dia 02
      assert.equal(
        (
          await call(
            '/activities',
            'POST',
            {
              type: 'water',
              description: 'Água',
              occurredAt: '2026-01-02T15:00:00Z',
              waterMl: 500
            },
            token1
          )
        ).status,
        201
      );

      const progress = await call(
        '/progress?from=2026-01-01&to=2026-01-02',
        'GET',
        undefined,
        token1
      );

      assert.equal(progress.status, 200);
      assert.equal(progress.body.data.length, 2);

      assert.deepEqual(progress.body.data[0], {
        date: '2026-01-01',
        waterMl: 0,
        steps: 4000,
        durationMinutes: 30,
        calories: 250
      });

      assert.deepEqual(progress.body.data[1], {
        date: '2026-01-02',
        waterMl: 500,
        steps: 2000,
        durationMinutes: 20,
        calories: 100
      });

      // Outro usuário não pode enxergar progresso
      const otherProgress = await call(
        '/progress?from=2026-01-01&to=2026-01-02',
        'GET',
        undefined,
        token2
      );

      assert.equal(otherProgress.status, 200);
      assert.deepEqual(otherProgress.body.data, []);

      // Validações de período
      assert.equal(
        (
          await call(
            '/progress?from=2026-01-05&to=2026-01-01',
            'GET',
            undefined,
            token1
          )
        ).status,
        400
      );

      assert.equal(
        (
          await call(
            '/progress?from=2026-02-30&to=2026-03-01',
            'GET',
            undefined,
            token1
          )
        ).status,
        400
      );

      assert.equal(
        (
          await call(
            '/progress?from=2025-01-01&to=2026-01-02',
            'GET',
            undefined,
            token1
          )
        ).status,
        400
      );

      // Sem metas inicialmente
      const initialGoals = await call(
        '/progress/goals',
        'GET',
        undefined,
        token1
      );

      assert.equal(initialGoals.status, 200);
      assert.equal(initialGoals.body.data, null);

      // Criar metas
      const goals = await call(
        '/progress/goals',
        'PUT',
        {
          steps: 10000,
          waterMl: 2000,
          durationMinutes: 60,
          calories: 500
        },
        token1
      );

      assert.equal(goals.status, 200);
      assert.equal(goals.body.data.steps, 10000);
      assert.equal(goals.body.data.waterMl, 2000);

      // Persistência
      const persisted = await pool.query(
        `SELECT *
         FROM progress_goals`
      );

      assert.equal(persisted.rowCount, 1);

      // Conta 2 continua sem metas
      const otherGoals = await call(
        '/progress/goals',
        'GET',
        undefined,
        token2
      );

      assert.equal(otherGoals.status, 200);
      assert.equal(otherGoals.body.data, null);

      // Meta inválida
      assert.equal(
        (
          await call(
            '/progress/goals',
            'PUT',
            { steps: -100 },
            token1
          )
        ).status,
        400
      );

      // Atualização/substituição das metas
      const replaced = await call(
        '/progress/goals',
        'PUT',
        {
          steps: 12000,
          waterMl: 2500
        },
        token1
      );

      assert.equal(replaced.status, 200);
      assert.equal(replaced.body.data.steps, 12000);
      assert.equal(replaced.body.data.waterMl, 2500);
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
