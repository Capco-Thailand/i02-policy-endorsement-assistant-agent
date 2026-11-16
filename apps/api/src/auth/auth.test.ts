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
    ).toEqual(['POL-NARIN-001']);
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
