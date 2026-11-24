import { describe, expect, it } from 'vitest';
import corpus from '../../ai/corpus/policies.json' with { type: 'json' };
import { ENCODER_VERSION } from '../../ai/retrieval.js';
import { policyTerms } from './policy-terms.js';
import type { Policy } from './auth/data.js';

const policy: Policy = {
  id: 'POL-NARIN-001',
  customerId: 'CUS-001',
  label: 'Family Protection Plan',
  status: 'ACTIVE',
  effectiveDate: '2025-01-01',
  expiryDate: '2035-12-31',
  paymentFrequency: 'MONTHLY',
  beneficiaries: [],
  productTerms: {
    insurer: 'Example Mutual (Synthetic)',
    type: 'Life',
    name: 'Family Protection Plan',
    version: 'v1',
  },
  coverageTerms: [
    {
      id: 'coverage.life',
      name: 'Life benefit',
      amount: 1000000,
      currency: 'THB',
    },
  ],
  exclusionTerms: [
    {
      id: 'exclusions.life',
      text: 'The life benefit does not cover death caused by intentional self-injury.',
    },
  ],
};
const source = corpus[0];
const document = {
  id: source.documentId,
  product_id: source.productId,
  title: source.title,
  version: source.version,
  encoder_version: ENCODER_VERSION,
  facts_snapshot: Object.fromEntries(
    source.sections.map((s) => [
      s.concept === 'coverage' || s.concept === 'exclusions' ? s.id : s.concept,
      s.value,
    ]),
  ),
  sections: source.sections.map((s) => ({
    sectionId: s.id,
    concept: s.concept,
    value: s.value,
    excerpt: s.excerpt,
    encoderVersion: ENCODER_VERSION,
  })),
};

describe('FR-14 policy term reconciliation', () => {
  it('confirms only exact versioned product, amount, and exclusion evidence', () => {
    const terms = policyTerms(policy, document);
    expect(terms.product.status).toBe('confirmed');
    expect(terms.coverages[0]).toMatchObject({
      status: 'confirmed',
      value: { amount: 1000000 },
      citation: { sectionId: 'coverage.life', version: 'v1' },
    });
    expect(terms.exclusions[0].status).toBe('confirmed');
  });
  it('keeps unrelated terms confirmed when one amount conflicts', () => {
    const changed = {
      ...document,
      sections: document.sections.map((s) =>
        s.sectionId === 'coverage.life'
          ? {
              ...s,
              value: { name: 'Life benefit', amount: 900000, currency: 'THB' },
            }
          : s,
      ),
    };
    const terms = policyTerms(policy, changed);
    expect(terms.coverages[0].status).toBe('unresolved');
    expect(terms.product.status).toBe('confirmed');
    expect(terms.exclusions[0].status).toBe('confirmed');
  });
  it('marks missing and stale evidence unresolved', () => {
    expect(policyTerms(policy, undefined).product.status).toBe('unresolved');
    expect(
      policyTerms(policy, {
        ...document,
        sections: document.sections.filter(
          (s) => s.sectionId !== 'coverage.life',
        ),
      }).coverages[0],
    ).toMatchObject({ status: 'unresolved', reason: 'MISSING_SECTION' });
    expect(
      policyTerms(policy, { ...document, encoder_version: 'old' }).coverages[0],
    ).toMatchObject({ status: 'unresolved', reason: 'STALE_ENCODER' });
  });
  it('does not confirm missing structured terms or drifted source identity and concept', () => {
    const missing = policyTerms({ ...policy, coverageTerms: null }, document);
    expect(missing.coverages[0]).toMatchObject({
      status: 'unresolved',
      reason: 'CONFLICTING_EVIDENCE',
    });
    expect(missing.coverages[0]).not.toHaveProperty('value');
    expect(
      policyTerms(policy, { ...document, product_id: 'OTHER_PRODUCT' }).product,
    ).toMatchObject({ status: 'unresolved', reason: 'STALE_DOCUMENT' });
    expect(
      policyTerms(policy, { ...document, title: 'Other title' }).product,
    ).toMatchObject({ status: 'unresolved', reason: 'STALE_DOCUMENT' });
    expect(
      policyTerms(policy, {
        ...document,
        sections: document.sections.map((section) =>
          section.sectionId === 'coverage.life'
            ? { ...section, concept: 'exclusions' }
            : section,
        ),
      }).coverages[0],
    ).toMatchObject({ status: 'unresolved', reason: 'CONFLICTING_EVIDENCE' });
  });
});
