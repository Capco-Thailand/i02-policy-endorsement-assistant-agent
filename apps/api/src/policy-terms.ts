import { ENCODER_VERSION } from '../../ai/retrieval.js';
import type { Policy } from './auth/data.js';
import { equalFact } from './evidence.js';

interface Section {
  sectionId: string;
  concept: string;
  value: unknown;
  excerpt: string;
  encoderVersion: string;
}
interface Document {
  id: string;
  product_id: string;
  title: string;
  version: string;
  encoder_version: string;
  facts_snapshot: unknown;
  sections: Section[];
}
type Reason =
  | 'MISSING_DOCUMENT'
  | 'MISSING_SECTION'
  | 'STALE_DOCUMENT'
  | 'STALE_ENCODER'
  | 'CONFLICTING_EVIDENCE';
export interface Citation {
  sourceId: string;
  title: string;
  version: string;
  sectionId: string;
  excerpt: string;
}
export type Term<T> =
  | { status: 'confirmed'; value: T; citation: Citation }
  | { status: 'unresolved'; reason: Reason; citation?: Citation };

const expectedProducts: Record<string, string> = {
  'POL-NARIN-001': 'FAMILY_PROTECTION',
  'POL-MALI-001': 'SECURE_FUTURE',
  'POL-NARIN-002': 'CLASSIC_LIFE',
};

const expectedIds = (policyId: string, prefix: 'coverage' | 'exclusions') => [
  `${prefix}.life`,
  ...(policyId === 'POL-NARIN-001' ? [`${prefix}.accidental-death`] : []),
];

export function policyTerms(policy: Policy, document: Document | undefined) {
  const item = <T>(id: string, value: T, excerpt: string): Term<T> => {
    if (!document) return { status: 'unresolved', reason: 'MISSING_DOCUMENT' };
    const matches = document.sections.filter(
      (section) => section.sectionId === id,
    );
    const section = matches[0];
    const citation =
      section && document.version === 'v1'
        ? {
            sourceId: document.id,
            title: document.title,
            version: document.version,
            sectionId: id,
            excerpt: section.excerpt,
          }
        : undefined;
    const reason: Reason | undefined =
      document.version !== 'v1' ||
      document.id !== `${policy.id}:v1` ||
      document.product_id !== expectedProducts[policy.id] ||
      document.title !== `${policy.label} synthetic policy`
        ? 'STALE_DOCUMENT'
        : matches.length === 0
          ? 'MISSING_SECTION'
          : document.encoder_version !== ENCODER_VERSION ||
              section.encoderVersion !== ENCODER_VERSION
            ? 'STALE_ENCODER'
            : matches.length !== 1 ||
                section.concept !==
                  (id === 'product'
                    ? 'product'
                    : id.startsWith('coverage.')
                      ? 'coverage'
                      : 'exclusions') ||
                value == null ||
                !equalFact(section.value, value) ||
                section.excerpt !== excerpt ||
                !equalFact(
                  (document.facts_snapshot as Record<string, unknown> | null)?.[
                    id
                  ],
                  value,
                )
              ? 'CONFLICTING_EVIDENCE'
              : undefined;
    if (reason)
      return {
        status: 'unresolved',
        reason,
        ...(citation ? { citation } : {}),
      };
    if (!citation) return { status: 'unresolved', reason: 'MISSING_SECTION' };
    return { status: 'confirmed', value, citation };
  };
  const product = policy.productTerms;
  const productTerm = item(
    'product',
    product,
    `Example Mutual (Synthetic) Life product ${product?.name} version v1.`,
  );
  return {
    product: productTerm,
    coverages: expectedIds(policy.id, 'coverage').map((id) => {
      const coverage = policy.coverageTerms?.find((term) => term.id === id);
      return {
        id,
        ...item(
          id,
          coverage && {
            name: coverage.name,
            amount: coverage.amount,
            currency: coverage.currency,
          },
          coverage
            ? `${coverage.name}: ${coverage.currency} ${coverage.amount.toLocaleString('en-US')}.`
            : '',
        ),
      };
    }),
    exclusions: expectedIds(policy.id, 'exclusions').map((id) => {
      const exclusion = policy.exclusionTerms?.find((term) => term.id === id);
      return { id, ...item(id, exclusion?.text, exclusion?.text ?? '') };
    }),
  };
}
