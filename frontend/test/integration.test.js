import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { createApi } from '../src/services/api.ts';
import { createPool } from '../../backend/src/database/connection/index.js';
import { migrate } from '../../backend/src/database/migrate.js';
import { createApp } from '../../backend/src/app.js';

test('cliente frontend → proxy Vite → API → PostgreSQL', { skip: !process.env.TEST_DATABASE_URL }, async () => {
  const admin = createPool(process.env.TEST_DATABASE_URL);
  const schema = `test_${randomUUID().replaceAll('-', '')}`;
  let pool, server, vite;
  try {
    await admin.query(`CREATE SCHEMA ${schema}`);
    const url = new URL(process.env.TEST_DATABASE_URL);
    url.searchParams.set('options', `-c search_path=${schema}`);
    pool = createPool(url.toString());
    await migrate(pool);
    server = createApp({ pool }).listen(0, '127.0.0.1');
    await once(server, 'listening');
    vite = await createServer({
      root: fileURLToPath(new URL('../', import.meta.url)),
      configFile: fileURLToPath(new URL('../vite.config.js', import.meta.url)),
      server: { host: '127.0.0.1', port: 0, proxy: { '/api': { target: `http://127.0.0.1:${server.address().port}` } } },
      logLevel: 'silent'
    });
    await vite.listen();
    const origin = `http://127.0.0.1:${vite.httpServer.address().port}`;
    assert.match(await (await fetch(origin)).text(), /\/src\/app\/main.tsx/);
    let token = null, expired = 0;
    const fetcher = (path, options) => fetch(new URL(path, origin), options);
    const api = createApi({ getToken: () => token, onUnauthorized: () => { expired++; token = null; }, fetcher });
    const input = { name: 'Ana', email: 'ana@example.com', password: 'password123' };
    const user = (await api.register(input)).data;
    assert.equal(user.plan, 'free');
    await assert.rejects(api.register(input), error => error.status === 409);
    token = (await api.login({ email: input.email, password: input.password })).data.accessToken;
    assert.equal((await api.me()).data.id, user.id);
    const profile = { name: 'Ana Silva', age: 25, weightKg: 70.5, heightCm: 165, healthGoals: 'Manter rotina', medicalConditions: null };
    assert.equal((await api.updateProfile(profile)).data.weightKg, 70.5);
    assert.equal((await api.me()).data.name, 'Ana Silva');
    assert.equal((await api.updateProfile({ ...profile, age: null, weightKg: null, heightCm: null, healthGoals: null })).data.age, null);
    assert.equal((await api.recommendations()).data.status, 'profile_incomplete');
    await api.updateProfile({ ...profile, healthGoals: 'Acompanhar hidratação' });
    assert.equal((await api.recommendations()).data.recommendations.some(item => item.code === 'HYDRATION_TRACKING'), true);
    const activity = { type: 'water', description: 'Água', waterMl: 250, occurredAt: '2026-01-01T10:00:00-03:00' };
    const created = (await api.createActivity(activity)).data;
    assert.equal((await api.getActivity(created.id)).data.waterMl, 250);
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM activities')).rows[0].n, 1);
    await assert.rejects(api.createActivity({ ...activity, steps: 1 }), error => error.status === 400);
    for (let day = 2; day <= 22; day++) await api.createActivity({ type: 'habit', description: `Registro ${day}`, occurredAt: `2026-01-${String(day).padStart(2, '0')}T13:00:00Z` });
    const first = await api.listActivities(21, 0), second = await api.listActivities(21, 20);
    assert.equal(first.data.length, 21);
    assert.equal(second.data.length, 2);
    assert.equal(first.data.slice(0, 20).some(item => second.data.some(other => item.id === other.id)), false);
    const other = createApi({ fetcher });
    await other.register({ ...input, email: 'other@example.com' });
    const otherToken = (await other.login({ email: 'other@example.com', password: input.password })).data.accessToken;
    const otherApi = createApi({ getToken: () => otherToken, fetcher });
    const reminder = (await api.createReminder({ title: 'Beber água', time: '09:00', weekdays: [1, 3, 5], timezone: 'America/Sao_Paulo', active: true })).data;
    assert.equal((await api.listReminders()).data[0].id, reminder.id);
    assert.equal((await api.updateReminder(reminder.id, { active: false })).data.active, false);
    await assert.rejects(otherApi.updateReminder(reminder.id, { title: 'Outro titular' }), error => error.status === 404);
    assert.deepEqual((await otherApi.listReminders()).data, []);
    await api.removeReminder(reminder.id);
    assert.deepEqual((await api.listReminders()).data, []);
    const progress = (await api.progress('2026-01-01', '2026-01-22')).data;
    assert.equal(progress[0].waterMl, 250);
    assert.deepEqual((await otherApi.progress('2026-01-01', '2026-01-22')).data, []);
    assert.equal((await api.getGoals()).data, null);
    await api.saveGoals({ waterMl: 1500, steps: 4000 });
    assert.equal((await api.getGoals()).data.waterMl, 1500);
    assert.equal((await api.saveGoals({ waterMl: 1000 })).data.steps, null);
    assert.equal((await otherApi.getGoals()).data, null);
    const articleId = randomUUID(), premiumId = randomUUID();
    await pool.query(`INSERT INTO contents(id,title,category,type,text_content,is_premium) VALUES ($1,'Material de teste','demo','article','Texto de demonstração',false), ($2,'Material Premium','demo','article','Texto restrito',true)`, [articleId, premiumId]);
    assert.equal((await api.listContent({ category: 'demo', type: 'article' })).data.length, 2);
    assert.equal((await api.getContent(articleId)).data.textContent, 'Texto de demonstração');
    const premium = (await api.getContent(premiumId)).data;
    assert.equal(premium.locked, true);
    assert.equal(premium.textContent, null);
    assert.equal(premium.url, null);
    assert.deepEqual((await otherApi.listActivities()).data, []);
    await assert.rejects(otherApi.getActivity(created.id), error => error.status === 404);
    await assert.rejects(otherApi.removeActivity(created.id), error => error.status === 404);
    await api.removeActivity(created.id);
    await assert.rejects(api.getActivity(created.id), error => error.status === 404);
    await api.logout();
    await assert.rejects(api.me(), error => error.status === 401);
    assert.equal(expired, 1);
    assert.equal(token, null);
  } finally {
    if (vite) await vite.close();
    if (server) await new Promise(resolve => server.close(resolve));
    if (pool) await pool.end();
    try { await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`); }
    finally { await admin.end(); }
  }
});
