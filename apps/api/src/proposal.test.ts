import { afterEach, expect, it, vi } from 'vitest';
import { buildApp } from './app.js';
import { database } from './db.js';
import { decideEligibility } from './endorsement/eligibility.js';
import type { QuoteContract } from '@pea/calculator/contract';

vi.mock('./endorsement/eligibility.js', async (original) => ({
  ...(await original<typeof import('./endorsement/eligibility.js')>()),
  decideEligibility: vi.fn(() => ({
    outcome: 'CAN_PROCEED',
    reasonCodes: [],
    reasons: [],
    nextStep: 'Review proposal',
    sourceIds: ['RULE'],
    citations: [
      {
        kind: 'POLICY',
        sourceId: 'WORDING',
        version: 'v1',
        sectionId: '2',
        excerpt: 'Change permitted',
      },
      {
        kind: 'RULE',
        sourceId: 'RULE',
        ruleId: 'R1',
        version: 1,
        sectionId: '1',
      },
    ],
  })),
}));
vi.mock('./endorsement/policy-evidence.js', () => ({
  retrievePolicyEvidence: vi.fn(async () => ({
    status: 'AVAILABLE',
    citations: [],
  })),
}));
vi.mock('./rules.js', () => ({
  retrieveRules: vi.fn(async () => ({
    status: 'AVAILABLE',
    sourceIds: ['RULE'],
    citations: [],
  })),
}));
vi.mock('./policy-terms.js', () => ({
  policyTerms: () => ({
    product: { status: 'confirmed', value: { name: 'Synthetic' } },
    coverages: [
      {
        id: 'coverage.life',
        status: 'confirmed',
        value: { amount: 1000000, currency: 'THB' },
      },
      {
        id: 'coverage.accidental-death',
        status: 'confirmed',
        value: { amount: 250000, currency: 'THB' },
      },
    ],
  }),
}));
vi.mock('./endorsement/calculator-client.js', async (original) => ({
  ...(await original<typeof import('./endorsement/calculator-client.js')>()),
  validQuote: () => true,
}));
vi.mock('./db.js', () => {
  const actor = { id: 'CUS', accountId: 'narin', name: 'Narin' };
  const state: { proposal?: Record<string, unknown> } = {};
  const db = {
    reset: () => {
      state.proposal = undefined;
    },
    close: vi.fn(),
    session: vi.fn(async (token: string) =>
      token === 'test' ? { actor } : undefined,
    ),
    policy: vi.fn(async (_actor: string, id: string) =>
      id === 'POL'
        ? {
            id,
            customerId: 'CUS',
            label: 'Synthetic',
            status: 'ACTIVE',
            effectiveDate: '2020-01-01',
            expiryDate: '2030-01-01',
            paymentFrequency: 'MONTHLY',
            beneficiaries: [],
            coverageTerms: [],
          }
        : undefined,
    ),
    requestFor: vi.fn(async () => ({
      id: 'REQ',
      requesterId: 'CUS',
      policyId: 'POL',
      createdAt: '2026-11-20T00:00:00Z',
      changeType: 'ADDRESS',
      requestedEffectiveDate: '2026-12-01',
      correspondenceAddress: 'New address',
    })),
    evidenceDocument: vi.fn(async () => ({ product_id: 'PRODUCT' })),
    proposalForRequest: vi.fn(async () => state.proposal),
    saveProposal: vi.fn(async (proposal: Record<string, unknown>) => {
      state.proposal = proposal;
      return proposal;
    }),
    presentProposal: vi.fn(async () =>
      state.proposal
        ? { ...state.proposal, status: 'PENDING_APPROVAL' }
        : undefined,
    ),
    audit: vi.fn(),
  };
  return { database: () => db };
});

const path = '/api/policies/POL/requests/REQ/proposal';
const cookie = { cookie: 'pea_session=test' };
afterEach(() => {
  vi.clearAllMocks();
  (database() as ReturnType<typeof database> & { reset(): void }).reset();
});

it('FR-10 requires session and ownership before assessment or storage', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    expect((await app.inject({ method: 'POST', url: path })).statusCode).toBe(
      401,
    );
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/policies/FOREIGN/requests/REQ/proposal',
          headers: cookie,
        })
      ).statusCode,
    ).toBe(404);
    expect(database().requestFor).not.toHaveBeenCalled();
    expect(decideEligibility).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});

it('FR-10 saves one unchanged draft and presents it without a policy write', async () => {
  const calculator = vi.fn();
  const app = await buildApp({
    schemaOnly: true,
    calculatorClient: calculator,
  });
  try {
    const created = await app.inject({
      method: 'POST',
      url: path,
      headers: cookie,
    });
    expect(created.statusCode).toBe(200);
    expect(created.json()).toMatchObject({
      status: 'DRAFT',
      binding: false,
      impact: { status: 'UNCHANGED' },
      citations: [
        { sourceId: 'WORDING', version: 'v1' },
        { sourceId: 'RULE', version: 1 },
      ],
    });
    expect(calculator).not.toHaveBeenCalled();
    const again = await app.inject({
      method: 'POST',
      url: path,
      headers: cookie,
    });
    expect(again.json().id).toBe(created.json().id);
    expect(database().saveProposal).toHaveBeenCalledTimes(1);
    expect(database().policy).toHaveBeenCalledTimes(2);
    const shown = await app.inject({
      method: 'GET',
      url: `/api/policies/POL/proposals/${created.json().id}`,
      headers: cookie,
    });
    expect(shown.json().status).toBe('PENDING_APPROVAL');
    expect(database().presentProposal).toHaveBeenCalledOnce();
  } finally {
    await app.close();
  }
});

