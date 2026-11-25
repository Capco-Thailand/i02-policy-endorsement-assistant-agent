'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { EvidenceResult, PolicyDetail as Policy } from '../lib/api';
import { useEvidence, usePolicy } from '../lib/queries';
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

const sourceQuestions = {
  status: 'What is the policy status?',
  dates: 'When does protection begin?',
  payment: 'How are premiums paid?',
  beneficiaries: 'Who receives the benefit?',
} as const;

type EvidenceCitation = EvidenceResult['citations'][number];
type SourceState = { citation?: EvidenceCitation; reason?: string };

function sourceFor(
  query: ReturnType<typeof useEvidence>,
  sectionId: string,
): SourceState {
  if (query.isPending) return { reason: 'Checking the source.' };
  if (query.isError)
    return { reason: 'Policy evidence is temporarily unavailable.' };
  if (query.data.status === 'unresolved')
    return { reason: `Policy evidence is unresolved (${query.data.reason}).` };
  const citation = query.data.citations.find(
    (item) => item.sectionId === sectionId,
  );
  return citation
    ? { citation }
    : { reason: 'The matching policy section was not returned.' };
}

function FactSource({ source, label }: { source: SourceState; label: string }) {
  return source.citation ? (
    <Citation citation={source.citation} />
  ) : (
    <p className="policy-citation">
      Source unavailable for {label}: {source.reason}
    </p>
  );
}

function PolicyFacts({
  policy,
  dates,
  payment,
}: {
  policy: Policy;
  dates: SourceState;
  payment: SourceState;
}) {
  return (
    <section className="policy-section" aria-labelledby="facts-heading">
      <h2 id="facts-heading">Policy facts</h2>
      <dl className="policy-facts">
        <div>
          <dt>Effective date</dt>
          <dd>{date(policy.effectiveDate)}</dd>
          <FactSource source={dates} label="effective date" />
        </div>
        <div>
          <dt>Expiry date</dt>
          <dd>{date(policy.expiryDate)}</dd>
          <FactSource source={dates} label="expiry date" />
        </div>
        <div>
          <dt>Payment frequency</dt>
          <dd>
            {policy.paymentFrequency === 'MONTHLY' ? 'Monthly' : 'Annual'}
          </dd>
          <FactSource source={payment} label="payment frequency" />
        </div>
      </dl>
    </section>
  );
}

function Beneficiaries({
  policy,
  source,
}: {
  policy: Policy;
  source: SourceState;
}) {
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
      <FactSource source={source} label="beneficiaries" />
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
      <a
        href={`#source-${citation.sectionId.replaceAll('.', '-')}`}
        onClick={() => {
          document
            .getElementById(`source-${citation.sectionId.replaceAll('.', '-')}`)
            ?.focus();
        }}
      >
        View source · {citation.sectionId}
      </a>
    </p>
  ) : null;
}

