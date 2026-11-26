'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useEvidence } from '../lib/queries';
import { routes } from '../lib/routes';

const DEFAULT_QUERY = 'When does protection begin?';
const reasons = {
  UNKNOWN_QUERY: 'This question is outside the supported policy facts.',
  MISSING_DOCUMENT: 'The synthetic policy document is missing.',
  MISSING_SECTION: 'A required policy section is missing.',
  STALE_DOCUMENT: 'The synthetic policy document is out of date.',
  STALE_ENCODER: 'The evidence index is out of date.',
  CONFLICTING_EVIDENCE: 'The synthetic evidence conflicts with policy facts.',
};

export function EvidenceSection({ policyId }: { policyId: string }) {
  const query = useEvidence(policyId, DEFAULT_QUERY);
  const client = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    if (query.error?.message === 'UNAUTHORIZED') {
      client.clear();
      router.replace(`${routes.signIn}?ended=1`);
    }
  }, [query.error, client, router]);

  const retry = (
    <Button
      type="button"
      variant="outline"
      onClick={() => void query.refetch()}
    >
      Retry evidence
    </Button>
  );

  return (
    <section
      className="policy-section evidence-section"
      aria-labelledby="evidence-heading"
    >
      <h2 id="evidence-heading">Policy evidence</h2>
      <p>
        Source wording explains these policy details. The policy facts above
        remain the record of truth.
      </p>
      {query.isPending ? (
        <p role="status" aria-live="polite">
          Loading policy evidence…
        </p>
      ) : query.isError ? (
        query.error.message === 'UNAUTHORIZED' ? (
          <p role="alert">
            Your session ended. <Link href={routes.signIn}>Sign in again</Link>.
          </p>
        ) : (
          <div role="status" aria-live="polite">
            <p>Policy evidence is temporarily unavailable</p>
            {retry}
          </div>
        )
      ) : query.data.status === 'unresolved' ? (
        <div role="status" aria-live="polite">
          <p>{reasons[query.data.reason]}</p>
          {retry}
        </div>
      ) : (
        <div role="status" aria-live="polite">
          <p className="evidence-match">{query.data.match}</p>
          <ul className="evidence-list">
            {query.data.citations.map((citation) => (
              <li
                className="evidence-card"
                key={`${citation.sourceId}:${citation.sectionId}`}
              >
                <strong>{citation.title}</strong>
                <p className="evidence-meta">
                  Source {citation.sourceId} · Version {citation.version} ·
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
