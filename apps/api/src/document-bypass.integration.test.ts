import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { buildApp } from './app.js';
import { database } from './db.js';

const url = process.env.TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;

integration('FR-07 document bypass', () => {
  const db = database(url ?? 'postgresql://localhost/unused');
  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    await db.migrate();
    await db.seed();
  });
  afterAll(async () => db.close());

  it('records the mock result only for the signed-in owner of an active policy', async () => {
    const app = await buildApp();
    try {
      const signIn = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: { accountId: 'narin', password: 'NarinDemo123!' },
      });
      expect(signIn.statusCode).toBe(200);
      const cookie = signIn.headers['set-cookie'];
      const route = '/api/policies/POL-NARIN-001/document-bypass';
      const created = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-NARIN-001/requests',
        headers: { cookie },
        payload: {
          changeType: 'ADDRESS',
          requestedEffectiveDate: '2027-01-01',
          correspondenceAddress: '100 Demo Road',
        },
      });
      expect(created.statusCode).toBe(200);
      const payload = { requestId: created.json().request.id };
      expect(
        (await app.inject({ method: 'POST', url: route, payload })).statusCode,
      ).toBe(401);
      const before = await db.pool.query(
        "SELECT count(*)::int AS count FROM audit_events WHERE action='document-bypass'",
      );
      const ok = await app.inject({
        method: 'POST',
        url: route,
        headers: { cookie },
        payload,
      });
      expect(ok.statusCode).toBe(200);
      expect(ok.json()).toMatchObject({ status: 'BYPASSED_MOCK' });
      expect(ok.json().explanation).toMatch(/skipped.*demonstration/i);
      const after = await db.pool.query(
        "SELECT count(*)::int AS count FROM audit_events WHERE action='document-bypass'",
      );
      expect(after.rows[0].count).toBe(before.rows[0].count + 1);
      const audit = await db.pool.query(
        "SELECT metadata FROM audit_events WHERE action='document-bypass' ORDER BY id DESC LIMIT 1",
      );
      expect(audit.rows[0].metadata).toEqual({
        policyId: 'POL-NARIN-001',
        requestId: payload.requestId,
        status: 'BYPASSED_MOCK',
      });
      const hidden = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-MALI-001/document-bypass',
        headers: { cookie },
        payload,
      });
      const unknown = await app.inject({
        method: 'POST',
        url: '/api/policies/unknown/document-bypass',
        headers: { cookie },
        payload,
      });
      expect(hidden.statusCode).toBe(unknown.statusCode);
      expect(hidden.body).toBe(unknown.body);
      expect(
        (
          await app.inject({
            method: 'POST',
            url: route,
            headers: { cookie },
            payload: { requestId: randomUUID() },
          })
        ).statusCode,
      ).toBe(404);
      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/api/policies/POL-NARIN-002/document-bypass',
            headers: { cookie },
            payload,
          })
        ).statusCode,
      ).toBe(409);
    } finally {
      await app.close();
    }
  });
});
