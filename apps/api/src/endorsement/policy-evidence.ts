import { encodeQuery, ENCODER_VERSION } from '../../../ai/retrieval.js';
import type { Policy } from '../auth/data.js';
import {
  equalFact,
  matchesPolicyFactsSnapshot,
  reconcileEvidence,
} from '../evidence.js';
import type { database } from '../db.js';

export type PolicyCitation = {
  kind: 'POLICY';
  sourceId: string;
  version: string;
  sectionId: string;
  excerpt: string;
};
export type PolicyEvidence = {
  status: 'AVAILABLE' | 'MISSING' | 'STALE' | 'CONFLICTING' | 'UNAVAILABLE';
  citations: PolicyCitation[];
  source?: { sourceId: string; version: string };
};
export type PolicyEvidenceStore = Pick<
  ReturnType<typeof database>,
  'evidenceDocument' | 'rankedEvidence'
>;

const queryByChange = {
  ADDRESS: 'policy status effective dates',
  BENEFICIARY: 'policy beneficiaries status effective dates',
  PAYMENT_FREQUENCY: 'policy payment frequency status effective dates',
  ACCIDENTAL_DEATH_RIDER: 'policy status effective dates',
} as const;

export async function retrievePolicyEvidence(
  store: PolicyEvidenceStore,
  policy: Policy,
  changeType: keyof typeof queryByChange,
): Promise<PolicyEvidence> {
  const document = await store.evidenceDocument(policy.id);
  if (!document) return { status: 'MISSING', citations: [] };
  const source = { sourceId: document.id, version: document.version };
  if (
    document.encoder_version !== ENCODER_VERSION ||
    document.sections.some(
      (section) => section.encoderVersion !== ENCODER_VERSION,
    )
  )
    return { status: 'STALE', citations: [], source };
  if (!matchesPolicyFactsSnapshot(policy, document.facts_snapshot))
    return { status: 'STALE', citations: [], source };
  const discrepancy = reconcileEvidence(policy, document.sections);
  if (discrepancy)
    return {
      status:
        discrepancy === 'CONFLICTING_EVIDENCE' ? 'CONFLICTING' : 'MISSING',
      citations: [],
      source,
    };
  const vector = encodeQuery(queryByChange[changeType]);
  if (!vector) return { status: 'UNAVAILABLE', citations: [], source };
  const ranked = await store.rankedEvidence(policy.id, document.id, vector, 4);
  if (!ranked.length) return { status: 'STALE', citations: [], source };
  const citations: PolicyCitation[] = [];
  for (const section of ranked) {
    if (
      section.document_id !== document.id ||
      section.version !== document.version ||
      !document.sections.some(
        (original) =>
          original.sectionId === section.section_id &&
          original.excerpt === section.excerpt &&
          equalFact(original.value, section.fact_value),
      )
    )
      return { status: 'CONFLICTING', citations: [], source };
    citations.push({
      kind: 'POLICY',
      sourceId: document.id,
      version: document.version,
      sectionId: section.section_id,
      excerpt: section.excerpt,
    });
  }
  return { status: 'AVAILABLE', citations, source };
}
