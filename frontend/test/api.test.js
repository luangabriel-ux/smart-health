import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi, ApiError } from '../src/services/api.ts';

test('cliente envia JSON e Bearer somente nas rotas autenticadas', async () => {
  const calls = [];
  const api = createApi({ getToken: () => 'session', fetcher: async (path, options) => {
    calls.push({ path, ...options });
    return Response.json({ data: {} });
  } });
  await api.login({ email: 'ana@example.com', password: 'password123' });
  await api.updateProfile({ name: 'Ana', age: null });
  await api.listActivities(20, 40);
  assert.equal(calls[0].headers.Authorization, undefined);
  assert.equal(calls[1].headers.Authorization, 'Bearer session');
  assert.equal(calls[1].method, 'PATCH');
  assert.deepEqual(JSON.parse(calls[1].body), { name: 'Ana', age: null });
  assert.equal(calls[2].path, '/api/activities?limit=20&offset=40');
});

test('204 de logout e exclusão não tenta ler JSON', async () => {
  const api = createApi({ fetcher: async () => new Response(null, { status: 204 }) });
  assert.equal(await api.logout(), undefined);
  assert.equal(await api.removeActivity('activity'), undefined);
});

test('401 protegido encerra sessão; credenciais inválidas não encerram sessão', async () => {
  let expired = 0;
  const api = createApi({ onUnauthorized: () => expired++, fetcher: async () =>
    Response.json({ error: { code: 'UNAUTHENTICATED', message: 'Sessão expirada.' } }, { status: 401 }) });
  await assert.rejects(api.me(), error => error instanceof ApiError && error.status === 401);
  assert.equal(expired, 1);
  await assert.rejects(api.login({ email: 'ana@example.com', password: 'invalid123' }));
  assert.equal(expired, 1);
});

test('falhas de rede, validação e respostas inválidas têm erros utilizáveis', async () => {
  const network = createApi({ fetcher: async () => { throw new TypeError('fetch failed'); } });
  await assert.rejects(network.me(), error => error.code === 'NETWORK_ERROR');
  const validation = createApi({ fetcher: async () => Response.json({ error: { code: 'VALIDATION_ERROR', message: 'Data inválida.' } }, { status: 400 }) });
  await assert.rejects(validation.createActivity({}), error => error.message === 'Data inválida.');
  const invalid = createApi({ fetcher: async () => new Response('<html>') });
  await assert.rejects(invalid.me(), error => error.code === 'INVALID_RESPONSE');
});

test('resposta atrasada de sessão anterior não encerra um novo login', async () => {
  let token = 'old-session', expired = 0, complete;
  const api = createApi({ getToken: () => token, onUnauthorized: () => expired++,
    fetcher: () => new Promise(resolve => { complete = resolve; }) });
  const pending = api.me();
  token = 'new-session';
  complete(Response.json({ error: { code: 'UNAUTHENTICATED', message: 'Sessão expirada.' } }, { status: 401 }));
  await assert.rejects(pending);
  assert.equal(expired, 0);
});

test('filtros opcionais ausentes não são enviados como texto undefined', async () => {
  let path;
  const api=createApi({fetcher:async value=>{path=value;return Response.json({data:[]});}});
  await api.listContent({type:'video',category:undefined,search:undefined});
  const query=new URL(path,'http://localhost').searchParams;
  assert.equal(query.get('type'),'video');
  assert.equal(query.has('category'),false);
  assert.equal(query.has('search'),false);
  await api.listActivities(21,20,'water');
  assert.equal(new URL(path,'http://localhost').searchParams.get('type'),'water');
});
