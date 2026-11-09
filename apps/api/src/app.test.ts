import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildApp } from './app.js';

test('health route and OpenAPI document are available', async () => {
  const app = await buildApp();
  try {
    const health = await app.inject('/health');
    assert.equal(health.statusCode, 200);
    assert.deepEqual(health.json(), { status: 'ok' });

    const docs = await app.inject('/docs/json');
    assert.equal(docs.statusCode, 200);
    assert.ok(docs.json().paths['/health']);

    const missing = await app.inject('/missing');
    assert.equal(missing.statusCode, 404);
    assert.deepEqual(missing.json(), { error: 'Not Found' });
  } finally {
    await app.close();
  }
});
