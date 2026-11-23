import { expect, it } from 'vitest';
import { decideEligibility as assess } from './eligibility.js';
import type { Policy } from '../auth/data.js';

const request = {
  id: 'REQ',
  requesterId: 'CUS',
  policyId: 'POL',
  createdAt: '2026-11-20T00:00:00Z',
  changeType: 'ADDRESS',
  requestedEffectiveDate: '2026-12-01',
  correspondenceAddress: 'New address',
};
const policy: Policy = {
  id: 'POL',
  customerId: 'CUS',
  label: 'Synthetic',
  status: 'ACTIVE',
  effectiveDate: '2020-01-01',
  expiryDate: '2030-01-01',
  paymentFrequency: 'MONTHLY',
  beneficiaries: [],
};
const citation = {
  sourceId: 'SRC',
  ruleId: 'ADDRESS-RULE',
  version: 1,
  productId: 'PRODUCT',
  changeType: 'ADDRESS',
  effectiveFrom: '2020-01-01',
  effectiveTo: '2030-01-01',
  sectionId: 'RULE',
  role: 'RULE',
  text: 'Untrusted prose',
  value: {
    kind: 'CHECK',
    field: 'address',
    requirement: 'complete new mailing address',
  },
};
const policyEvidence = {
  status: 'AVAILABLE' as const,
  citations: [
    {
      kind: 'POLICY' as const,
      sourceId: 'POLICY-WORDING',
      version: 'v1',
      sectionId: 'status',
      excerpt: 'Policy is active.',
    },
  ],
};
const decideEligibility = (
  selectedPolicy: Policy,
  savedRequest: unknown,
  rules: Parameters<typeof assess>[2],
) => assess(selectedPolicy, savedRequest, rules, policyEvidence);

it('FR-08 address: an owned active saved request with cited CHECK is eligible', () => {
  expect(
    decideEligibility(policy, request, {
      status: 'AVAILABLE',
      sourceIds: ['SRC'],
      citations: [
        citation,
        {
          ...citation,
          sectionId: 'GUIDANCE',
          role: 'GUIDANCE',
          value: { kind: 'NONE' },
        },
      ],
    }),
  ).toMatchObject({
    outcome: 'CAN_PROCEED',
    reasonCodes: [],
    nextStep:
      'A non-binding proposal can be prepared when that step is available.',
  });
});

it('FR-08 unknown values: extra structured rule fields require referral', () => {
  expect(
    decideEligibility(policy, request, {
      status: 'AVAILABLE',
      sourceIds: ['SRC'],
      citations: [
        { ...citation, value: { ...citation.value, override: true } },
        {
          ...citation,
          sectionId: 'GUIDANCE',
          role: 'GUIDANCE',
          value: { kind: 'NONE' },
        },
      ],
    }).outcome,
  ).toBe('NEEDS_REVIEW');
});

const available = (
  rule: Omit<typeof citation, 'value'> & { value: Record<string, unknown> },
  guidance: Record<string, unknown> = { kind: 'NONE' },
) => ({
  status: 'AVAILABLE',
  sourceIds: ['SRC'],
  citations: [
    rule,
    { ...rule, sectionId: 'GUIDANCE', role: 'GUIDANCE', value: guidance },
  ],
});
it('FR-08 beneficiary: complete named allocations pass, malformed allocations fail', () => {
  const { correspondenceAddress: _address, ...base } = request;
  const saved = {
    ...base,
    changeType: 'BENEFICIARY',
    beneficiaries: [{ name: 'Synthetic Person', allocationPercent: 100 }],
  };
  const rule = {
    ...citation,
    changeType: 'BENEFICIARY',
    value: {
      kind: 'CHECK',
      field: 'beneficiaries',
      requirement: 'named beneficiaries and allocations total 100%',
    },
  };
  expect(decideEligibility(policy, saved, available(rule)).outcome).toBe(
    'CAN_PROCEED',
  );
  expect(
    decideEligibility(
      policy,
      { ...saved, beneficiaries: [{ name: ' ', allocationPercent: 100 }] },
      available(rule),
    ).reasonCodes,
  ).toContain('INVALID_BENEFICIARIES');
  expect(
    decideEligibility(
      policy,
      {
        ...saved,
        beneficiaries: [{ name: 'Synthetic Person', allocationPercent: 90 }],
      },
      available(rule),
    ).reasonCodes,
  ).toContain('INVALID_BENEFICIARIES');
});
it('FR-08 payment: allowed value passes; disallowed value fails with citation ', () => {
  const { correspondenceAddress: _address, ...base } = request;
  const saved = {
    ...base,
    changeType: 'PAYMENT_FREQUENCY',
    paymentFrequency: 'ANNUAL',
  };
  const rule = {
    ...citation,
    changeType: 'PAYMENT_FREQUENCY',
    value: {
      kind: 'CHECK',
      field: 'paymentFrequency',
      allowedValues: ['MONTHLY', 'ANNUAL'],
    },
  };
  expect(decideEligibility(policy, saved, available(rule)).outcome).toBe(
    'CAN_PROCEED',
  );
  expect(
    decideEligibility(
      policy,
      { ...saved, paymentFrequency: 'QUARTERLY' },
      available(rule),
    ),
  ).toMatchObject({
    outcome: 'CANNOT_PROCEED',
    reasonCodes: ['RULE_CHECK_FAILED'],
    citations: [
      { kind: 'POLICY', sourceId: 'POLICY-WORDING' },
      { kind: 'RULE', ruleId: 'ADDRESS-RULE' },
    ],
  });
});
it('FR-08 rider: underwriting referral cannot be cleared ', () => {
  const { correspondenceAddress: _address, ...base } = request;
  const saved = {
    ...base,
    changeType: 'ACCIDENTAL_DEATH_RIDER',
    riderAction: 'ADD',
  };
  const rule = {
    ...citation,
    changeType: 'ACCIDENTAL_DEATH_RIDER',
    value: { kind: 'REFERRAL', reason: 'underwriting' },
  };
  expect(decideEligibility(policy, saved, available(rule))).toMatchObject({
    outcome: 'NEEDS_REVIEW',
    reasonCodes: ['RIDER_UNDERWRITING'],
  });
});
it('FR-08 evidence: unresolved rules refer; missing receipt does not block eligible', () => {
  for (const status of ['MISSING', 'CONFLICTING', 'UNAVAILABLE'])
    expect(
      decideEligibility(policy, request, {
        status,
        sourceIds: ['SRC'],
        citations: [],
      }),
    ).toMatchObject({
      outcome: 'NEEDS_REVIEW',
      reasonCodes: [`RULE_${status}`],
    });
  expect(decideEligibility(policy, request, available(citation))).toMatchObject(
    { outcome: 'CAN_PROCEED', reasonCodes: [] },
  );
  expect(
    decideEligibility(
      { ...policy, status: 'EXPIRED' },
      request,
      available(citation),
    ).reasonCodes,
  ).toContain('POLICY_EXPIRED');
  expect(
    decideEligibility(
      policy,
      { ...request, requestedEffectiveDate: '2026-02-30' },
      available(citation),
    ).reasonCodes,
  ).toContain('INVALID_EFFECTIVE_DATE');
});
