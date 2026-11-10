import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildApp } from './app.js';
import { AuthStore, SESSION_LIFETIME_MS } from './auth.js';
import { canReviewDraft } from './policies.js';

function fixtures(now: () => number = Date.now) {
  return new AuthStore([
    { id: 'demo-alice', displayName: 'Alice Morgan', password: 'alice-pass' },
    { id: 'demo-bob', displayName: 'Bob Chen', password: 'bob-pass' }
  ], now);
}

function sessionCookie(header: string | string[] | undefined): string {
  assert.equal(typeof header, 'string');
  return header.split(';', 1)[0];
}

test('individual accounts receive sessions and only assigned policies', async () => {
  const auth = fixtures();
  const app = await buildApp({ auth });
  try {
    const alice = await app.inject({ method: 'POST', url: '/auth/sign-in', payload: { accountId: 'demo-alice', password: 'alice-pass' } });
    const bob = await app.inject({ method: 'POST', url: '/auth/sign-in', payload: { accountId: 'demo-bob', password: 'bob-pass' } });
    assert.equal(alice.statusCode, 200);
    assert.equal(bob.statusCode, 200);
    assert.equal(alice.json().expiresInSeconds, SESSION_LIFETIME_MS / 1000);
    assert.notEqual(sessionCookie(alice.headers['set-cookie']), sessionCookie(bob.headers['set-cookie']));
    assert.match(String(alice.headers['set-cookie']), /HttpOnly/);
    const alicePolicies = await app.inject({ method: 'GET', url: '/policies', headers: { cookie: sessionCookie(alice.headers['set-cookie']) } });
    const bobPolicies = await app.inject({ method: 'GET', url: '/policies', headers: { cookie: sessionCookie(bob.headers['set-cookie']) } });
    assert.deepEqual(alicePolicies.json().policies.map((p: { id: string }) => p.id), ['SYN-POL-1001', 'SYN-POL-1002']);
    assert.deepEqual(bobPolicies.json().policies.map((p: { id: string }) => p.id), ['SYN-POL-1001', 'SYN-POL-2001']);
    assert.deepEqual(auth.audit.map((event) => event.action), ['sign_in', 'sign_in', 'list_policies', 'list_policies']);
    assert.equal(JSON.stringify(auth.audit).includes('pass'), false);
  } finally { await app.close(); }
});

test('invalid credentials, absent and forged sessions reveal no protected data', async () => {
  const app = await buildApp({ auth: fixtures() });
  try {
    for (const accountId of ['demo-alice', 'unknown']) {
      const denied = await app.inject({ method: 'POST', url: '/auth/sign-in', payload: { accountId, password: 'wrong' } });
      assert.equal(denied.statusCode, 401);
      assert.deepEqual(denied.json(), { error: 'Invalid credentials' });
    }
    for (const headers of [{}, { cookie: 'pea_session=forged', 'x-user-id': 'demo-alice' }]) {
      const response = await app.inject({ method: 'GET', url: '/policies', headers });
      assert.equal(response.statusCode, 401);
      assert.deepEqual(response.json(), { error: 'Authentication required' });
    }
  } finally { await app.close(); }
});

test('session expiry and sign-out revoke access, including replay', async () => {
  let now = 1000;
  const auth = fixtures(() => now);
  const app = await buildApp({ auth });
  try {
    const signedIn = await app.inject({ method: 'POST', url: '/auth/sign-in', payload: { accountId: 'demo-alice', password: 'alice-pass' } });
    const cookie = sessionCookie(signedIn.headers['set-cookie']);
    now += SESSION_LIFETIME_MS;
    assert.equal((await app.inject({ method: 'GET', url: '/auth/me', headers: { cookie } })).statusCode, 401);
    const second = await app.inject({ method: 'POST', url: '/auth/sign-in', payload: { accountId: 'demo-alice', password: 'alice-pass' } });
    const secondCookie = sessionCookie(second.headers['set-cookie']);
    assert.equal((await app.inject({ method: 'POST', url: '/auth/sign-out', headers: { cookie: secondCookie } })).statusCode, 204);
    assert.equal((await app.inject({ method: 'GET', url: '/policies', headers: { cookie: secondCookie } })).statusCode, 401);
    assert.equal((await app.inject({ method: 'POST', url: '/auth/sign-out', headers: { cookie: secondCookie } })).statusCode, 204);
    assert.deepEqual(auth.audit.map((event) => event.action), ['sign_in', 'session_expired', 'sign_in', 'sign_out']);
  } finally { await app.close(); }
});

test('spoofed actor cannot cross policy assignment; unknown and unassigned share 404', async () => {
  const app = await buildApp({ auth: fixtures() });
  try {
    const signedIn = await app.inject({ method: 'POST', url: '/auth/sign-in', payload: { accountId: 'demo-alice', password: 'alice-pass' } });
    const cookie = sessionCookie(signedIn.headers['set-cookie']);
    const assigned = await app.inject({ method: 'GET', url: '/policies/SYN-POL-1001', headers: { cookie, 'x-user-id': 'demo-bob' } });
    assert.equal(assigned.statusCode, 200);
    const unassigned = await app.inject({ method: 'GET', url: '/policies/SYN-POL-2001', headers: { cookie, 'x-user-id': 'demo-bob' } });
    const unknown = await app.inject({ method: 'GET', url: '/policies/UNKNOWN', headers: { cookie } });
    assert.equal(unassigned.statusCode, 404);
    assert.equal(unknown.statusCode, 404);
    assert.equal(unassigned.body, unknown.body);
  } finally { await app.close(); }
});

test('review guard allows only a different assigned staff member without mutation', () => {
  const alice = { id: 'demo-alice', displayName: 'Alice Morgan' };
  const bob = { id: 'demo-bob', displayName: 'Bob Chen' };
  assert.equal(canReviewDraft(alice, 'SYN-POL-1001', 'demo-alice'), false);
  assert.equal(canReviewDraft(bob, 'SYN-POL-1001', 'demo-alice'), true);
  assert.equal(canReviewDraft(bob, 'SYN-POL-1002', 'demo-alice'), false);
  assert.equal(canReviewDraft(bob, 'UNKNOWN', 'demo-alice'), false);
});

test('OpenAPI includes cookie security and protected policy response', async () => {
  const app = await buildApp({ auth: fixtures() });
  try {
    const response = await app.inject({ method: 'GET', url: '/docs/json' });
    assert.equal(response.statusCode, 200);
    const document = response.json();
    assert.deepEqual(document.components.securitySchemes.staffSession, { type: 'apiKey', in: 'cookie', name: 'pea_session' });
    assert.deepEqual(document.paths['/policies'].get.security, [{ staffSession: [] }]);
    assert.ok(document.paths['/policies/{id}'].get.responses['404']);
  } finally { await app.close(); }
});