it('FR-10 retry rechecks fresh eligibility before returning an existing snapshot', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    const first = await app.inject({
      method: 'POST',
      url: path,
      headers: cookie,
    });
    expect(first.statusCode).toBe(200);
    vi.mocked(decideEligibility).mockReturnValueOnce({
      outcome: 'NEEDS_REVIEW',
      reasonCodes: ['RULE_MISSING'],
      reasons: ['Rule missing'],
      nextStep: 'Wait',
      sourceIds: [],
      citations: [],
    });
    const retry = await app.inject({
      method: 'POST',
      url: path,
      headers: cookie,
    });
    expect(retry.statusCode).toBe(409);
    expect(database().saveProposal).toHaveBeenCalledTimes(1);
  } finally {
    await app.close();
  }
});

it('FR-10 retry rejects a policy that expired after draft creation', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    expect(
      (await app.inject({ method: 'POST', url: path, headers: cookie }))
        .statusCode,
    ).toBe(200);
    vi.mocked(database().policy).mockResolvedValueOnce({
      id: 'POL',
      customerId: 'CUS',
      label: 'Synthetic',
      status: 'EXPIRED',
      effectiveDate: '2020-01-01',
      expiryDate: '2025-01-01',
      paymentFrequency: 'MONTHLY',
      beneficiaries: [],
      coverageTerms: [],
    });
    const retry = await app.inject({
      method: 'POST',
      url: path,
      headers: cookie,
    });
    expect(retry.statusCode).toBe(409);
    expect(database().saveProposal).toHaveBeenCalledTimes(1);
  } finally {
    await app.close();
  }
});

it('FR-10 calculated preparation uses one assessment and stores its citations with the quote', async () => {
  vi.mocked(database().requestFor).mockResolvedValueOnce({
    id: 'REQ',
    requesterId: 'CUS',
    policyId: 'POL',
    createdAt: '2026-11-20T00:00:00Z',
    changeType: 'PAYMENT_FREQUENCY',
    requestedEffectiveDate: '2026-12-01',
    paymentFrequency: 'ANNUAL',
  });
  const quote = {
    ratingVersion: 'synthetic-rating-v1',
    currency: 'THB',
    before: {
      frequency: 'MONTHLY',
      premiumPerInstallmentSatang: 10000,
      installmentsPerYear: 12,
      annualizedScheduledTotalSatang: 120000,
      lifeBenefitBaht: 1000000,
      riderBenefitBaht: 250000,
    },
    after: {
      frequency: 'ANNUAL',
      premiumPerInstallmentSatang: 100000,
      installmentsPerYear: 1,
      annualizedScheduledTotalSatang: 100000,
      lifeBenefitBaht: 1000000,
      riderBenefitBaht: 250000,
    },
    difference: {
      premiumPerInstallmentSatang: 90000,
      annualizedScheduledTotalSatang: -20000,
      lifeBenefitBaht: 0,
      riderBenefitBaht: 0,
    },
  } satisfies QuoteContract;
  const calculator = vi.fn(async () => quote);
  const app = await buildApp({
    schemaOnly: true,
    calculatorClient: calculator,
  });
  try {
    const response = await app.inject({
      method: 'POST',
      url: path,
      headers: cookie,
    });
    expect(response.statusCode).toBe(200);
    expect(decideEligibility).toHaveBeenCalledTimes(1);
    expect(calculator).toHaveBeenCalledOnce();
    expect(response.json()).toMatchObject({
      citations: [
        { sourceId: 'WORDING', version: 'v1' },
        { sourceId: 'RULE', version: 1 },
      ],
      impact: { status: 'CALCULATED', quote },
    });
  } finally {
    await app.close();
  }
});

it('FR-10 blocks a non-positive assessment without a proposal', async () => {
  vi.mocked(decideEligibility).mockReturnValueOnce({
    outcome: 'NEEDS_REVIEW',
    reasonCodes: ['RULE_MISSING'],
    reasons: ['Rule missing'],
    nextStep: 'Wait',
    sourceIds: [],
    citations: [],
  });
  const app = await buildApp({ schemaOnly: true });
  try {
    const response = await app.inject({
      method: 'POST',
      url: path,
      headers: cookie,
    });
    expect(response.statusCode).toBe(409);
    expect(database().saveProposal).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});

it('FR-10 reports storage failure without a successful draft', async () => {
  vi.mocked(database().saveProposal).mockRejectedValueOnce(
    new Error('storage unavailable'),
  );
  const app = await buildApp({ schemaOnly: true });
  try {
    const response = await app.inject({
      method: 'POST',
      url: path,
      headers: cookie,
    });
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ error: 'PROPOSAL_UNAVAILABLE' });
    expect(
      await database().proposalForRequest('CUS', 'POL', 'REQ'),
    ).toBeUndefined();
  } finally {
    await app.close();
  }
});

it('FR-10 hides foreign and missing proposal reads', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/api/policies/FOREIGN/proposals/PROP',
          headers: cookie,
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/api/policies/POL/proposals/PROP',
          headers: cookie,
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/api/policies/POL/proposals/PROP',
        })
      ).statusCode,
    ).toBe(401);
  } finally {
    await app.close();
  }
});
