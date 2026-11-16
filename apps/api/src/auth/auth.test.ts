import { describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import { customers, policies } from './data.js';
import { mayDecideProposal } from './guards.js';

const signIn = async (
  app: Awaited<ReturnType<typeof buildApp>>,
  accountId: string,
  password: string,
) => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/sign-in',
    payload: { accountId, password },
  });
  return { response, cookie: response.headers['set-cookie'] };
};

describe('FR-01 customer authentication', () => {
  it('signs in a seeded customer and returns only their linked policy', async () => {
    const app = await buildApp();
    const signInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in',
      payload: { accountId: 'narin', password: 'NarinDemo123!' },
    });
    expect(signInResponse.statusCode).toBe(200);
    const cookie = signInResponse.headers['set-cookie'];
    expect(cookie).toContain('HttpOnly');
    const policies = await app.inject({
      method: 'GET',
      url: '/api/policies',
      headers: { cookie },
    });
    expect(policies.statusCode).toBe(200);
    expect(
      policies.json().policies.map((policy: { id: string }) => policy.id),
    ).toEqual(['POL-NARIN-001', 'POL-NARIN-002']);
    const mali = await signIn(app, 'mali', 'MaliDemo123!');
    const maliPolicies = await app.inject({
      method: 'GET',
      url: '/api/policies',
      headers: { cookie: mali.cookie },
    });
    expect(maliPolicies.statusCode).toBe(200);
    expect(
      maliPolicies.json().policies.map((policy: { id: string }) => policy.id),
    ).toEqual(['POL-MALI-001']);
    await app.close();
  });

  it('rejects bad credentials and missing or forged sessions', async () => {
    const app = await buildApp();
    expect((await signIn(app, 'mali', 'wrong')).response.statusCode).toBe(401);
    expect(
      (await app.inject({ method: 'GET', url: '/api/auth/session' }))
        .statusCode,
    ).toBe(401);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/api/policies',
          headers: { cookie: 'pea_session=forged' },
        })
      ).statusCode,
    ).toBe(401);
    await app.close();
  });

  it('invalidates sign-out and expired sessions on direct API reuse', async () => {
    let time = 0;
    const app = await buildApp({ now: () => time });
    const first = await signIn(app, 'narin', 'NarinDemo123!');
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/auth/sign-out',
          headers: { cookie: first.cookie },
        })
      ).statusCode,
    ).toBe(204);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/api/policies',
          headers: { cookie: first.cookie },
        })
      ).statusCode,
    ).toBe(401);
    const second = await signIn(app, 'narin', 'NarinDemo123!');
    time = 30 * 60 * 1000;
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/api/auth/session',
          headers: { cookie: second.cookie },
        })
      ).statusCode,
    ).toBe(401);
    await app.close();
  });

  it('publishes the server expiry time so the UI can clear data when it elapses', async () => {
    const app = await buildApp({ now: () => 1_000 });
    const { cookie } = await signIn(app, 'mali', 'MaliDemo123!');
    const session = await app.inject({
      method: 'GET',
      url: '/api/auth/session',
      headers: { cookie },
    });
    expect(session.json().expiresAt).toBe(1_801_000);
    await app.close();
  });

  it('uses the session actor and hides another customer policy like an unknown ID', async () => {
    const app = await buildApp();
    const { cookie } = await signIn(app, 'narin', 'NarinDemo123!');
    const cross = await app.inject({
      method: 'GET',
      url: '/api/policies/POL-MALI-001?customerId=CUS-002&role=admin',
      headers: { cookie, 'x-customer-id': 'CUS-002' },
    });
    const unknown = await app.inject({
      method: 'GET',
      url: '/api/policies/UNKNOWN',
      headers: { cookie },
    });
    expect(cross.statusCode).toBe(404);
    expect(cross.body).toBe(unknown.body);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/api/auth/session',
          headers: { cookie },
        })
      ).json().actor.id,
    ).toBe('CUS-001');
    await app.close();
  });

  it('limits proposal decisions to the actor owning the linked policy', () => {
    const proposal = {
      id: 'PROP-001',
      customerId: 'CUS-001',
      policyId: 'POL-NARIN-001',
    };
    expect(mayDecideProposal(customers[0], proposal, policies[0])).toBe(true);
    expect(mayDecideProposal(customers[1], proposal, policies[0])).toBe(false);
    expect(
      mayDecideProposal(
        customers[0],
        { ...proposal, policyId: 'POL-MALI-001' },
        policies[1],
      ),
    ).toBe(false);
  });

  it('records actor and action without secrets', async () => {
    const audit: { actorId: string; action: string; at: number }[] = [];
    const app = await buildApp({ audit });
    const { cookie } = await signIn(app, 'narin', 'NarinDemo123!');
    await app.inject({
      method: 'GET',
      url: '/api/policies',
      headers: { cookie },
    });
    expect(audit.map(({ actorId, action }) => [actorId, action])).toEqual([
      ['CUS-001', 'sign-in'],
      ['CUS-001', 'policies-list'],
    ]);
    expect(JSON.stringify(audit)).not.toContain('NarinDemo123!');
    expect(JSON.stringify(audit)).not.toContain('pea_session');
    await app.close();
  });
});

