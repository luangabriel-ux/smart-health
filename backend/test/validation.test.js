import test from 'node:test';
import assert from 'node:assert/strict';
import { credentials, profile } from '../src/modules/users/validators/index.js';
import { activity } from '../src/modules/activities/validators/index.js';
import { hashPassword, verifyPassword } from '../src/modules/users/services/index.js';
test('cadastro normaliza email e rejeita dados inválidos e promoção de plano', () => {
  assert.equal(credentials({name:'Ana',email:' ANA@EXAMPLE.COM ',password:'password123'},true).email,'ana@example.com');
  assert.throws(() => credentials({},true));
  assert.throws(() => profile({plan:'premium'}));
  assert.throws(() => profile({age:2.5}));
  assert.throws(() => profile({weightKg:-1}));
});
test('atividade rejeita identidade externa, métricas incompatíveis e datas inválidas', () => {
  const input={type:'water',description:'Água',occurredAt:'2026-01-01T10:00:00Z',waterMl:250};
  assert.equal(activity(input).waterMl,250);
  for(const extra of [{userId:'other'},{waterMl:-1},{steps:3},{occurredAt:'2026-02-30T10:00:00Z'},{occurredAt:'2099-01-01T00:00:00Z'}]) assert.throws(() => activity({...input,...extra}));
});
test('hash de senha tem salt aleatório e verifica credenciais', async () => {
  const hash=await hashPassword('password123');
  assert.notEqual(hash,await hashPassword('password123'));
  assert.equal(await verifyPassword('password123',hash),true);
  assert.equal(await verifyPassword('wrong',hash),false);
});
