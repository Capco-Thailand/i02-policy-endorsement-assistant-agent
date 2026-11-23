import { afterEach, expect, it, vi } from 'vitest';
import { buildApp } from './app.js';
import { database } from './db.js';
import { RULE_ENCODER_VERSION } from '../../ai/rule-retrieval.js';

vi.mock('./db.js', () => {
  const actor = { id: 'CUS', accountId: 'narin', name: 'Narin' };
  const db = {
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
    audit: vi.fn(),
  };
  return { database: () => db };
});
const url = '/api/policies/POL/requests/REQ/eligibility';
const sections = [
  {
    sectionId: 'RULE',
    role: 'RULE' as const,
    text: 'Untrusted prose',
    value: {
      kind: 'CHECK',
      field: 'address',
      requirement: 'complete new mailing address',
    },
    encoderVersion: RULE_ENCODER_VERSION,
  },
  {
    sectionId: 'GUIDANCE',
    role: 'GUIDANCE' as const,
    text: 'No document required',
    value: { kind: 'NONE' },
    encoderVersion: RULE_ENCODER_VERSION,
  },
];
const source = {
  sourceId: 'SRC',
  ruleId: 'RULE-ADDRESS',
  version: 1,
  productId: 'PRODUCT',
  changeType: 'ADDRESS' as const,
  effectiveFrom: '2020-01-01',
  effectiveTo: '2030-01-01',
  encoderVersion: RULE_ENCODER_VERSION,
  sections,
};
const ruleStore = {
  selectedRuleProduct: vi.fn(async () => ({
    product_id: 'PRODUCT',
    product_count: 1,
  })),
  ruleSources: vi.fn(async () => [source]),
  rankedRuleSections: vi.fn(async () =>
    sections.map((item) => ({
      source_id: 'SRC',
      section_id: item.sectionId,
      role: item.role,
      text: item.text,
      value: item.value,
    })),
  ),
};
afterEach(() => vi.clearAllMocks());
it('FR-08 access: rejects absent session before policy, rule, reads', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    const response = await app.inject({ method: 'POST', url });
    expect(response.statusCode).toBe(401);
    expect(database().policy).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});

it('FR-08 success: assesses without a receipt, cites rule, and audits', async () => {
  const app = await buildApp({ schemaOnly: true, ruleStore });
  try {
    const response = await app.inject({
      method: 'POST',
      url,
      headers: { cookie: 'pea_session=test' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      outcome: 'ELIGIBLE',
      citations: [{ sourceId: 'SRC', ruleId: 'RULE-ADDRESS', version: 1 }],
    });
    expect(database().requestFor).toHaveBeenCalledWith('CUS', 'POL', 'REQ');
    expect(database().audit).toHaveBeenCalledWith(
      'CUS',
      'eligibility-check',
      expect.any(Number),
      expect.objectContaining({
        outcome: 'ELIGIBLE',
        requestId: 'REQ',
        reasonCodes: [],
        ruleVersions: [{ ruleId: 'RULE-ADDRESS', version: 1 }],
      }),
    );
    const openapi = (
      await app.inject({ method: 'GET', url: '/openapi.json' })
    ).json();
    expect(
      openapi.paths['/api/policies/{policyId}/requests/{requestId}/eligibility']
        .post.responses['200'],
    ).toBeDefined();
  } finally {
    await app.close();
  }
});

it('FR-08 referral audit retains selected rule version when guidance is unknown', async () => {
  ruleStore.rankedRuleSections.mockResolvedValueOnce(
    sections.map((item) => ({
      source_id: 'SRC',
      section_id: item.sectionId,
      role: item.role,
      text: item.text,
      value: item.role === 'GUIDANCE' ? { kind: 'UNKNOWN' } : item.value,
    })),
  );
  const app = await buildApp({ schemaOnly: true, ruleStore });
  try {
    const response = await app.inject({
      method: 'POST',
      url,
      headers: { cookie: 'pea_session=test' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      outcome: 'REFERRED',
      citations: [],
    });
    expect(database().audit).toHaveBeenCalledWith(
      'CUS',
      'eligibility-check',
      expect.any(Number),
      expect.objectContaining({
        ruleVersions: [{ ruleId: 'RULE-ADDRESS', version: 1 }],
      }),
    );
  } finally {
    await app.close();
  }
});

it('FR-08 failure: audit storage errors never return eligible', async () => {
  const app = await buildApp({ schemaOnly: true, ruleStore });
  try {
    vi.mocked(database().audit).mockRejectedValueOnce(
      new Error('audit unavailable'),
    );
    const response = await app.inject({
      method: 'POST',
      url,
      headers: { cookie: 'pea_session=test' },
    });
    expect(response.statusCode).toBe(503);
  } finally {
    await app.close();
  }
});

it('FR-08 access: unowned policy and request have identical 404 without rule reads', async () => {
  const app = await buildApp({ schemaOnly: true, ruleStore });
  try {
    const unowned = await app.inject({
      method: 'POST',
      url: '/api/policies/OTHER/requests/REQ/eligibility',
      headers: { cookie: 'pea_session=test' },
    });
    vi.mocked(database().requestFor).mockResolvedValueOnce(undefined);
    const missing = await app.inject({
      method: 'POST',
      url,
      headers: { cookie: 'pea_session=test' },
    });
    expect(unowned.statusCode).toBe(404);
    expect(missing.statusCode).toBe(404);
    expect(unowned.body).toBe(missing.body);
    expect(ruleStore.selectedRuleProduct).not.toHaveBeenCalled();
    expect(database().audit).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});