describe('FR-03 policy access', () => {
  it('returns status in the owned list and complete facts in linked details', async () => {
    const app = await buildApp();
    const { cookie } = await signIn(app, 'narin', 'NarinDemo123!');
    const list = await app.inject({
      method: 'GET',
      url: '/api/policies',
      headers: { cookie },
    });
    expect(list.json().policies).toEqual([
      {
        id: 'POL-NARIN-001',
        label: 'Family Protection Plan',
        status: 'ACTIVE',
      },
      { id: 'POL-NARIN-002', label: 'Classic Life Plan', status: 'EXPIRED' },
    ]);
    const active = await app.inject({
      method: 'GET',
      url: '/api/policies/POL-NARIN-001',
      headers: { cookie },
    });
    expect(active.json().policy).toEqual({
      id: 'POL-NARIN-001',
      label: 'Family Protection Plan',
      status: 'ACTIVE',
      effectiveDate: '2025-01-01',
      expiryDate: '2035-12-31',
      paymentFrequency: 'MONTHLY',
      beneficiaries: [
        { name: 'Arisa K.', allocationPercent: 60 },
        { name: 'Decha K.', allocationPercent: 40 },
      ],
    });
    const expired = await app.inject({
      method: 'GET',
      url: '/api/policies/POL-NARIN-002',
      headers: { cookie },
    });
    expect(expired.json().policy).toMatchObject({
      status: 'EXPIRED',
      paymentFrequency: 'ANNUAL',
    });
    const mali = await signIn(app, 'mali', 'MaliDemo123!');
    const maliList = await app.inject({
      method: 'GET',
      url: '/api/policies',
      headers: { cookie: mali.cookie },
    });
    expect(maliList.json().policies).toEqual([
      { id: 'POL-MALI-001', label: 'Secure Future Plan', status: 'ACTIVE' },
    ]);
    const maliDetail = await app.inject({
      method: 'GET',
      url: '/api/policies/POL-MALI-001',
      headers: { cookie: mali.cookie },
    });
    expect(maliDetail.json().policy).toEqual({
      id: 'POL-MALI-001',
      label: 'Secure Future Plan',
      status: 'ACTIVE',
      effectiveDate: '2024-06-01',
      expiryDate: '2034-05-31',
      paymentFrequency: 'ANNUAL',
      beneficiaries: [{ name: 'Pim S.', allocationPercent: 100 }],
    });
    await app.close();
  });

  it('hides unowned facts and rejects missing, invalid, expired, and signed-out sessions', async () => {
    let time = 0;
    const app = await buildApp({ now: () => time });
    const { cookie } = await signIn(app, 'narin', 'NarinDemo123!');
    const cross = await app.inject({
      method: 'GET',
      url: '/api/policies/POL-MALI-001?customerId=CUS-002&role=admin',
      headers: { cookie, 'x-customer-id': 'CUS-002' },
    });
    const unknown = await app.inject({
      method: 'GET',
      url: '/api/policies/UNKNOWN',
      headers: { cookie },
    });
    expect(cross.statusCode).toBe(404);
    expect(cross.body).toBe(unknown.body);
    expect(cross.body).not.toContain('Pim S.');
    for (const headers of [undefined, { cookie: 'pea_session=forged' }]) {
      for (const url of ['/api/policies', '/api/policies/POL-NARIN-001']) {
        const result = await app.inject({ method: 'GET', url, headers });
        expect(result.statusCode).toBe(401);
        expect(result.body).toBe('{"error":"UNAUTHORIZED"}');
      }
    }
    time = 30 * 60 * 1000;
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/api/policies/POL-NARIN-001',
          headers: { cookie },
        })
      ).statusCode,
    ).toBe(401);
    const next = await signIn(app, 'narin', 'NarinDemo123!');
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/auth/sign-out',
          headers: { cookie: next.cookie },
        })
      ).statusCode,
    ).toBe(204);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/api/policies/POL-NARIN-001',
          headers: { cookie: next.cookie },
        })
      ).statusCode,
    ).toBe(401);
    await app.close();
  });

  it('reads policies without creating a request or changing policy facts', async () => {
    const audit: { actorId: string; action: string; at: number }[] = [];
    const app = await buildApp({ audit });
    const { cookie } = await signIn(app, 'narin', 'NarinDemo123!');
    const before = JSON.stringify(policies);
    await app.inject({
      method: 'GET',
      url: '/api/policies',
      headers: { cookie },
    });
    await app.inject({
      method: 'GET',
      url: '/api/policies/POL-NARIN-001',
      headers: { cookie },
    });
    expect(JSON.stringify(policies)).toBe(before);
    expect(audit.map(({ action }) => action)).toEqual([
      'sign-in',
      'policies-list',
      'policy-read',
    ]);
    await app.close();
  });
});
