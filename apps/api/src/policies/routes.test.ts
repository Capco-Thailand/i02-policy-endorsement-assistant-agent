import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildApp } from '../app.js';

const alice = { authorization: 'Bearer demo-alice' };

test('policy list requires a demo session and only returns owned summaries', async () => {
  const app = await buildApp();
  try {
    assert.equal((await app.inject('/policies')).statusCode, 401);
    const own = await app.inject({ url: '/policies', headers: alice });
    assert.equal(own.statusCode, 200);
    assert.deepEqual(own.json().map((p: { policy_id: string }) => p.policy_id), ['SYN-POL-1001', 'SYN-POL-1002']);
    assert.equal('beneficiaries' in own.json()[0], false);
    const empty = await app.inject({ url: '/policies', headers: { authorization: 'Bearer demo-empty' } });
    assert.deepEqual(empty.json(), []);
  } finally { await app.close(); }
});

test('policy detail returns required fields only to its owner', async () => {
  const app = await buildApp();
  try {
    const response = await app.inject({ url: '/policies/SYN-POL-1001', headers: alice });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().policy_status, 'ACTIVE');
    assert.equal(response.json().sum_assured, '1000000.00');
    assert.equal(response.json().beneficiaries[0].allocation_percentage, 100);
    const foreign = await app.inject({ url: '/policies/SYN-POL-2001', headers: alice });
    assert.equal(foreign.statusCode, 404);
    assert.deepEqual(foreign.json(), { error: 'Not Found' });
    assert.equal((await app.inject('/policies/SYN-POL-1001')).statusCode, 401);
  } finally { await app.close(); }
});

test('initiation checks stored status and never creates a draft', async () => {
  const app = await buildApp();
  try {
    const active = await app.inject({ method: 'POST', url: '/policies/SYN-POL-1001/endorsements/initiate', headers: alice });
    assert.equal(active.statusCode, 204);
    assert.equal(active.body, '');
    const expired = await app.inject({ method: 'POST', url: '/policies/SYN-POL-1002/endorsements/initiate', headers: alice });
    assert.equal(expired.statusCode, 409);
    assert.deepEqual(expired.json(), { error: 'Policy is not eligible' });
    const foreign = await app.inject({ method: 'POST', url: '/policies/SYN-POL-2001/endorsements/initiate', headers: alice });
    assert.equal(foreign.statusCode, 404);
  } finally { await app.close(); }
});

test('OpenAPI includes policy routes and error contracts', async () => {
  const app = await buildApp();
  try {
    const response = await app.inject('/docs/json');
    const paths = response.json().paths;
    assert.ok(paths['/policies']);
    assert.ok(paths['/policies/{policyId}']);
    assert.ok(paths['/policies/{policyId}/endorsements/initiate']);
    assert.ok(paths['/policies'].get.responses['401']);
    assert.ok(paths['/policies/{policyId}/endorsements/initiate'].post.responses['409']);
  } finally { await app.close(); }
});
