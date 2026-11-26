import { useEffect, useRef } from 'react';
import type { RequestResult } from '../lib/api';

type Request = RequestResult['request'];

export function RecordedRequest({ request }: { request: Request }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  return (
    <div className="recorded-request" role="status">
      <span className="recorded-request-status">Pending eligibility check</span>
      <h2 ref={heading} tabIndex={-1}>
        Your change request is recorded
      </h2>
      <p>
        Recording this request did not approve it or change your policy
        coverage.
      </p>
      <p>
        Request ID: <strong className="request-id">{request.id}</strong>
      </p>
      <p>Next, check eligibility to see whether this request can continue.</p>
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
