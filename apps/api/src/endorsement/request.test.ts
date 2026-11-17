import { describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';

const signIn = async (app: Awaited<ReturnType<typeof buildApp>>) => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/sign-in',
    payload: { accountId: 'narin', password: 'NarinDemo123!' },
  });
  return response.headers['set-cookie'];
};

describe('FR-02 request capture', () => {
  it('records one address request for an active policy without changing policy facts', async () => {
    const app = await buildApp({
      now: () => Date.parse('2026-11-16T10:00:00Z'),
    });
    const cookie = await signIn(app);
    const before = (
      await app.inject({
        method: 'GET',
        url: '/api/policies/POL-NARIN-001',
        headers: { cookie },
      })
    ).body;
    const response = await app.inject({
      method: 'POST',
      url: '/api/policies/POL-NARIN-001/requests?requesterId=CUS-002',
      headers: { cookie, 'x-requester-id': 'CUS-002' },
      payload: {
        changeType: 'ADDRESS',
        requestedEffectiveDate: '2026-12-01',
        correspondenceAddress: '123 Demo Road',
      },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().request).toMatchObject({
      policyId: 'POL-NARIN-001',
      requesterId: 'CUS-001',
      changeType: 'ADDRESS',
      requestedEffectiveDate: '2026-12-01',
      correspondenceAddress: '123 Demo Road',
      createdAt: '2026-11-16T10:00:00.000Z',
    });
    expect(response.json().request.id).toEqual(expect.any(String));
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/api/policies/POL-NARIN-001',
          headers: { cookie },
        })
      ).body,
    ).toBe(before);
    await app.close();
  });
});

describe('FR-02 request boundaries', () => {
  it('rejects blank address and malformed calendar date without writing', async () => {
    const requests: import('./schema.js').RequestRecord[] = [];
    const app = await buildApp({ requests });
    const cookie = await signIn(app);
    for (const payload of [
      {
        changeType: 'ADDRESS',
        requestedEffectiveDate: '2026-12-01',
        correspondenceAddress: '   ',
      },
      {
        changeType: 'ADDRESS',
        requestedEffectiveDate: '2026-02-30',
        correspondenceAddress: '123 Demo Road',
      },
    ]) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-NARIN-001/requests',
        headers: { cookie },
        payload,
      });
      expect(response.statusCode).toBe(400);
    }
    expect(requests).toHaveLength(0);
    await app.close();
  });
});

describe('FR-02 supported types and access', () => {
  it('captures only selected fields for beneficiary, frequency, and rider changes', async () => {
    const requests: import('./schema.js').RequestRecord[] = [];
    const app = await buildApp({ requests });
    const cookie = await signIn(app);
    const cases = [
      {
        changeType: 'BENEFICIARY',
        beneficiaries: [
          { name: 'Alex', allocationPercent: 40 },
          { name: 'Sam', allocationPercent: 60 },
        ],
      },
      { changeType: 'PAYMENT_FREQUENCY', paymentFrequency: 'QUARTERLY' },
      { changeType: 'ACCIDENTAL_DEATH_RIDER', riderAction: 'ADD' },
    ];
    for (const data of cases) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-NARIN-001/requests',
        headers: { cookie },
        payload: { ...data, requestedEffectiveDate: '2026-12-01' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().request).toMatchObject(data);
    }
    expect(requests).toHaveLength(3);
    await app.close();
  });

  it('rejects invalid, mixed, and unallocated data without writes', async () => {
    const requests: import('./schema.js').RequestRecord[] = [];
    const app = await buildApp({ requests });
    const cookie = await signIn(app);
    const cases = [
      {
        changeType: 'BENEFICIARY',
        beneficiaries: [{ name: 'Alex', allocationPercent: 99 }],
      },
      {
        changeType: 'BENEFICIARY',
        beneficiaries: [{ name: 'Alex', allocationPercent: 99.9999999999 }],
      },
      {
        changeType: 'ADDRESS',
        correspondenceAddress: '123 Road',
        riderAction: 'ADD',
      },
      { changeType: 'OTHER' },
      { changeType: 'toString' },
      {
        changeType: 'BENEFICIARY',
        beneficiaries: [{ name: '   ', allocationPercent: 100 }],
      },
      { changeType: 'ADDRESS' },
      {
        changeType: 'ADDRESS',
        correspondenceAddress: '123 Road',
        requesterId: 'CUS-002',
      },
    ];
    for (const data of cases) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-NARIN-001/requests',
        headers: { cookie },
        payload: { ...data, requestedEffectiveDate: '2026-12-01' },
      });
      expect(response.statusCode).toBe(400);
    }
    expect(requests).toHaveLength(0);
    await app.close();
  });

  it('rejects unauthenticated, foreign, unknown, and expired policies before writing or disclosing facts', async () => {
    const requests: import('./schema.js').RequestRecord[] = [];
    let time = 0;
    const app = await buildApp({ requests, now: () => time });
    const cookie = await signIn(app);
    const payload = {
      changeType: 'ADDRESS',
      requestedEffectiveDate: '2026-12-01',
      correspondenceAddress: '123 Road',
    };
    const noSession = await app.inject({
      method: 'POST',
      url: '/api/policies/POL-NARIN-001/requests',
      payload,
    });
    expect(noSession.statusCode).toBe(401);
    const foreign = await app.inject({
      method: 'POST',
      url: '/api/policies/POL-MALI-001/requests',
      headers: { cookie },
      payload,
    });
    const unknown = await app.inject({
      method: 'POST',
      url: '/api/policies/UNKNOWN/requests',
      headers: { cookie },
      payload,
    });
    expect(foreign.statusCode).toBe(404);
    expect(foreign.body).toBe(unknown.body);
    expect(foreign.body).not.toContain('Mali');
    const expired = await app.inject({
      method: 'POST',
      url: '/api/policies/POL-NARIN-002/requests',
      headers: { cookie },
      payload,
    });
    expect(expired.statusCode).toBe(409);
    expect(expired.json()).toEqual({ error: 'POLICY_EXPIRED' });
    time = 30 * 60 * 1000;
    const expiredSession = await app.inject({
      method: 'POST',
      url: '/api/policies/POL-NARIN-001/requests',
      headers: { cookie },
      payload,
    });
    expect(expiredSession.statusCode).toBe(401);
    expect(requests).toHaveLength(0);
    await app.close();
  });
});
