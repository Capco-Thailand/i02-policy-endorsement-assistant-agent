'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useHistory } from '../lib/queries';
import { routes } from '../lib/routes';
import type { HistoryResult } from '../lib/api';

type HistoryEntry = HistoryResult['history'][number];
function changeSummary(change: HistoryEntry['requestedChange']): string {
  switch (change.changeType) {
    case 'ADDRESS':
      return 'Correspondence address change';
    case 'BENEFICIARY':
      return 'Beneficiary change';
    case 'PAYMENT_FREQUENCY':
      return `Payment frequency · Requested ${change.paymentFrequency
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase())}`;
    case 'ACCIDENTAL_DEATH_RIDER':
      return `Accidental death rider · Requested ${change.riderAction === 'ADD' ? 'add' : 'remove'}`;
  }
}

function HistoryList({ entries }: { entries: HistoryEntry[] }) {
  return (
    <section className="history-section" aria-labelledby="history-heading">
      <div className="history-section-head">
        <h2 id="history-heading">Approved decisions</h2>
        <span>
          {entries.length} {entries.length === 1 ? 'record' : 'records'}
        </span>
      </div>
      <ol className="history-list">
        {entries.map((entry) => (
          <li className="history-item" key={entry.proposalId}>
            <div className="history-item-main">
              <h3>{changeSummary(entry.requestedChange)}</h3>
              <p className="history-policy">
                {entry.policyLabel} · {entry.policyId}
              </p>
              <p className="history-request">
                Request ID: <span>{entry.requestedChange.id}</span>
              </p>
              <Link
                href={routes.proposal(entry.policyId, entry.proposalId)}
                aria-label={`View recorded proposal for ${entry.policyLabel}, request ${entry.requestedChange.id}`}
              >
                View recorded proposal
              </Link>
            </div>
            <div className="history-meta">
              <strong>Approved</strong>
              <time dateTime={entry.decidedAt}>
                {new Intl.DateTimeFormat('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'Asia/Bangkok',
                }).format(new Date(entry.decidedAt))}
              </time>
            </div>
          </li>
        ))}
      </ol>
      <p className="history-note">
        Rejected decisions remain on their recorded proposal detail; they are
        not listed here.
      </p>
    </section>
  );
}

export function ChangeHistory() {
  const query = useHistory();
  const client = useQueryClient();
  useEffect(() => {
    if (query.error?.message === 'UNAUTHORIZED') {
      client.clear();
    }
  }, [query.error, client]);
  return (
    <main className="policy-shell history-shell">
      <p className="auth-kicker">Your account / Decision history</p>
      <Link className="policy-back" href={routes.policies}>
        <span aria-hidden="true">←</span> Back to policies
      </Link>
      <h1>Customer change history</h1>
      <p>Find the proposals you approved for your synthetic policies.</p>
      <p className="history-boundary">
        Approval records your decision on a synthetic proposal. Your policy and
        coverage did not change.
      </p>
      {query.isPending ? (
        <section className="history-state" role="status">
          <h2>Loading your change history…</h2>
          <p>Checking your approved decisions.</p>
        </section>
      ) : query.isError ? (
        query.error.message === 'UNAUTHORIZED' ? (
          <section className="history-state" role="alert">
            <h2>Session ended</h2>
            <p>Sign in again to view your approved decisions.</p>
            <Link href={`${routes.signIn}?ended=1`}>Sign in again</Link>
          </section>
        ) : (
          <section className="history-state" role="alert">
            <h2>History unavailable</h2>
            <p>We could not load your change history. Try again.</p>
            <Button
              variant="outline"
              type="button"
              onClick={() => void query.refetch()}
            >
              Try again
            </Button>
          </section>
        )
      ) : query.data.history.length ? (
        <HistoryList entries={query.data.history} />
      ) : (
        <section className="history-state history-empty">
          <h2>No approved decisions yet</h2>
          <p>
            When you approve a synthetic proposal, its record will appear here.
            Rejected decisions remain on their proposal detail.
          </p>
          <Link href={routes.policies}>View your policies</Link>
        </section>
      )}
    </main>
  );
}
