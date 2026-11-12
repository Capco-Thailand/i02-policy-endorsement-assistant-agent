import { afterEach, describe, expect, it } from 'vitest';
import { AuthStore, SESSION_LIFETIME_SECONDS } from './store.js';
import { buildApp } from '../app.js';

describe('FR-01 AC1/AC2: customer sign-in and server session', () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  function cookieHeader(value: string | string[] | undefined): string {
    const header = Array.isArray(value) ? value[0] : value;
    return header?.split(';')[0] ?? '';
  }

  it('allows credentialed sign-in from both documented localhost origins', async () => {
    app = await buildApp();

    for (const origin of ['http://localhost:3001', 'http://127.0.0.1:3001']) {
      const preflight = await app.inject({
        method: 'OPTIONS',
        url: '/auth/sign-in',
        headers: {
          origin,
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type',
        },
      });

      expect(preflight.statusCode).toBe(204);
      expect(preflight.headers['access-control-allow-origin']).toBe(origin);
      expect(preflight.headers['access-control-allow-credentials']).toBe(
        'true',
      );
    }
  });

  it('accepts a seeded customer and validates the returned session on /auth/me', async () => {
    app = await buildApp();

    const signIn = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: { accountId: 'demo-alice', password: 'alice-demo-password' },
    });

    expect(signIn.statusCode).toBe(200);
    expect(signIn.json()).toMatchObject({
      customer: { id: 'demo-alice', displayName: 'Alice Morgan' },
      expiresInSeconds: 1800,
    });
    const cookie = signIn.headers['set-cookie'];
    expect(cookie).toMatch(/pea_session=[A-Za-z0-9_-]+/);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');

    const session = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { cookie: cookieHeader(cookie) },
    });

    expect(session.statusCode).toBe(200);
    expect(session.json()).toEqual({
      customer: { id: 'demo-alice', displayName: 'Alice Morgan' },
    });

    const bob = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: { accountId: 'demo-bob', password: 'bob-demo-password' },
    });
    expect(bob.statusCode).toBe(200);
    expect(bob.json().customer).toEqual({
      id: 'demo-bob',
      displayName: 'Bob Chen',
    });
    expect(cookieHeader(bob.headers['set-cookie'])).not.toEqual(
      cookieHeader(cookie),
    );
  });

  it('rejects bad credentials generically and revokes a session on sign-out', async () => {
    app = await buildApp();

    const invalidAttempts = await Promise.all(
      [
        { accountId: 'unknown-account', password: 'wrong-password' },
        { accountId: 'demo-alice', password: 'wrong-password' },
      ].map((payload) =>
        app?.inject({ method: 'POST', url: '/auth/sign-in', payload }),
      ),
    );
    expect(invalidAttempts.map((response) => response?.statusCode)).toEqual([
      401, 401,
    ]);
    expect(invalidAttempts[0]?.body).toBe(invalidAttempts[1]?.body);
    expect(invalidAttempts[0]?.headers['set-cookie']).toBeUndefined();

    const signIn = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: { accountId: 'demo-alice', password: 'alice-demo-password' },
    });
    const cookie = cookieHeader(signIn.headers['set-cookie']);
    const signOut = await app.inject({
      method: 'POST',
      url: '/auth/sign-out',
      headers: { cookie },
    });
    expect(signOut.statusCode).toBe(204);
    expect(signOut.headers['set-cookie']).toContain('Max-Age=0');

    const replay = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { cookie },
    });
    expect(replay.statusCode).toBe(401);
    expect(replay.json()).toEqual({ error: 'Authentication required' });
  });

  it('FR-01 AC2: rejects expired and forged sessions and keeps expiry audit data sanitized', async () => {
    let now = 10_000;
    const auth = new AuthStore(() => now);
    app = await buildApp({ auth, now: () => now });
    const signIn = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: { accountId: 'demo-alice', password: 'alice-demo-password' },
    });
    const cookie = cookieHeader(signIn.headers['set-cookie']);

    now += SESSION_LIFETIME_SECONDS * 1000;
    const expired = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { cookie },
    });
    const forged = await app.inject({
      method: 'GET',
      url: '/policies',
      headers: { cookie: 'pea_session=forged', 'x-customer-id': 'demo-alice' },
    });

    expect(expired.statusCode).toBe(401);
    expect(expired.json()).toEqual({ error: 'Authentication required' });
    expect(forged.statusCode).toBe(401);
    expect(forged.json()).toEqual({ error: 'Authentication required' });
    expect(auth.audit.map((event) => event.action)).toEqual([
      'sign_in',
      'session_expired',
    ]);
    expect(JSON.stringify(auth.audit)).not.toContain('alice-demo-password');
    expect(JSON.stringify(auth.audit)).not.toContain(
      cookie.slice('pea_session='.length),
    );
  });

  it('FR-01 AC6: publishes health, session, and ownership contracts in OpenAPI', async () => {
    app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/docs/json' });
    const document = response.json();

    expect(response.statusCode).toBe(200);
    expect(document.components.securitySchemes.customerSession).toEqual({
      type: 'apiKey',
      in: 'cookie',
      name: 'pea_session',
    });
    expect(document.paths['/health'].get.responses['200']).toBeDefined();
    expect(document.paths['/auth/sign-in'].post.responses['401']).toBeDefined();
    expect(
      document.paths['/auth/sign-out'].post.responses['204'],
    ).toBeDefined();
    expect(document.paths['/auth/me'].get.security).toEqual([
      { customerSession: [] },
    ]);
    expect(document.paths['/policies/{id}'].get.responses['404']).toBeDefined();
  });
});
