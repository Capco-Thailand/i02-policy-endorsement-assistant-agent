'use client';

import Link from 'next/link';
import { useEvidence } from '../lib/queries';
import { routes } from '../lib/routes';

const reasons = {
  missing: 'No current synthetic source document is available for this policy.',
  stale: 'The synthetic source document is out of date.',
  conflicting: 'The synthetic source conflicts with the policy facts above.',
  no_relevant_section: 'No relevant section was found in the synthetic source.',
} as const;

export function EvidenceSection({ policyId }: { policyId: string }) {
  const query = useEvidence(policyId);
  return (
    <section
      className="policy-section evidence-section"
      aria-labelledby="evidence-heading"
    >
      <h2 id="evidence-heading">Synthetic policy evidence</h2>
      <p>
        Mock source documents explain policy details. The policy facts above
        remain the record of truth.
      </p>
      {query.isPending ? (
        <p role="status">Loading policy evidence…</p>
      ) : query.isError && query.error.message === 'UNAUTHORIZED' ? (
        <p role="alert">
          Your session has ended.{' '}
          <Link href={routes.signIn}>Sign in again</Link> to view policy
          evidence.
        </p>
      ) : query.isError ? (
        <div role="status" aria-live="polite">
          <p>Policy evidence is temporarily unavailable.</p>
          <button
            type="button"
            className="policy-retry"
            onClick={() => void query.refetch()}
          >
            Try again
          </button>
        </div>
      ) : query.data.evidence.status === 'unresolved' ? (
        <div role="status" aria-live="polite">
          <p>Evidence unresolved: {reasons[query.data.evidence.reason]}</p>
          <button
            type="button"
            className="policy-retry"
            onClick={() => void query.refetch()}
          >
            Retry evidence
          </button>
        </div>
      ) : (
        <div role="status" aria-live="polite">
          <p>Matches policy facts.</p>
          <ul className="evidence-list">
            {query.data.evidence.citations.map((citation) => (
              <li
                className="evidence-card"
                key={`${citation.documentId}:${citation.version}:${citation.sectionId}`}
              >
                <strong>{citation.title}</strong>
                <p>
                  Document {citation.documentId} · Version {citation.version} ·
                  Section {citation.sectionId}
                </p>
                <p>{citation.excerpt}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
