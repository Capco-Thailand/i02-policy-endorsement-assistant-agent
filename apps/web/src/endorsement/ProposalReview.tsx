import type { Proposal } from '../lib/api';

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
      <div className="proposal-comparison">
        <div>
          <h3>Current</h3>
          <p>{current}</p>
        </div>
        <div>
          <h3>Proposed</h3>
          <p>{proposed}</p>
        </div>
      </div>
      <p>Requested effective date: {change.requestedEffectiveDate}</p>
    </section>
  );
}

function ImpactComparison({ impact }: { impact: Proposal['impact'] }) {
  if (impact.status === 'UNCHANGED')
    return (
      <section className="request-panel">
        <h2>Payment and benefits</h2>
        <p>Premium: Unchanged</p>
        <p>Payment schedule: Unchanged</p>
        <p>Annualized total: Unchanged</p>
        <p>Benefits: Unchanged</p>
      </section>
    );
  const { before, after } = impact.quote;
  return (
    <section className="request-panel" aria-labelledby="comparison-heading">
      <h2 id="comparison-heading">Current and proposed values</h2>
      <div className="proposal-comparison">
        <div>
          <h3>Current</h3>
          <dl>
            <dt>Payment amount</dt>
            <dd>{money(before.premiumPerInstallmentSatang)}</dd>
            <dt>Payment schedule</dt>
            <dd>
              {before.frequency} · {before.installmentsPerYear} payments per
              year
            </dd>
            <dt>Annualized total</dt>
            <dd>{money(before.annualizedScheduledTotalSatang)}</dd>
            <dt>Life benefit</dt>
            <dd>{amount(before.lifeBenefitBaht)}</dd>
            <dt>Accidental death benefit</dt>
            <dd>{amount(before.riderBenefitBaht)}</dd>
          </dl>
        </div>
        <div>
          <h3>Proposed</h3>
          <dl>
            <dt>Payment amount</dt>
            <dd>{money(after.premiumPerInstallmentSatang)}</dd>
            <dt>Payment schedule</dt>
            <dd>
              {after.frequency} · {after.installmentsPerYear} payments per year
            </dd>
            <dt>Annualized total</dt>
            <dd>{money(after.annualizedScheduledTotalSatang)}</dd>
            <dt>Life benefit</dt>
            <dd>
              {after.lifeBenefitBaht === before.lifeBenefitBaht
                ? `${amount(after.lifeBenefitBaht)} · Unchanged`
                : amount(after.lifeBenefitBaht)}
            </dd>
            <dt>Accidental death benefit</dt>
            <dd>
              {after.riderBenefitBaht === before.riderBenefitBaht
                ? `${amount(after.riderBenefitBaht)} · Unchanged`
                : amount(after.riderBenefitBaht)}
            </dd>
          </dl>
        </div>
      </div>
      <p>Calculation source: {impact.quote.ratingVersion}</p>
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

export function ProposalReview({ proposal }: { proposal: Proposal }) {
  return (
    <div className="proposal-review">
      <div className="policy-heading">
        <div>
          <h1>Review proposed change</h1>
          <p className="policy-id">
            {proposal.current.label} · Policy {proposal.policyId} · Proposal{' '}
            {proposal.id}
          </p>
        </div>
        <span className="policy-status active">
          {proposal.status.replace('_', ' ')}
        </span>
      </div>
      <RequestedChange proposal={proposal} />
      <ImpactComparison impact={proposal.impact} />
      <ProposalEvidence citations={proposal.citations} />
      <section className="request-panel" role="note">
        <h2>This is a non-binding proposal.</h2>
        <p>
          Approval later records your decision in history only. The underlying
          policy and coverage stay unchanged.
        </p>
        <p>Synthetic policy and calculation data for this prototype.</p>
      </section>
    </div>
  );
}
