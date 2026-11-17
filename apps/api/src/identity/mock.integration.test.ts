import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import { database } from '../db.js';

const url = process.env.TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;
integration('FR-06 mock identity API', () => {
  const db = database(url ?? 'postgresql://localhost/unused');
  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    await db.migrate();
    await db.seed();
  });
  afterAll(async () => db.close());

  it('authorizes before evaluation and records only synthetic outcome metadata', async () => {
    const app = await buildApp();
    try {
      const signIn = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: { accountId: 'narin', password: 'NarinDemo123!' },
      });
      const cookie = signIn.headers['set-cookie'];
      const url = '/api/policies/POL-NARIN-001/mock-identity';
      expect(
        (
          await app.inject({
            method: 'POST',
            url,
            payload: { scenario: 'all-pass' },
          })
        ).statusCode,
      ).toBe(401);
      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/api/policies/POL-MALI-001/mock-identity',
            headers: { cookie },
            payload: { scenario: 'all-pass' },
          })
        ).statusCode,
      ).toBe(404);
      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/api/policies/POL-NARIN-002/mock-identity',
            headers: { cookie },
            payload: { scenario: 'all-pass' },
          })
        ).statusCode,
      ).toBe(409);
      const response = await app.inject({
        method: 'POST',
        url,
        headers: { cookie },
        payload: { scenario: 'all-pass' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        status: 'VERIFIED',
        reason: 'MOCK_CHECKS_PASSED',
        disclosure: expect.stringContaining('Simulated'),
      });
      const audit = await db.pool.query(
        "SELECT metadata FROM audit_events WHERE action='mock-identity' ORDER BY id DESC LIMIT 1",
      );
      expect(audit.rows[0].metadata).toEqual({
        policyId: 'POL-NARIN-001',
        status: 'VERIFIED',
        reason: 'MOCK_CHECKS_PASSED',
      });
      expect(
        (
          await app.inject({
            method: 'POST',
            url,
            headers: { cookie },
            payload: { scenario: 'unknown' },
          })
        ).statusCode,
      ).toBe(400);
    } finally {
      await app.close();
    }
  });
});
