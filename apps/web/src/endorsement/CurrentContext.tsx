import Link from 'next/link';
import type { PolicyDetail } from '../lib/api';
import { routes } from '../lib/routes';

type ChangeType =
  | 'BENEFICIARY'
  | 'ADDRESS'
  | 'PAYMENT_FREQUENCY'
  | 'ACCIDENTAL_DEATH_RIDER';

export function CurrentContext({
  policy,
  changeType,
}: {
  policy: PolicyDetail;
  changeType: ChangeType;
}) {
  const coverage = policy.terms?.coverages.find(
    (item) => item.id === 'coverage.accidental-death',
  );
  return (
    <section
      className="request-context"
      aria-labelledby="current-policy-heading"
    >
      <h2 id="current-policy-heading">Current policy</h2>
      {changeType === 'BENEFICIARY' &&
        (policy.beneficiaries.length ? (
          <ul className="request-current-beneficiaries">
            {policy.beneficiaries.map((item) => (
              <li key={item.name}>
                {item.name} · {item.allocationPercent}%
              </li>
            ))}
          </ul>
        ) : (
          <p>No beneficiaries are recorded for this policy.</p>
        ))}
      {changeType === 'ADDRESS' && <p>Not available in this policy record.</p>}
      {changeType === 'PAYMENT_FREQUENCY' && (
        <p>{policy.paymentFrequency === 'MONTHLY' ? 'Monthly' : 'Annual'}</p>
      )}
      {changeType === 'ACCIDENTAL_DEATH_RIDER' && (
        <>
          {coverage?.status === 'confirmed' ? (
            <>
              <p>
                {coverage.value.name} · {coverage.value.currency}{' '}
                {coverage.value.amount.toLocaleString('en-US')}
              </p>
              <Link
                href={`${routes.policy(policy.id)}#source-${coverage.citation.sectionId.replaceAll('.', '-')}`}
              >
                View cited policy term
              </Link>
            </>
          ) : (
            <p>
              Confirmed accidental-death coverage is not available in this
              policy record.
            </p>
          )}
          <p>Current rider on/off state is not supplied.</p>
        </>
      )}
      <Link href={routes.policy(policy.id)}>
        View current policy facts and sources
      </Link>
    </section>
  );
}
