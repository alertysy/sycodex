import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebServer } from '../apps/web/server.js';

test('web server /api/flow returns JSON state', async () => {
  const server = createWebServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/api/flow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symptoms: ['cough'],
      session: { rawUserInput: '轻微咳嗽' },
    }),
  });

  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data.state);
  assert.ok(Array.isArray(data.events));

  await new Promise((resolve) => server.close(resolve));
});
