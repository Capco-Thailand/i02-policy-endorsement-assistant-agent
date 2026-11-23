import { afterEach, expect, it, vi } from 'vitest';
import { buildApp } from './app.js';
import { database } from './db.js';
import { RULE_ENCODER_VERSION } from '../../ai/rule-retrieval.js';
import { ENCODER_VERSION } from '../../ai/retrieval.js';

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
    evidenceDocument: vi.fn(async () => ({
      id: 'POLICY-WORDING',
      version: 'v1',
      title: 'Synthetic policy wording',
      encoder_version: ENCODER_VERSION,
      facts_snapshot: {
        status: 'ACTIVE',
        dates: { effectiveDate: '2020-01-01', expiryDate: '2030-01-01' },
        payment: 'MONTHLY',
        beneficiaries: [],
      },
      sections: [
        {
          sectionId: 'status',
          concept: 'status',
          value: 'ACTIVE',
          excerpt: 'Policy is active.',
          encoderVersion: ENCODER_VERSION,
        },
        {
          sectionId: 'dates',
          concept: 'dates',
          value: { effectiveDate: '2020-01-01', expiryDate: '2030-01-01' },
          excerpt: 'Effective 2020-01-01 expiry 2030-01-01.',
          encoderVersion: ENCODER_VERSION,
        },
        {
          sectionId: 'payment',
          concept: 'payment',
          value: 'MONTHLY',
          excerpt: 'Monthly payment.',
          encoderVersion: ENCODER_VERSION,
        },
        {
          sectionId: 'beneficiaries',
          concept: 'beneficiaries',
          value: [],
          excerpt: 'Beneficiaries: 0',
          encoderVersion: ENCODER_VERSION,
        },
      ],
    })),
    rankedEvidence: vi.fn(async () => [
      {
        document_id: 'POLICY-WORDING',
        version: 'v1',
        title: 'Synthetic policy wording',
        section_id: 'status',
        excerpt: 'Policy is active.',
        concept: 'status',
        fact_value: 'ACTIVE',
      },
    ]),
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
      outcome: 'CAN_PROCEED',
      citations: [
        { kind: 'POLICY', sourceId: 'POLICY-WORDING', version: 'v1' },
        { kind: 'RULE', sourceId: 'SRC', ruleId: 'RULE-ADDRESS', version: 1 },
      ],
    });
    expect(database().requestFor).toHaveBeenCalledWith('CUS', 'POL', 'REQ');
    expect(database().audit).toHaveBeenCalledWith(
      'CUS',
      'eligibility-check',
      expect.any(Number),
      expect.objectContaining({
        outcome: 'CAN_PROCEED',
        requestId: 'REQ',
        reasonCodes: [],
        policySources: [{ sourceId: 'POLICY-WORDING', version: 'v1' }],
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
      outcome: 'NEEDS_REVIEW',
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

it('FR-08 unresolved: missing policy wording cannot produce CAN_PROCEED', async () => {
  vi.mocked(database().evidenceDocument).mockResolvedValueOnce(undefined);
  const app = await buildApp({ schemaOnly: true, ruleStore });
  try {
    const response = await app.inject({
      method: 'POST',
      url,
      headers: { cookie: 'pea_session=test' },
    });
    expect(response.json()).toMatchObject({
      outcome: 'NEEDS_REVIEW',
      reasonCodes: ['POLICY_MISSING'],
      citations: [{ kind: 'RULE', sourceId: 'SRC' }],
    });
  } finally {
    await app.close();
  }
});

it('FR-08 unresolved: rule storage failure retains policy citation', async () => {
  ruleStore.ruleSources.mockRejectedValueOnce(new Error('rule storage failed'));
  const app = await buildApp({ schemaOnly: true, ruleStore });
  try {
    const response = await app.inject({
      method: 'POST',
      url,
      headers: { cookie: 'pea_session=test' },
    });
    expect(response.json()).toMatchObject({
      outcome: 'NEEDS_REVIEW',
      reasonCodes: ['RULE_UNAVAILABLE'],
      citations: [{ kind: 'POLICY', sourceId: 'POLICY-WORDING' }],
    });
  } finally {
    await app.close();
  }
});

it('FR-08 unresolved: stale policy wording and retrieval failure remain non-positive', async () => {
  vi.mocked(database().evidenceDocument)
    .mockResolvedValueOnce({
      id: 'STALE',
      version: 'v0',
      encoder_version: 'stale',
      sections: [],
    } as never)
    .mockRejectedValueOnce(new Error('storage failed'));
  const app = await buildApp({ schemaOnly: true, ruleStore });
  try {
    const request = () =>
      app.inject({
        method: 'POST',
        url,
        headers: { cookie: 'pea_session=test' },
      });
    expect((await request()).json()).toMatchObject({
      outcome: 'NEEDS_REVIEW',
      reasonCodes: ['POLICY_STALE'],
    });
    expect((await request()).json()).toMatchObject({
      outcome: 'NEEDS_REVIEW',
      reasonCodes: ['POLICY_UNAVAILABLE'],
    });
  } finally {
    await app.close();
  }
});

it('FR-08 unresolved: conflicting policy passage blocks automatic progression', async () => {
  const baseline = await database().evidenceDocument('POL');
  if (!baseline) throw new Error('Missing test wording');
  vi.mocked(database().evidenceDocument).mockResolvedValueOnce({
    ...baseline,
    sections: baseline.sections.map((section) =>
      section.concept === 'payment' ? { ...section, value: 'ANNUAL' } : section,
    ),
  });
  const app = await buildApp({ schemaOnly: true, ruleStore });
  try {
    const response = await app.inject({
      method: 'POST',
      url,
      headers: { cookie: 'pea_session=test' },
    });
    expect(response.json()).toMatchObject({
      outcome: 'NEEDS_REVIEW',
      reasonCodes: ['POLICY_CONFLICTING'],
    });
    expect(database().audit).toHaveBeenCalledWith(
      'CUS',
      'eligibility-check',
      expect.any(Number),
      expect.objectContaining({
        policySources: [{ sourceId: 'POLICY-WORDING', version: 'v1' }],
      }),
    );
  } finally {
    await app.close();
  }
});

it('FR-08 gate: expired policy stops before either evidence store', async () => {
  vi.mocked(database().policy).mockResolvedValueOnce({
    id: 'POL',
    customerId: 'CUS',
    label: 'Synthetic',
    status: 'EXPIRED',
    effectiveDate: '2020-01-01',
    expiryDate: '2030-01-01',
    paymentFrequency: 'MONTHLY',
    beneficiaries: [],
  });
  const app = await buildApp({ schemaOnly: true, ruleStore });
  try {
    const response = await app.inject({
      method: 'POST',
      url,
      headers: { cookie: 'pea_session=test' },
    });
    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ error: 'POLICY_EXPIRED' });
    expect(database().evidenceDocument).not.toHaveBeenCalled();
    expect(ruleStore.selectedRuleProduct).not.toHaveBeenCalled();
    expect(database().audit).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});

it('FR-08 gate: invalid persisted fields stop before retrieval and audit', async () => {
  vi.mocked(database().requestFor).mockResolvedValueOnce({
    changeType: 'ADDRESS',
  });
  const app = await buildApp({ schemaOnly: true, ruleStore });
  try {
    const response = await app.inject({
      method: 'POST',
      url,
      headers: { cookie: 'pea_session=test' },
    });
    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ error: 'INVALID_REQUEST' });
    expect(database().evidenceDocument).not.toHaveBeenCalled();
    expect(ruleStore.selectedRuleProduct).not.toHaveBeenCalled();
    expect(database().audit).not.toHaveBeenCalled();
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
