import type { Policy } from './auth/data.js';

export type EvidenceConcept = 'status' | 'dates' | 'payment' | 'beneficiaries';
export type UnresolvedReason =
  | 'UNKNOWN_QUERY'
  | 'MISSING_DOCUMENT'
  | 'MISSING_SECTION'
  | 'STALE_DOCUMENT'
  | 'STALE_ENCODER'
  | 'CONFLICTING_EVIDENCE';

export interface EvidenceSectionFact {
  sectionId: string;
  concept: string;
  value: unknown;
  excerpt?: string;
}

export function policyFacts(policy: Policy) {
  return {
    status: policy.status,
    dates: {
      effectiveDate: policy.effectiveDate,
      expiryDate: policy.expiryDate,
    },
    payment: policy.paymentFrequency,
    beneficiaries: policy.beneficiaries,
  };
}

export function equalFact(a: unknown, b: unknown): boolean {
  const canonical = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value !== null && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(value)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, item]) => [key, canonical(item)]),
      );
    return value;
  };
  return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
}

export function reconcileEvidence(
  policy: Policy,
  sections: EvidenceSectionFact[],
): UnresolvedReason | undefined {
  const expected = policyFacts(policy);
  for (const concept of Object.keys(expected) as EvidenceConcept[]) {
    const matching = sections.filter((section) => section.concept === concept);
    if (matching.length === 0) return 'MISSING_SECTION';
    if (
      matching.length !== 1 ||
      !equalFact(matching[0].value, expected[concept]) ||
      (matching[0].excerpt !== undefined &&
        !excerptAgrees(policy, concept, matching[0].excerpt))
    )
      return 'CONFLICTING_EVIDENCE';
  }
  return undefined;
}

function excerptAgrees(
  policy: Policy,
  concept: EvidenceConcept,
  excerpt: string,
): boolean {
  if (/\b(?:not|never|no)\b/i.test(excerpt)) return false;
  if (concept === 'status') {
    const active = /\bactive\b/i.test(excerpt);
    const expired = /\bexpired\b/i.test(excerpt);
    return policy.status === 'ACTIVE' ? active && !expired : expired && !active;
  }
  if (concept === 'dates') {
    const dates = excerpt.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? [];
    return (
      dates.length === 2 &&
      dates[0] === policy.effectiveDate &&
      dates[1] === policy.expiryDate
    );
  }
  if (concept === 'payment') {
    const monthly = /\bmonthly\b/i.test(excerpt);
    const annual = /\bannual(?:ly)?\b/i.test(excerpt);
    return policy.paymentFrequency === 'MONTHLY'
      ? monthly && !annual
      : annual && !monthly;
  }
  const percents = excerpt.match(/\b\d+(?:\.\d+)?%/g) ?? [];
  return (
    percents.length === policy.beneficiaries.length &&
    policy.beneficiaries.every(({ name, allocationPercent }) =>
      excerpt.includes(`${name} receives ${allocationPercent}%`),
    )
  );
}
