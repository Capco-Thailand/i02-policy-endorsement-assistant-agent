import type { Policy } from './auth/data.js';
import {
  relevantSections,
  type SourceDocument,
  type SourceSection,
} from '../../ai/retrieval.js';

export type Evidence =
  | {
      status: 'available';
      citations: {
        documentId: string;
        version: string;
        sectionId: string;
        title: string;
        excerpt: string;
      }[];
    }
  | {
      status: 'unresolved';
      reason: 'missing' | 'stale' | 'conflicting' | 'no_relevant_section';
      citations: [];
    };

const same = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);
function matches(policy: Policy, section: SourceSection): boolean {
  const expected: Record<string, unknown> = {
    status: policy.status,
    effectiveDate: policy.effectiveDate,
    expiryDate: policy.expiryDate,
    paymentFrequency: policy.paymentFrequency,
    beneficiaries: policy.beneficiaries,
  };
  const required: Record<SourceSection['topic'], string[]> = {
    status: ['status'],
    dates: ['effectiveDate', 'expiryDate'],
    payment: ['paymentFrequency'],
    beneficiaries: ['beneficiaries'],
  };
  return (
    required[section.topic].every(
      (field) =>
        Object.hasOwn(section.fields, field) &&
        same(section.fields[field], expected[field]),
    ) && excerptMatches(policy, section)
  );
}
function excerptMatches(policy: Policy, section: SourceSection): boolean {
  const text = section.excerpt;
  if (section.topic === 'dates') {
    const dates = text.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? [];
    return (
      dates.length === 2 &&
      dates[0] === policy.effectiveDate &&
      dates[1] === policy.expiryDate
    );
  }
  if (section.topic === 'status') {
    const words = text.toUpperCase().match(/\b(ACTIVE|EXPIRED)\b/g) ?? [];
    return words.length === 1 && words[0] === policy.status;
  }
  if (section.topic === 'payment') {
    const words = text.toUpperCase().match(/\b(MONTHLY|ANNUAL)\b/g) ?? [];
    return words.length === 1 && words[0] === policy.paymentFrequency;
  }
  const allocations = text.match(/\b\d+(?:\.\d+)?%/g) ?? [];
  return (
    allocations.length === policy.beneficiaries.length &&
    policy.beneficiaries.every((beneficiary) =>
      text.includes(`${beneficiary.name} at ${beneficiary.allocationPercent}%`),
    )
  );
}
export function evidenceFor(
  policy: Policy,
  document: SourceDocument | undefined,
  query: string,
): Evidence {
  if (!document)
    return { status: 'unresolved', reason: 'missing', citations: [] };
  if (!document.current)
    return { status: 'unresolved', reason: 'stale', citations: [] };
  const topics = new Set(document.sections.map((section) => section.topic));
  if (
    !(['status', 'dates', 'payment', 'beneficiaries'] as const).every((topic) =>
      topics.has(topic),
    )
  )
    return { status: 'unresolved', reason: 'missing', citations: [] };
  const selected = relevantSections(document.sections, query);
  if (selected.length === 0)
    return {
      status: 'unresolved',
      reason: 'no_relevant_section',
      citations: [],
    };
  if (document.sections.some((section) => !matches(policy, section)))
    return { status: 'unresolved', reason: 'conflicting', citations: [] };
  return {
    status: 'available',
    citations: selected.map((section) => ({
      documentId: document.documentId,
      version: document.version,
      sectionId: section.sectionId,
      title: document.title,
      excerpt: section.excerpt.slice(0, 240),
    })),
  };
}
