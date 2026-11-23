import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { buildApp } from './app.js';
import { database } from './db.js';
import { loadCorpus } from './load-corpus.js';
import { loadRules } from './load-rules.js';

const url = process.env.TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;
integration('FR-08 PostgreSQL request and eligibility', () => {
  const db = database(url ?? 'postgresql://localhost/unused');
  let app: Awaited<ReturnType<typeof buildApp>>;
  let cookie = '';
  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    await db.migrate();
    await db.seed();
    await loadCorpus(db.pool);
    await loadRules(db.pool);
    app = await buildApp();
    const signIn = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in',
      payload: { accountId: 'narin', password: 'NarinDemo123!' },
    });
    expect(signIn.statusCode).toBe(200);
    cookie = signIn.headers['set-cookie']?.toString().split(';')[0] ?? '';
  });
  afterAll(async () => {
    await app?.close();
    await db.close();
  });

  it('FR-08 assessment ignores historical receipts and leaves policy unchanged', async () => {
    const before = await db.policy('CUS-001', 'POL-NARIN-001');
    const create = async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-NARIN-001/requests',
        headers: { cookie },
        payload: {
          changeType: 'ADDRESS',
          requestedEffectiveDate: '2027-01-01',
          correspondenceAddress: `Synthetic ${randomUUID()}`,
        },
      });
      expect(response.statusCode).toBe(200);
      return response.json().request.id as string;
    };
    const first = await create();
    const second = await create();
    const check = (id: string, path = 'POL-NARIN-001') =>
      app.inject({
        method: 'POST',
        url: `/api/policies/${path}/requests/${id}/eligibility`,
        headers: { cookie },
      });
    expect((await check(first)).json()).toMatchObject({
      outcome: 'ELIGIBLE',
      reasonCodes: [],
    });
    await db.audit('CUS-001', 'document-upload', Date.now(), {
      policyId: 'POL-NARIN-001',
      requestId: second,
      status: 'RECEIVED_MOCK',
    });
    expect((await check(second)).json()).toMatchObject({
      outcome: 'ELIGIBLE',
      reasonCodes: [],
    });
    const historical = await db.pool.query(
      "SELECT 1 FROM audit_events WHERE action='document-upload' AND metadata->>'requestId'=$1",
      [second],
    );
    expect(historical.rowCount).toBe(1);
    expect((await check(second, 'POL-MALI-001')).statusCode).toBe(404);
    expect(await db.policy('CUS-001', 'POL-NARIN-001')).toEqual(before);
    const audit = await db.pool.query(
      "SELECT metadata FROM audit_events WHERE action='eligibility-check' AND metadata->>'requestId'=$1 ORDER BY id DESC LIMIT 1",
      [second],
    );
    expect(audit.rows[0].metadata).toMatchObject({
      outcome: 'ELIGIBLE',
      policyId: 'POL-NARIN-001',
      requestId: second,
    });
  });
});
