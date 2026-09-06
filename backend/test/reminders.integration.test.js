import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { createPool } from '../src/database/connection/index.js';
import { migrate } from '../src/database/migrate.js';
import { createApp } from '../src/app.js';
import { registerModules } from '../src/modules/register-extra.js';

test(
  'Lembretes - CRUD, persistência, autenticação e isolamento',
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    const admin = createPool(process.env.TEST_DATABASE_URL);

    const schema = `test_${randomUUID().replaceAll('-', '')}`;

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
      const user1 = {
        name: 'Lucas',
        email: 'lucas@example.com',
        password: 'password123'
      };

      assert.equal(
        (await call('/auth/register', 'POST', user1))
          .status,
        201
      );

      const token1 = (
        await call('/auth/login', 'POST', {
          email: user1.email,
          password: user1.password
        })
      ).body.data.accessToken;

      // Usuário 2
      const user2 = {
        name: 'Luan',
        email: 'luan@example.com',
        password: 'password123'
      };

      assert.equal(
        (await call('/auth/register', 'POST', user2))
          .status,
        201
      );

      const token2 = (
        await call('/auth/login', 'POST', {
          email: user2.email,
          password: user2.password
        })
      ).body.data.accessToken;

      // Sem autenticação deve bloquear
      assert.equal(
        (await call('/reminders')).status,
        401
      );

      // Criar lembrete
      const input = {
        title: 'Beber água',
        time: '10:30',
        weekdays: [1, 2, 3, 4, 5],
        timezone: 'America/Sao_Paulo',
        active: true
      };

      const created = await call(
        '/reminders',
        'POST',
        input,
        token1
      );

      assert.equal(created.status, 201);
      assert.equal(
        created.body.data.title,
        'Beber água'
      );
      assert.equal(
        created.body.data.time,
        '10:30'
      );

      const reminderId = created.body.data.id;

      // Confirma persistência no PostgreSQL
      const persisted = await pool.query(
        `SELECT *
         FROM reminders
         WHERE id=$1`,
        [reminderId]
      );

      assert.equal(persisted.rowCount, 1);

      // Usuário 1 deve listar seu lembrete
      const list1 = await call(
        '/reminders',
        'GET',
        undefined,
        token1
      );

      assert.equal(list1.status, 200);
      assert.equal(list1.body.data.length, 1);

      // Usuário 2 não deve enxergar dados do usuário 1
      const list2 = await call(
        '/reminders',
        'GET',
        undefined,
        token2
      );

      assert.equal(list2.status, 200);
      assert.deepEqual(list2.body.data, []);

      // Usuário 2 não pode alterar lembrete do usuário 1
      assert.equal(
        (
          await call(
            `/reminders/${reminderId}`,
            'PATCH',
            { title: 'Tentativa indevida' },
            token2
          )
        ).status,
        404
      );

      // Usuário 2 não pode excluir lembrete do usuário 1
      assert.equal(
        (
          await call(
            `/reminders/${reminderId}`,
            'DELETE',
            undefined,
            token2
          )
        ).status,
        404
      );

      // Valida userId vindo do cliente
      assert.equal(
        (
          await call(
            '/reminders',
            'POST',
            {
              ...input,
              userId: randomUUID()
            },
            token1
          )
        ).status,
        400
      );

      // Dias repetidos devem ser rejeitados
      assert.equal(
        (
          await call(
            '/reminders',
            'POST',
            {
              ...input,
              weekdays: [1, 1, 2]
            },
            token1
          )
        ).status,
        400
      );

      // Horário inválido deve ser rejeitado
      assert.equal(
        (
          await call(
            '/reminders',
            'POST',
            {
              ...input,
              time: '30:80'
            },
            token1
          )
        ).status,
        400
      );

      // Atualização pelo proprietário
      const updated = await call(
        `/reminders/${reminderId}`,
        'PATCH',
        {
          title: 'Beber água atualizado',
          active: false
        },
        token1
      );

      assert.equal(updated.status, 200);
      assert.equal(
        updated.body.data.title,
        'Beber água atualizado'
      );
      assert.equal(
        updated.body.data.active,
        false
      );

      // Exclusão pelo proprietário
      assert.equal(
        (
          await call(
            `/reminders/${reminderId}`,
            'DELETE',
            undefined,
            token1
          )
        ).status,
        204
      );

      // Confirma remoção no PostgreSQL
      const afterDelete = await pool.query(
        `SELECT *
         FROM reminders
         WHERE id=$1`,
        [reminderId]
      );

      assert.equal(afterDelete.rowCount, 0);
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
