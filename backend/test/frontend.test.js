import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { createApp } from '../src/app.js';

test('servidor entrega frontend e preserva respostas e autenticação da API', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'smart-health-frontend-'));
  let server;
  try {
    await writeFile(join(directory, 'index.html'), '<!doctype html><title>Smart Health</title>');
    server = createApp({ pool: {}, frontendDirectory: directory }).listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const page = await fetch(base);
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type'), /text\/html/);
    assert.match(await page.text(), /Smart Health/);
    assert.equal((await fetch(`${base}/api/users/me`)).status, 401);
    for (const path of ['/reminders', '/progress', '/content', '/recommendations']) {
      assert.equal((await fetch(`${base}/api${path}`)).status, 401);
    }
    const missing = await fetch(`${base}/api/missing`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, 'NOT_FOUND');
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  }
});
