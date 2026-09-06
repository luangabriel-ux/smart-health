import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createPool } from '../src/database/connection/index.js';
import { migrate } from '../src/database/migrate.js';
import { createApp } from '../src/app.js';
test('PostgreSQL e HTTP: sessão, perfil, persistência e isolamento', {skip:!process.env.TEST_DATABASE_URL}, async () => {
  const admin=createPool(process.env.TEST_DATABASE_URL);
  const schema=`test_${randomUUID().replaceAll('-','')}`;
  await admin.query(`CREATE SCHEMA ${schema}`);
  const url=new URL(process.env.TEST_DATABASE_URL); url.searchParams.set('options',`-c search_path=${schema}`);
  const pool=createPool(url.toString()); let server;
  try {
    await migrate(pool); await migrate(pool);
    server=createApp({pool}).listen(0,'127.0.0.1');
    await new Promise(resolve=>server.once('listening',resolve));
    async function call(path,method='GET',body,token) {
      const r=await fetch(`http://127.0.0.1:${server.address().port}/api${path}`,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
      return {status:r.status,body:r.status===204?null:await r.json()};
    }
    const user={name:'Ana',email:'ANA@example.com',password:'password123'};
    const reg=await call('/auth/register','POST',user); assert.equal(reg.status,201);
    assert.equal(JSON.stringify(reg.body).includes('password'),false);
    assert.equal((await call('/auth/register','POST',{...user,email:'ana@example.com'})).status,409);
    const credentials={email:user.email,password:user.password};
    assert.equal((await call('/auth/login','POST',{...credentials,password:'wrongpass'})).status,401);
    const token=(await call('/auth/login','POST',credentials)).body.data.accessToken;
    assert.equal((await call('/users/me')).status,401);
    assert.equal((await call('/users/me','PATCH',{age:25,weightKg:70.5},token)).body.data.weightKg,70.5);
    assert.equal((await call('/users/me','PATCH',{plan:'premium'},token)).status,400);
    const input={type:'water',description:'Água',occurredAt:'2026-01-01T00:00:00Z',waterMl:250};
    const created=await call('/activities','POST',input,token); assert.equal(created.status,201);
    const id=created.body.data.id;
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM activities')).rows[0].n,1);
    assert.equal((await call('/activities','GET',undefined,token)).body.data.length,1);
    await call('/auth/register','POST',{...user,email:'other@example.com'});
    const other=(await call('/auth/login','POST',{...credentials,email:'other@example.com'})).body.data.accessToken;
    assert.equal((await call(`/activities/${id}`,'GET',undefined,other)).status,404);
    assert.equal((await call(`/activities/${id}`,'DELETE',undefined,other)).status,404);
    assert.deepEqual((await call('/activities','GET',undefined,other)).body.data,[]);
    assert.equal((await call('/activities','POST',{...input,userId:reg.body.data.id},other)).status,400);
    assert.equal((await call(`/activities/${id}`,'DELETE',undefined,token)).status,204);
    assert.equal((await call('/auth/logout','POST',undefined,token)).status,204);
    assert.equal((await call('/users/me','GET',undefined,token)).status,401);
    await pool.query("UPDATE sessions SET expires_at=now()-interval '1 second'");
    assert.equal((await call('/users/me','GET',undefined,other)).status,401);
  } finally {
    if(server) await new Promise(resolve=>server.close(resolve));
    await pool.end(); await admin.query(`DROP SCHEMA ${schema} CASCADE`); await admin.end();
  }
});