function TermSources({
  terms,
  additional,
}: {
  terms: Policy['terms'];
  additional: EvidenceCitation[];
}) {
  const citations = [
    terms.product.citation,
    ...terms.coverages.map((item) => item.citation),
    ...terms.exclusions.map((item) => item.citation),
    ...additional,
  ].filter((item): item is EvidenceCitation => Boolean(item));
  const uniqueCitations = citations.filter(
    (item, index) =>
      citations.findIndex(
        (candidate) =>
          candidate.sourceId === item.sourceId &&
          candidate.sectionId === item.sectionId,
      ) === index,
  );
  return (
    <section
      className="policy-section policy-sources"
      aria-labelledby="sources-heading"
    >
      <h2 id="sources-heading">Source wording</h2>
      <p>Versioned synthetic policy evidence for the facts above.</p>
      <ul className="policy-term-list">
        {uniqueCitations.map((citation) => (
          <li
            key={`${citation.sourceId}:${citation.sectionId}`}
            id={`source-${citation.sectionId.replaceAll('.', '-')}`}
            tabIndex={-1}
          >
            <strong>{citation.title}</strong>
            <p>
              Source {citation.sourceId} · Version {citation.version} · Section{' '}
              {citation.sectionId}
            </p>
            <p>{citation.excerpt || 'Source excerpt unavailable.'}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PolicyTerms({
  terms,
  mode,
}: {
  terms: Policy['terms'];
  mode: 'facts' | 'exclusions';
}) {
  const product = terms.product;
  return (
    <>
      {mode === 'facts' && (
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
              <>
                <p role="status" className="policy-unresolved">
                  Unresolved: We can't confirm this coverage detail from the
                  available policy wording ({product.reason}).
                </p>
                {product.citation ? (
                  <Citation citation={product.citation} />
                ) : (
                  <p>
                    Source unavailable for product: the cited policy wording
                    could not be provided.
                  </p>
                )}
              </>
            )}
          </section>
          <section
            className="policy-section"
            aria-labelledby="coverage-heading"
          >
            <h2 id="coverage-heading">
              Coverage listed in this synthetic policy
            </h2>
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
                  {item.citation ? (
                    <Citation citation={item.citation} />
                  ) : (
                    <p>
                      Source unavailable for {item.id}: the cited policy wording
                      could not be provided.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
      {mode === 'exclusions' && (
        <>
          <section
            className="policy-section"
            aria-labelledby="exclusions-heading"
          >
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
                  {item.citation ? (
                    <Citation citation={item.citation} />
                  ) : (
                    <p>
                      Source unavailable for {item.id}: the cited policy wording
                      could not be provided.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}

function PolicyBody({ policy }: { policy: Policy }) {
  const statusQuery = useEvidence(policy.id, sourceQuestions.status);
  const datesQuery = useEvidence(policy.id, sourceQuestions.dates);
  const paymentQuery = useEvidence(policy.id, sourceQuestions.payment);
  const beneficiariesQuery = useEvidence(
    policy.id,
    sourceQuestions.beneficiaries,
  );
  const client = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    if (
      [
        statusQuery.error,
        datesQuery.error,
        paymentQuery.error,
        beneficiariesQuery.error,
      ].some((error) => error?.message === 'UNAUTHORIZED')
    ) {
      client.clear();
      router.replace(`${routes.signIn}?ended=1`);
    }
  }, [
    statusQuery.error,
    datesQuery.error,
    paymentQuery.error,
    beneficiariesQuery.error,
    client,
    router,
  ]);
  const status = sourceFor(statusQuery, 'status');
  const dates = sourceFor(datesQuery, 'dates');
  const payment = sourceFor(paymentQuery, 'payment');
  const beneficiaries = sourceFor(beneficiariesQuery, 'beneficiaries');
  const additional = [
    status.citation,
    dates.citation,
    payment.citation,
    beneficiaries.citation,
  ].filter((item): item is EvidenceCitation => Boolean(item));
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
        <div>
          <span className={`policy-status ${policy.status.toLowerCase()}`}>
            {policy.status}
          </span>
          <FactSource source={status} label="status" />
        </div>
      </div>
      <p className="policy-note policy-intro-note">
        Synthetic policy data for this prototype. Viewing a policy does not
        change coverage.
      </p>
      <PolicyFacts policy={policy} dates={dates} payment={payment} />
      {policy.terms && <PolicyTerms terms={policy.terms} mode="facts" />}
      <Beneficiaries policy={policy} source={beneficiaries} />
      {policy.terms && <PolicyTerms terms={policy.terms} mode="exclusions" />}
      {policy.status === 'ACTIVE' ? (
        <Link className="request-action" href={routes.request(policy.id)}>
          Start a change request
        </Link>
      ) : (
        <p role="status">
          This policy is expired. Change requests are unavailable.
        </p>
      )}
      {policy.terms && (
        <TermSources terms={policy.terms} additional={additional} />
      )}
      <EvidenceSection policyId={policy.id} />
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
  return <PolicyBody policy={query.data.policy} />;
}
