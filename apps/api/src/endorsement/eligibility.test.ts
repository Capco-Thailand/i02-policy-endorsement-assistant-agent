import { expect, it } from 'vitest';
import { decideEligibility } from './eligibility.js';
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

it('FR-08 address: an owned active saved request with cited CHECK and own receipt is eligible', () => {
  expect(
    decideEligibility(
      policy,
      request,
      {
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
      },
      true,
    ),
  ).toMatchObject({ outcome: 'ELIGIBLE', reasonCodes: [] });
});

it('FR-08 unknown values: extra structured rule fields require referral', () => {
  expect(
    decideEligibility(
      policy,
      request,
      {
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
      },
      true,
    ).outcome,
  ).toBe('REFERRED');
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
  expect(decideEligibility(policy, saved, available(rule), true).outcome).toBe(
    'ELIGIBLE',
  );
  expect(
    decideEligibility(
      policy,
      { ...saved, beneficiaries: [{ name: ' ', allocationPercent: 100 }] },
      available(rule),
      true,
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
      true,
    ).reasonCodes,
  ).toContain('INVALID_BENEFICIARIES');
});
it('FR-08 payment: allowed value passes; disallowed value fails with citation before receipt', () => {
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
  expect(decideEligibility(policy, saved, available(rule), true).outcome).toBe(
    'ELIGIBLE',
  );
  expect(
    decideEligibility(
      policy,
      { ...saved, paymentFrequency: 'QUARTERLY' },
      available(rule),
      false,
    ),
  ).toMatchObject({
    outcome: 'INELIGIBLE',
    reasonCodes: ['RULE_CHECK_FAILED'],
    citations: [{ ruleId: 'ADDRESS-RULE' }],
  });
});
it('FR-08 rider: underwriting referral cannot be cleared by a mock receipt', () => {
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
  expect(decideEligibility(policy, saved, available(rule), true)).toMatchObject(
    { outcome: 'REFERRED', reasonCodes: ['RIDER_UNDERWRITING'] },
  );
});
it('FR-08 evidence and receipt: unresolved rules refer; missing own receipt blocks eligible', () => {
  for (const status of ['MISSING', 'CONFLICTING', 'UNAVAILABLE'])
    expect(
      decideEligibility(
        policy,
        request,
        { status, sourceIds: ['SRC'], citations: [] },
        true,
      ),
    ).toMatchObject({ outcome: 'REFERRED', reasonCodes: [`RULE_${status}`] });
  expect(
    decideEligibility(policy, request, available(citation), false),
  ).toMatchObject({ outcome: 'INELIGIBLE', reasonCodes: ['MISSING_RECEIPT'] });
  expect(
    decideEligibility(
      { ...policy, status: 'EXPIRED' },
      request,
      available(citation),
      true,
    ).reasonCodes,
  ).toContain('POLICY_EXPIRED');
  expect(
    decideEligibility(
      policy,
      { ...request, requestedEffectiveDate: '2026-02-30' },
      available(citation),
      true,
    ).reasonCodes,
  ).toContain('INVALID_EFFECTIVE_DATE');
});
