'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useHistory } from '../lib/queries';
import { routes } from '../lib/routes';
import type { HistoryResult } from '../lib/api';

type HistoryEntry = HistoryResult['history'][number];
function changeSummary(change: HistoryEntry['requestedChange']): string {
  switch (change.changeType) {
    case 'ADDRESS':
      return `Correspondence address: ${change.correspondenceAddress}`;
    case 'BENEFICIARY':
      return `Beneficiaries: ${change.beneficiaries.map(({ name, allocationPercent }) => `${name} ${allocationPercent}%`).join(', ')}`;
    case 'PAYMENT_FREQUENCY':
      return `Payment frequency: ${change.paymentFrequency
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase())}`;
    case 'ACCIDENTAL_DEATH_RIDER':
      return `Accidental death rider: ${change.riderAction === 'ADD' ? 'Add' : 'Remove'}`;
  }
}

function HistoryList({ entries }: { entries: HistoryEntry[] }) {
  return (
    <section className="history-section" aria-labelledby="history-heading">
      <h2 id="history-heading">Approved changes</h2>
      <ol className="history-list">
        {entries.map((entry) => (
          <li className="history-item" key={entry.proposalId}>
            <div>
              <h3>{changeSummary(entry.requestedChange)}</h3>
              <p>
                {entry.policyLabel} · {entry.policyId}
              </p>
              <Link
                href={routes.proposal(entry.policyId, entry.proposalId)}
                aria-label={`View recorded proposal for ${entry.policyLabel}, approved ${new Date(entry.decidedAt).toLocaleString()}`}
              >
                View recorded proposal
              </Link>
            </div>
            <div className="history-meta">
              <strong>{entry.status}</strong>
              <time dateTime={entry.decidedAt}>
                {new Date(entry.decidedAt).toLocaleString()}
              </time>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ChangeHistory() {
  const query = useHistory();
  const client = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    if (query.error?.message === 'UNAUTHORIZED') {
      client.clear();
      router.replace(`${routes.signIn}?ended=1`);
    }
  }, [query.error, client, router]);
  return (
    <main className="policy-shell history-shell">
      <Link className="policy-back" href={routes.policies}>
        ← Back to policies
      </Link>
      <p className="auth-kicker">Your account</p>
      <h1>Customer change history</h1>
      <p>Approved proposals recorded for your synthetic policies.</p>
      {query.isPending ? (
        <p role="status">Loading your change history…</p>
      ) : query.isError ? (
        query.error.message === 'UNAUTHORIZED' ? null : (
          <section role="alert">
            <h2>History unavailable</h2>
            <p>We could not load your change history. Try again.</p>
            <button
              className="policy-retry"
              type="button"
              onClick={() => void query.refetch()}
            >
              Try again
            </button>
          </section>
        )
      ) : query.data.history.length ? (
        <HistoryList entries={query.data.history} />
      ) : (
        <section className="history-empty">
          <h2>No approved changes yet</h2>
          <p>
            Your approved changes will appear here after you record a decision.
          </p>
          <Link href={routes.policies}>View your policies</Link>
        </section>
      )}
      <p className="history-boundary">
        These are records of your decisions on synthetic proposals. The
        underlying policy and coverage stay unchanged.
      </p>
    </main>
  );
}
