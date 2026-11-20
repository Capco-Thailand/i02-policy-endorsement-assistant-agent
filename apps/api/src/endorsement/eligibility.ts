import { Value } from '@sinclair/typebox/value';
import type { Policy } from '../auth/data.js';
import {
  RequestRecordSchema,
  validAllocation,
  validDate,
  type RequestRecord,
} from './schema.js';

export type EligibilityOutcome = 'ELIGIBLE' | 'INELIGIBLE' | 'REFERRED';
export type EligibilityResult = {
  outcome: EligibilityOutcome;
  reasonCodes: string[];
  reasons: string[];
  nextStep: string;
  sourceIds: string[];
  citations: {
    sourceId: string;
    ruleId: string;
    version: number;
    sectionId: string;
  }[];
};
type Citation = {
  sourceId: string;
  ruleId: string;
  version: number;
  sectionId: string;
  role: string;
  changeType: string;
  effectiveFrom: string;
  effectiveTo: string;
  value: unknown;
};
type Rules = { status: string; sourceIds: string[]; citations: Citation[] };
const result = (
  outcome: EligibilityOutcome,
  reasonCode: string,
  reason: string,
  nextStep: string,
  sourceIds: string[] = [],
  citations: EligibilityResult['citations'] = [],
): EligibilityResult => ({
  outcome,
  reasonCodes: reasonCode ? [reasonCode] : [],
  reasons: reason ? [reason] : [],
  nextStep,
  sourceIds,
  citations,
});
const invalid = (code: string, reason: string) =>
  result('INELIGIBLE', code, reason, 'Correct and record a new request.');
const referred = (
  code: string,
  reason: string,
  sourceIds: string[] = [],
  citations: EligibilityResult['citations'] = [],
) =>
  result(
    'REFERRED',
    code,
    reason,
    'Automatic quote and proposal creation are paused. A person must review this outside the prototype.',
    sourceIds,
    citations,
  );
const hasOnly = (value: object, keys: string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));

