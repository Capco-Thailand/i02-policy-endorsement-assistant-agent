import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import { authorizeProposalDecision } from './service.js';

describe('FR-01 AC1/AC4: policy ownership is derived from the session', () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it('lists only linked policies and returns the same unavailable result for other and unknown IDs', async () => {
    app = await buildApp();
    const signIn = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: { accountId: 'demo-alice', password: 'alice-demo-password' },
    });
    const setCookie = signIn.headers['set-cookie'];
    const cookie =
      (Array.isArray(setCookie) ? setCookie[0] : setCookie)?.split(';')[0] ??
      '';

    const list = await app.inject({
      method: 'GET',
      url: '/policies',
      headers: { cookie, 'x-customer-id': 'demo-bob' },
    });
    expect(list.statusCode).toBe(200);
    expect(list.headers['cache-control']).toBe('no-store');
    expect(list.json()).toEqual({
      policies: [
        { id: 'SYN-POL-1001', status: 'ACTIVE' },
        { id: 'SYN-POL-1002', status: 'EXPIRED' },
      ],
    });

    const otherCustomerPolicy = await app.inject({
      method: 'GET',
      url: '/policies/SYN-POL-2001',
      headers: { cookie, 'x-customer-id': 'demo-bob' },
    });
    const unknownPolicy = await app.inject({
      method: 'GET',
      url: '/policies/UNKNOWN',
      headers: { cookie },
    });
    expect(otherCustomerPolicy.statusCode).toBe(404);
    expect(otherCustomerPolicy.headers['cache-control']).toBe('no-store');
    expect(otherCustomerPolicy.body).toBe(unknownPolicy.body);
    expect(otherCustomerPolicy.json()).toEqual({ error: 'Policy unavailable' });
  });

  it('FR-01 AC4: returns an owned policy detail without ownership metadata', async () => {
    app = await buildApp();
    const signIn = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: { accountId: 'demo-alice', password: 'alice-demo-password' },
    });
    const setCookie = signIn.headers['set-cookie'];
    const cookie =
      (Array.isArray(setCookie) ? setCookie[0] : setCookie)?.split(';')[0] ??
      '';
    const detail = await app.inject({
      method: 'GET',
      url: '/policies/SYN-POL-1001',
      headers: { cookie },
    });

    expect(detail.statusCode).toBe(200);
    expect(detail.json()).toEqual({ id: 'SYN-POL-1001', status: 'ACTIVE' });
    expect(detail.body).not.toContain('demo-alice');
  });

  it('FR-01 AC5: loads a proposal on the server before allowing its owner to decide', async () => {
    const alice = { id: 'demo-alice', displayName: 'Alice Morgan' };
    const proposals = new Map([
      [
        'new-proposal',
        { id: 'new-proposal', ownerId: 'demo-alice', policyId: 'SYN-POL-1001' },
      ],
      [
        'other-proposal',
        { id: 'other-proposal', ownerId: 'demo-bob', policyId: 'SYN-POL-2001' },
      ],
      [
        'unlinked-proposal',
        {
          id: 'unlinked-proposal',
          ownerId: 'demo-alice',
          policyId: 'SYN-POL-2001',
        },
      ],
    ]);
    const loadProposal = async (id: string) => proposals.get(id) ?? null;
    expect(
      await authorizeProposalDecision(alice, 'new-proposal', loadProposal),
    ).toBe(true);
    expect(
      await authorizeProposalDecision(alice, 'other-proposal', loadProposal),
    ).toBe(false);
    expect(
      await authorizeProposalDecision(alice, 'unlinked-proposal', loadProposal),
    ).toBe(false);
    expect(
      await authorizeProposalDecision(alice, 'missing', loadProposal),
    ).toBe(false);
  });

  it('FR-01 AC1: gives the second seeded customer only their linked policy', async () => {
    app = await buildApp();
    const signIn = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: { accountId: 'demo-bob', password: 'bob-demo-password' },
    });
    const setCookie = signIn.headers['set-cookie'];
    const cookie =
      (Array.isArray(setCookie) ? setCookie[0] : setCookie)?.split(';')[0] ??
      '';
    const list = await app.inject({
      method: 'GET',
      url: '/policies',
      headers: { cookie, 'x-customer-id': 'demo-alice' },
    });

    expect(list.statusCode).toBe(200);
    expect(list.json()).toEqual({
      policies: [{ id: 'SYN-POL-2001', status: 'ACTIVE' }],
    });
  });
});
