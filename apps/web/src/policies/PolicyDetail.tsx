'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { PolicyDetail as Policy } from '../lib/api';
import { usePolicy } from '../lib/queries';
import { routes } from '../lib/routes';
import { FocusHeading } from './FocusHeading';
import { EvidenceSection } from './EvidenceSection';

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

function Citation({
  citation,
}: {
  citation?: { title: string; version: string; sectionId: string };
}) {
  return citation ? (
    <p className="policy-citation">
      Source: {citation.title}, version {citation.version}, section{' '}
      {citation.sectionId}
    </p>
  ) : null;
}

function PolicyTerms({ terms }: { terms: Policy['terms'] }) {
  const product = terms.product;
  return (
    <>
      <section className="policy-section" aria-labelledby="product-heading">
        <h2 id="product-heading">Product and plan</h2>
        {product.status === 'confirmed' ? (
          <>
            <dl className="policy-facts">
              <div>
                <dt>Insurer</dt>
                <dd>{product.value.insurer}</dd>
              </div>
              <div>
                <dt>Policy type</dt>
                <dd>{product.value.type}</dd>
              </div>
              <div>
                <dt>Product</dt>
                <dd>{product.value.name}</dd>
              </div>
              <div>
                <dt>Plan version</dt>
                <dd>{product.value.version}</dd>
              </div>
            </dl>
            <Citation citation={product.citation} />
          </>
        ) : (
          <p role="status" className="policy-unresolved">
            Unresolved: We can't confirm this coverage detail from the available
            policy wording ({product.reason}).
          </p>
        )}
      </section>
      <section className="policy-section" aria-labelledby="coverage-heading">
        <h2 id="coverage-heading">Coverage listed in this synthetic policy</h2>
        <ul className="policy-term-list">
          {terms.coverages.map((item) => (
            <li key={item.id}>
              <strong>
                {item.status === 'confirmed' ? item.value.name : item.id}
              </strong>
              {item.status === 'confirmed' ? (
                <span>
                  {item.value.currency}{' '}
                  {item.value.amount.toLocaleString('en-US')}
                </span>
              ) : (
                <span className="policy-unresolved">
                  Unresolved: We can't confirm this coverage detail from the
                  available policy wording ({item.reason}).
                </span>
              )}
              <Citation citation={item.citation} />
            </li>
          ))}
        </ul>
      </section>
      <section className="policy-section" aria-labelledby="exclusions-heading">
        <h2 id="exclusions-heading">Key exclusions and limitations</h2>
        <ul className="policy-term-list">
          {terms.exclusions.map((item) => (
            <li key={item.id}>
              {item.status === 'confirmed' ? (
                <p>{item.value}</p>
              ) : (
                <p className="policy-unresolved">
                  Unresolved: We can't confirm this coverage detail from the
                  available policy wording ({item.reason}).
                </p>
              )}
              <Citation citation={item.citation} />
            </li>
          ))}
        </ul>
      </section>
    </>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => void query.refetch()}
            >
              Try again
            </Button>
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
      {policy.terms && <PolicyTerms terms={policy.terms} />}
      <PolicyFacts policy={policy} />
      <Beneficiaries policy={policy} />
      <EvidenceSection policyId={policy.id} />
      {policy.status === 'ACTIVE' ? (
        <Link className="request-action" href={routes.request(policy.id)}>
          Start a change request
        </Link>
      ) : (
        <p role="status">
          This policy is expired. Change requests are unavailable.
        </p>
      )}
      <p className="policy-note">
        Synthetic policy data for this prototype. Viewing a policy does not
        change coverage.
      </p>
    </>
  );
}
