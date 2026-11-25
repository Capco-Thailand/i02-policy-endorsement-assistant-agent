import type { RequestResult } from '../lib/api';

type Request = RequestResult['request'];

export function RecordedRequest({ request }: { request: Request }) {
  return (
    <div className="recorded-request" role="status">
      <h2>Pending checks</h2>
      <p>
        Your request was recorded and is pending checks. No policy coverage has
        changed.
      </p>
      <p>
        Request ID: <strong className="request-id">{request.id}</strong>
      </p>
      <p>The request is saved; eligibility is a separate check.</p>
      <h3>Requested change</h3>
      <dl>
        <div>
          <dt>Type</dt>
          <dd>
            {request.changeType === 'BENEFICIARY'
              ? 'Beneficiaries'
              : request.changeType === 'ADDRESS'
                ? 'Correspondence address'
                : request.changeType === 'PAYMENT_FREQUENCY'
                  ? 'Payment frequency'
                  : 'Accidental-death rider'}
          </dd>
        </div>
        <div>
          <dt>Requested effective date</dt>
          <dd>{request.requestedEffectiveDate}</dd>
        </div>
        {request.changeType === 'ADDRESS' && (
          <div>
            <dt>New address</dt>
            <dd>{request.correspondenceAddress}</dd>
          </div>
        )}
        {request.changeType === 'PAYMENT_FREQUENCY' && (
          <div>
            <dt>New frequency</dt>
            <dd>{request.paymentFrequency}</dd>
          </div>
        )}
        {request.changeType === 'ACCIDENTAL_DEATH_RIDER' && (
          <div>
            <dt>Rider action</dt>
            <dd>{request.riderAction === 'ADD' ? 'Add' : 'Remove'}</dd>
          </div>
        )}
        {request.changeType === 'BENEFICIARY' && (
          <div>
            <dt>Replacement beneficiaries</dt>
            <dd>
              <ul>
                {request.beneficiaries.map((item) => (
                  <li key={item.name}>
                    {item.name} · {item.allocationPercent}%
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
