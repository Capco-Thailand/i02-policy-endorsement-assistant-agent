import type { Proposal } from '../lib/api';
import { useEffect, useRef } from 'react';

const money = (satang: number) =>
  `THB ${(satang / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const amount = (baht: number) => `THB ${baht.toLocaleString('en-US')}`;

function RequestedChange({ proposal }: { proposal: Proposal }) {
  const change = proposal.requestedChange;
  const current =
    change.changeType === 'ADDRESS'
      ? 'Address not recorded in this synthetic policy'
      : change.changeType === 'BENEFICIARY'
        ? proposal.current.beneficiaries
            .map((item) => `${item.name} ${item.allocationPercent}%`)
            .join(', ')
        : change.changeType === 'PAYMENT_FREQUENCY'
          ? proposal.current.paymentFrequency
          : (proposal.current.coverages.find(
              (item) => item.id === 'coverage.accidental-death',
            )?.name ?? 'No accidental death rider');
  const proposed =
    change.changeType === 'ADDRESS'
      ? change.correspondenceAddress
      : change.changeType === 'BENEFICIARY'
        ? change.beneficiaries
            .map((item) => `${item.name} ${item.allocationPercent}%`)
            .join(', ')
        : change.changeType === 'PAYMENT_FREQUENCY'
          ? change.paymentFrequency
          : `${change.riderAction} accidental death rider`;
  return (
    <section className="request-panel">
      <h2>Requested change</h2>
      <div
        className="proposal-field"
        role="group"
        aria-label="Requested change"
      >
        <div>
          <span>Current policy</span>
          <strong>{current}</strong>
        </div>
        <div>
          <span>Proposed</span>
          <strong>{proposed}</strong>
          <span className="proposal-change">
            {change.changeType === 'PAYMENT_FREQUENCY' &&
            change.paymentFrequency === proposal.current.paymentFrequency
              ? 'Unchanged'
              : 'Changed'}
          </span>
        </div>
      </div>
      <p>Requested effective date: {change.requestedEffectiveDate}</p>
    </section>
  );
}

type ComparisonField = {
  label: string;
  current: string;
  proposed: string;
  currentUnit?: string;
  proposedUnit?: string;
  changed: boolean;
};

function ComparisonRow({ field }: { field: ComparisonField }) {
  return (
    <div className="proposal-field" role="group" aria-label={field.label}>
      <h3>{field.label}</h3>
      <div>
        <span>Current policy</span>
        <strong>{field.current}</strong>
        {field.currentUnit && <small>{field.currentUnit}</small>}
      </div>
      <div>
        <span>Proposed</span>
        <strong>{field.proposed}</strong>
        {field.proposedUnit && <small>{field.proposedUnit}</small>}
        <span className="proposal-change">
          {field.changed ? 'Changed' : 'Unchanged'}
        </span>
      </div>
    </div>
  );
}

function ImpactComparison({ impact }: { impact: Proposal['impact'] }) {
  if (impact.status === 'UNCHANGED')
    return (
      <section className="request-panel" aria-labelledby="comparison-heading">
        <h2 id="comparison-heading">Current and proposed values</h2>
        <p>Premium: Unchanged</p>
        <p>Payment schedule: Unchanged</p>
        <p>Annualized total: Unchanged</p>
        <p>Benefits: Unchanged</p>
      </section>
    );
  const { before, after } = impact.quote;
  const fields: ComparisonField[] = [
    {
      label: 'Payment frequency',
      current: before.frequency,
      proposed: after.frequency,
      changed: before.frequency !== after.frequency,
    },
    {
      label: 'Premium per installment',
      current: money(before.premiumPerInstallmentSatang),
      proposed: money(after.premiumPerInstallmentSatang),
      currentUnit: `per ${before.frequency.toLowerCase()} payment`,
      proposedUnit: `per ${after.frequency.toLowerCase()} payment`,
      changed:
        before.premiumPerInstallmentSatang !==
          after.premiumPerInstallmentSatang ||
        before.frequency !== after.frequency,
    },
    {
      label: 'Payment schedule',
      current: `${before.installmentsPerYear} payments per year`,
      proposed: `${after.installmentsPerYear} payments per year`,
      changed: before.installmentsPerYear !== after.installmentsPerYear,
    },
    {
      label: 'Annualized total',
      current: money(before.annualizedScheduledTotalSatang),
      proposed: money(after.annualizedScheduledTotalSatang),
      currentUnit: 'per year',
      proposedUnit: 'per year',
      changed:
        before.annualizedScheduledTotalSatang !==
        after.annualizedScheduledTotalSatang,
    },
    {
      label: 'Life benefit',
      current: amount(before.lifeBenefitBaht),
      proposed: amount(after.lifeBenefitBaht),
      changed: before.lifeBenefitBaht !== after.lifeBenefitBaht,
    },
    {
      label: 'Accidental death benefit',
      current: amount(before.riderBenefitBaht),
      proposed: amount(after.riderBenefitBaht),
      changed: before.riderBenefitBaht !== after.riderBenefitBaht,
    },
  ];
  return (
    <section className="request-panel" aria-labelledby="comparison-heading">
      <h2 id="comparison-heading">Current and proposed values</h2>
      <div className="proposal-fields">
        {fields.map((field) => (
          <ComparisonRow key={field.label} field={field} />
        ))}
      </div>
      <p>Calculation source: {impact.quote.ratingVersion}</p>
      <p>
        Premium per installment uses different periods when the schedule
        changes. Compare annualized totals to understand the yearly amount.
        Benefits are separate coverages.
      </p>
    </section>
  );
}

function ProposalEvidence({ citations }: { citations: Proposal['citations'] }) {
  return (
    <section className="request-panel">
      <h2>Assessment and sources</h2>
      <p>
        This request can proceed based on the cited policy wording and
        endorsement rules.
      </p>
      <ul>
        {citations.map((item) => (
          <li key={`${item.kind}:${item.sourceId}:${item.sectionId}`}>
            {item.kind === 'POLICY' ? 'Policy wording' : 'Endorsement rule'} ·{' '}
            {item.sourceId} · version {item.version} · section {item.sectionId}
            {item.kind === 'RULE' ? ` · ${item.ruleId}` : ` · ${item.excerpt}`}
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuoteSummary({ impact }: { impact: Proposal['impact'] }) {
  if (impact.status === 'UNCHANGED') return null;
  return (
    <section
      className="request-panel proposal-quote-summary"
      aria-labelledby="quote-summary-heading"
    >
      <h2 id="quote-summary-heading">Annualized scheduled total</h2>
      <p>
        Current {money(impact.quote.before.annualizedScheduledTotalSatang)} per
        year · proposed{' '}
        {money(impact.quote.after.annualizedScheduledTotalSatang)} per year
      </p>
      <p>Server quote {impact.quote.ratingVersion}</p>
    </section>
  );
}

export function ProposalReview({ proposal }: { proposal: Proposal }) {
  const priorStatus = useRef(proposal.status);
  const recordedHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (
      priorStatus.current === 'PENDING_APPROVAL' &&
      (proposal.status === 'APPROVED' || proposal.status === 'REJECTED')
    )
      recordedHeading.current?.focus();
    priorStatus.current = proposal.status;
  }, [proposal.status]);
  return (
    <div className="proposal-review">
      <div className="policy-heading">
        <div>
          <h1>What would this request change and cost?</h1>
          <p className="policy-id">
            {proposal.current.label} · Policy {proposal.policyId} · Proposal{' '}
            {proposal.id}
          </p>
        </div>
        <span className="policy-status active">
          {proposal.status.replace('_', ' ')}
        </span>
      </div>
      <section className="request-panel proposal-boundary" role="note">
        <h2>This is a non-binding proposal.</h2>
        <p>
          Approval records your decision only. The underlying policy and
          coverage stay unchanged.
        </p>
        <p>Synthetic policy and calculation data for this prototype.</p>
      </section>
      <QuoteSummary impact={proposal.impact} />
      <RequestedChange proposal={proposal} />
      <ImpactComparison impact={proposal.impact} />
      <ProposalEvidence citations={proposal.citations} />
      {(proposal.status === 'APPROVED' || proposal.status === 'REJECTED') && (
        <section className="request-panel" aria-live="polite">
          <h2 ref={recordedHeading} tabIndex={-1}>
            Your decision was recorded
          </h2>
          <p>
            {proposal.status === 'APPROVED' ? 'Approved' : 'Rejected'} on{' '}
            {proposal.decidedAt
              ? new Date(proposal.decidedAt).toLocaleString()
              : 'date unavailable'}
            .
          </p>
          <p>This does not change your policy or coverage.</p>
        </section>
      )}
    </div>
  );
}