export function decideEligibility(
  policy: Policy,
  rawRequest: unknown,
  rules: Rules,
  hasReceipt: boolean,
): EligibilityResult {
  if (!Value.Check(RequestRecordSchema, rawRequest))
    return invalid(
      'INVALID_REQUEST',
      'The recorded request has invalid fields.',
    );
  const request = rawRequest as RequestRecord;
  if (
    request.policyId !== policy.id ||
    request.requesterId !== policy.customerId
  )
    return invalid(
      'REQUEST_MISMATCH',
      'The recorded request does not match this policy.',
    );
  if (!validDate(request.requestedEffectiveDate))
    return invalid(
      'INVALID_EFFECTIVE_DATE',
      'The requested effective date is invalid.',
    );
  if (
    policy.status !== 'ACTIVE' ||
    request.requestedEffectiveDate < policy.effectiveDate ||
    request.requestedEffectiveDate > policy.expiryDate
  )
    return invalid(
      'POLICY_EXPIRED',
      'The policy is not active on the requested date.',
    );
  if (request.changeType === 'ADDRESS' && !request.correspondenceAddress.trim())
    return invalid(
      'INVALID_ADDRESS',
      'Enter a complete correspondence address.',
    );
  if (
    request.changeType === 'BENEFICIARY' &&
    (!validAllocation(request) ||
      request.beneficiaries.some((item) => !item.name.trim()))
  )
    return invalid(
      'INVALID_BENEFICIARIES',
      'Enter named beneficiaries with allocations totaling 100%.',
    );
  if (rules.status !== 'AVAILABLE')
    return referred(
      `RULE_${rules.status}`,
      'Applicable rules need human review.',
      rules.sourceIds,
    );
  const selected = rules.citations.filter((item) => item.role === 'RULE');
  const guidance = rules.citations.filter((item) => item.role === 'GUIDANCE');
  if (
    !selected.length ||
    guidance.length !== selected.length ||
    rules.citations.length !== selected.length * 2
  )
    return referred(
      'INCOMPLETE_RULE',
      'Applicable rules need human review.',
      rules.sourceIds,
    );
  const citations = selected.map(
    ({ sourceId, ruleId, version, sectionId }) => ({
      sourceId,
      ruleId,
      version,
      sectionId,
    }),
  );
  for (const rule of selected) {
    if (
      !rule.sourceId ||
      !rule.ruleId ||
      !Number.isInteger(rule.version) ||
      !rule.sectionId ||
      rule.changeType !== request.changeType ||
      rule.effectiveFrom > request.requestedEffectiveDate ||
      rule.effectiveTo < request.requestedEffectiveDate ||
      !rules.sourceIds.includes(rule.sourceId)
    )
      return referred(
        'INCOMPLETE_RULE',
        'Applicable rules need human review.',
        rules.sourceIds,
      );
    const value = rule.value;
    if (!value || typeof value !== 'object' || !('kind' in value))
      return referred(
        'UNKNOWN_RULE',
        'Applicable rules need human review.',
        rules.sourceIds,
      );
    if (
      value.kind === 'REFERRAL' &&
      request.changeType === 'ACCIDENTAL_DEATH_RIDER' &&
      hasOnly(value, ['kind', 'reason']) &&
      'reason' in value &&
      typeof value.reason === 'string'
    )
      return referred(
        'RIDER_UNDERWRITING',
        'Rider change needs human review. Real underwriting or health disclosure may be needed outside this prototype.',
        rules.sourceIds,
        citations,
      );
    if (value.kind !== 'CHECK')
      return referred(
        'UNKNOWN_RULE',
        'Applicable rules need human review.',
        rules.sourceIds,
      );
    if (
      request.changeType === 'ADDRESS' &&
      hasOnly(value, ['kind', 'field', 'requirement']) &&
      'field' in value &&
      value.field === 'address' &&
      'requirement' in value &&
      value.requirement === 'complete new mailing address'
    )
      continue;
    if (
      request.changeType === 'BENEFICIARY' &&
      hasOnly(value, ['kind', 'field', 'requirement']) &&
      'field' in value &&
      value.field === 'beneficiaries' &&
      'requirement' in value &&
      value.requirement === 'named beneficiaries and allocations total 100%'
    )
      continue;
    if (
      request.changeType === 'PAYMENT_FREQUENCY' &&
      hasOnly(value, ['kind', 'field', 'allowedValues']) &&
      'field' in value &&
      value.field === 'paymentFrequency' &&
      'allowedValues' in value &&
      Array.isArray(value.allowedValues) &&
      value.allowedValues.length === 2 &&
      value.allowedValues.includes('MONTHLY') &&
      value.allowedValues.includes('ANNUAL')
    ) {
      if (!value.allowedValues.includes(request.paymentFrequency))
        return result(
          'INELIGIBLE',
          'RULE_CHECK_FAILED',
          'Payment frequency is not allowed by the cited rule.',
          'Record a new request with an allowed payment frequency.',
          rules.sourceIds,
          citations,
        );
      continue;
    }
    return referred(
      'UNKNOWN_RULE',
      'Applicable rules need human review.',
      rules.sourceIds,
    );
  }
  for (const item of guidance) {
    if (
      !item.sourceId ||
      !item.ruleId ||
      !Number.isInteger(item.version) ||
      !item.sectionId ||
      !selected.some(
        (rule) =>
          rule.sourceId === item.sourceId &&
          rule.ruleId === item.ruleId &&
          rule.version === item.version,
      )
    )
      return referred(
        'INCOMPLETE_RULE',
        'Applicable rules need human review.',
        rules.sourceIds,
      );
    const value = item.value;
    if (
      !value ||
      typeof value !== 'object' ||
      !('kind' in value) ||
      (!(value.kind === 'NONE' && hasOnly(value, ['kind'])) &&
        !(
          value.kind === 'DOCUMENT' &&
          hasOnly(value, ['kind', 'documentType', 'handling']) &&
          'documentType' in value &&
          typeof value.documentType === 'string' &&
          'handling' in value &&
          value.handling === 'mock receipt only'
        ))
    )
      return referred(
        'UNKNOWN_GUIDANCE',
        'Document guidance needs human review.',
        rules.sourceIds,
      );
  }
  if (!hasReceipt)
    return result(
      'INELIGIBLE',
      'MISSING_RECEIPT',
      'Upload a synthetic file for this request.',
      'Upload a synthetic file, then check again.',
      rules.sourceIds,
      citations,
    );
  return result(
    'ELIGIBLE',
    '',
    '',
    'Eligible to continue to a mock quote. No policy has changed.',
    rules.sourceIds,
    citations,
  );
}
