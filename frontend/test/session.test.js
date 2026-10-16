import test from 'node:test';
import assert from 'node:assert/strict';
import { readSession, writeSession } from '../src/services/session.ts';
const storage = () => {
  let value = null;
  return { getItem: () => value, setItem: (_, next) => { value = next; }, removeItem: () => { value = null; } };
};
test('sessão restaura token válido e não armazena perfil ou senha', () => {
  const store = storage();
  const input = { accessToken: 'token', expiresAt: new Date(Date.now() + 60000).toISOString(), password: 'secret', user: { name: 'Ana' } };
  writeSession(store, input);
  assert.deepEqual(readSession(store), { accessToken: input.accessToken, expiresAt: input.expiresAt });
  assert.equal(store.getItem().includes('secret'), false);
  writeSession(store, null);
  assert.equal(readSession(store), null);
});
test('sessões expiradas ou corrompidas são descartadas', () => {
  const store = storage();
  for (const value of ['bad json', '{}', '{"accessToken":"token","expiresAt":"2000-01-01"}']) {
    store.setItem('', value);
    assert.equal(readSession(store), null);
  }
});
test('armazenamento bloqueado não impede utilização em memória', () => {
  const store = { getItem() { throw new Error(); }, setItem() { throw new Error(); }, removeItem() { throw new Error(); } };
  assert.equal(readSession(store), null);
  assert.doesNotThrow(() => writeSession(store, { accessToken: 'token', expiresAt: '2099-01-01' }));
});
