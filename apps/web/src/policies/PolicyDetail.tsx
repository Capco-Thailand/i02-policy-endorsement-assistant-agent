'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { PolicyDetail as Policy } from '../lib/api';
import { usePolicy } from '../lib/queries';
import { routes } from '../lib/routes';
import { FocusHeading } from './FocusHeading';

const date = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));

function PolicyFacts({ policy }: { policy: Policy }) {
  return (
    <section className="policy-section" aria-labelledby="facts-heading">
      <h2 id="facts-heading">Policy facts</h2>
      <dl className="policy-facts">
        <div>
          <dt>Effective date</dt>
          <dd>{date(policy.effectiveDate)}</dd>
        </div>
        <div>
          <dt>Expiry date</dt>
          <dd>{date(policy.expiryDate)}</dd>
        </div>
        <div>
          <dt>Payment frequency</dt>
          <dd>
            {policy.paymentFrequency === 'MONTHLY' ? 'Monthly' : 'Annual'}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function Beneficiaries({ policy }: { policy: Policy }) {
  return (
    <section className="policy-section" aria-labelledby="beneficiaries-heading">
      <h2 id="beneficiaries-heading">Current beneficiaries</h2>
      {policy.beneficiaries.length === 0 ? (
        <p>No beneficiaries are recorded for this policy.</p>
      ) : (
        <ul className="beneficiary-list">
          {policy.beneficiaries.map((beneficiary) => (
            <li key={beneficiary.name}>
              <strong>{beneficiary.name}</strong>
              <span>{beneficiary.allocationPercent}%</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function PolicyDetail({ policyId }: { policyId: string }) {
  const query = usePolicy(policyId);
  const client = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    if (query.error?.message === 'UNAUTHORIZED') {
      client.clear();
      router.replace(`${routes.signIn}?ended=1`);
    }
  }, [query.error, client, router]);
  if (query.isPending)
    return (
      <>
        <FocusHeading>Loading policy details…</FocusHeading>
        <p role="status">Loading policy…</p>
      </>
    );
  if (query.isError) {
    if (query.error.message === 'UNAUTHORIZED') return null;
    return (
      <>
        <Link className="policy-back" href={routes.policies}>
          ← Back to policies
        </Link>
        <FocusHeading>
          {query.error.message === 'NOT_FOUND'
            ? 'This policy is unavailable.'
            : 'Policy details unavailable'}
        </FocusHeading>
        {query.error.message === 'NOT_FOUND' ? (
          <p role="alert">This policy is unavailable.</p>
        ) : (
          <>
            <p role="alert">Could not load policy. Try again.</p>
            <button
              type="button"
              className="policy-retry"
              onClick={() => void query.refetch()}
            >
              Try again
            </button>
          </>
        )}
      </>
    );
  }
  const { policy } = query.data;
  return (
    <>
      <Link className="policy-back" href={routes.policies}>
        ← Back to policies
      </Link>
      <div className="policy-heading">
        <div>
          <FocusHeading>{policy.label}</FocusHeading>
          <p className="policy-id">{policy.id}</p>
        </div>
        <span className={`policy-status ${policy.status.toLowerCase()}`}>
          {policy.status}
        </span>
      </div>
      <PolicyFacts policy={policy} />
      <Beneficiaries policy={policy} />
      <p className="policy-note">
        Synthetic policy data for this prototype. Viewing a policy does not
        change coverage.
      </p>
    </>
  );
}
