import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { createPool } from '../src/database/connection/index.js';
import { migrate } from '../src/database/migrate.js';
import { createApp } from '../src/app.js';
import { registerModules } from '../src/modules/register-extra.js';

test(
  'Recomendações - perfil, regras determinísticas e isolamento',
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
          body: await response.json()
        };
      }

      const email1 =
        'recommendations.user1@example.com';

      const email2 =
        'recommendations.user2@example.com';

      // Usuário 1
      assert.equal(
        (
          await call('/auth/register', 'POST', {
            name: 'Lucas',
            email: email1,
            password: 'password123'
          })
        ).status,
        201
      );

      const token1 = (
        await call('/auth/login', 'POST', {
          email: email1,
          password: 'password123'
        })
      ).body.data.accessToken;

      // Usuário 2
      assert.equal(
        (
          await call('/auth/register', 'POST', {
            name: 'Luan',
            email: email2,
            password: 'password123'
          })
        ).status,
        201
      );

      const token2 = (
        await call('/auth/login', 'POST', {
          email: email2,
          password: 'password123'
        })
      ).body.data.accessToken;

      // Sem autenticação
      assert.equal(
        (await call('/recommendations')).status,
        401
      );

      // Perfil ainda incompleto
      const incomplete = await call(
        '/recommendations',
        'GET',
        undefined,
        token1
      );

      assert.equal(incomplete.status, 200);

      assert.equal(
        incomplete.body.data.status,
        'profile_incomplete'
      );

      assert.deepEqual(
        incomplete.body.data.recommendations,
        []
      );

      assert.ok(
        incomplete.body.data.missingFields.length > 0
      );

      // Completa o perfil do usuário 1
      await pool.query(
        `UPDATE users
         SET
           age = $1,
           weight_kg = $2,
           height_cm = $3,
           health_goals = $4,
           medical_conditions = $5
         WHERE email = $6`,
        [
          24,
          78,
          178,
          'Melhorar hidratação e atividade física',
          'Condição informada apenas para teste',
          email1
        ]
      );

      const result = await call(
        '/recommendations',
        'GET',
        undefined,
        token1
      );

      assert.equal(result.status, 200);
      assert.equal(result.body.data.status, 'ready');

      assert.equal(
        result.body.data.profileBasis.age,
        24
      );

      assert.equal(
        result.body.data.profileBasis.weightKg,
        78
      );

      assert.equal(
        result.body.data.profileBasis.heightCm,
        178
      );

      const codes =
        result.body.data.recommendations.map(
          (item) => item.code
        );

      // Regras derivadas dos objetivos informados
      assert.ok(
        codes.includes('HYDRATION_TRACKING')
      );

      assert.ok(
        codes.includes('ACTIVITY_TRACKING')
      );

      // Cada recomendação explica sua base
      for (
        const recommendation
        of result.body.data.recommendations
      ) {
        assert.ok(recommendation.code);
        assert.ok(recommendation.title);
        assert.ok(recommendation.message);

        assert.ok(
          Array.isArray(recommendation.basedOn)
        );

        assert.ok(
          recommendation.basedOn.length > 0
        );
      }

      // Condição médica não gera prescrição
      assert.ok(result.body.data.medicalNotice);

      assert.match(
        result.body.data.medicalNotice,
        /não gera prescrição clínica|não gera prescricao clinica/i
      );

      // Usuário 2 continua com seu próprio perfil incompleto
      const otherUser = await call(
        '/recommendations',
        'GET',
        undefined,
        token2
      );

      assert.equal(otherUser.status, 200);

      assert.equal(
        otherUser.body.data.status,
        'profile_incomplete'
      );

      assert.deepEqual(
        otherUser.body.data.recommendations,
        []
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
