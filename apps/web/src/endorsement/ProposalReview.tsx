import type { Proposal } from '../lib/api';
import { useEffect, useRef } from 'react';

const money = (satang: number) =>
  `THB ${(satang / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const amount = (baht: number) => `THB ${baht.toLocaleString('en-US')}`;
const frequency = (value: string) =>
  value
    .toLowerCase()
    .replace('_', ' ')
    .replace(/^./, (letter) => letter.toUpperCase());

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
    <tr>
      <th scope="row">{field.label}</th>
      <td data-label="Current policy">
        {field.current}
        {field.currentUnit && <small>{field.currentUnit}</small>}
      </td>
      <td data-label="Proposed">
        {field.proposed}
        {field.proposedUnit && <small>{field.proposedUnit}</small>}
        {!field.changed && <span className="proposal-change">Unchanged</span>}
      </td>
    </tr>
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
      current: frequency(before.frequency),
      proposed: frequency(after.frequency),
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
      label: 'Life benefit',
      current: amount(before.lifeBenefitBaht),
      proposed: amount(after.lifeBenefitBaht),
      changed: before.lifeBenefitBaht !== after.lifeBenefitBaht,
    },
  ];
  if (before.riderBenefitBaht !== after.riderBenefitBaht)
    fields.push({
      label: 'Accidental death benefit',
      current: amount(before.riderBenefitBaht),
      proposed: amount(after.riderBenefitBaht),
      changed: true,
    });
  return (
    <section
      className="proposal-comparison-table"
      aria-labelledby="comparison-heading"
    >
      <h2 id="comparison-heading">Current and proposed values</h2>
      <table className="proposal-compare">
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">Current policy</th>
            <th scope="col">Proposed</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <ComparisonRow key={field.label} field={field} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function QuoteSummary({ impact }: { impact: Proposal['impact'] }) {
  if (impact.status === 'UNCHANGED') return null;
  const difference = impact.quote.difference.annualizedScheduledTotalSatang;
  return (
    <section
      className="request-panel proposal-quote-summary"
      aria-labelledby="quote-summary-heading"
    >
      <p id="quote-summary-heading" className="request-eyebrow">
        Annualized scheduled total
      </p>
      <h2>
        {difference === 0
          ? 'No change per year'
          : `${money(Math.abs(difference))} ${difference < 0 ? 'less' : 'more'} per year`}
      </h2>
      <p>
        Current {money(impact.quote.before.annualizedScheduledTotalSatang)} ·
        proposed {money(impact.quote.after.annualizedScheduledTotalSatang)}
      </p>
      <p className="proposal-quote-note">
        Compare yearly totals when payment frequency changes.
      </p>
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
      <p className="request-eyebrow">
        Policy {proposal.policyId} / Proposal {proposal.id}
      </p>
      <span className={`proposal-status ${proposal.status.toLowerCase()}`}>
        {proposal.status === 'PENDING_APPROVAL'
          ? 'Pending your decision'
          : proposal.status === 'APPROVED'
            ? 'Approved decision recorded'
            : 'Rejected decision recorded'}
      </span>
      <h1>Review your proposed change</h1>
      <p className="proposal-subtitle">
        {proposal.requestedChange.changeType === 'PAYMENT_FREQUENCY'
          ? 'Payment frequency'
          : proposal.requestedChange.changeType === 'ADDRESS'
            ? 'Correspondence address'
            : proposal.requestedChange.changeType === 'BENEFICIARY'
              ? 'Beneficiaries'
              : 'Accidental-death rider'}{' '}
        · requested effective date{' '}
        {new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(
          new Date(
            `${proposal.requestedChange.requestedEffectiveDate}T00:00:00Z`,
          ),
        )}
      </p>
      <QuoteSummary impact={proposal.impact} />
      {(proposal.requestedChange.changeType !== 'PAYMENT_FREQUENCY' ||
        proposal.impact.status === 'UNCHANGED') && (
        <RequestedChange proposal={proposal} />
      )}
      <ImpactComparison impact={proposal.impact} />
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
