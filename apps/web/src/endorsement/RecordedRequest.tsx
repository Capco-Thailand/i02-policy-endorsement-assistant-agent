import { useEffect, useRef } from 'react';
import type { PolicyDetail, RequestResult } from '../lib/api';

type Request = RequestResult['request'];

const date = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));

const frequency = (value: string) =>
  value
    .toLowerCase()
    .replace('_', ' ')
    .replace(/^./, (letter) => letter.toUpperCase());

export function RecordedRequest({
  request,
  policy,
}: {
  request: Request;
  policy: PolicyDetail;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  const summary =
    request.changeType === 'PAYMENT_FREQUENCY'
      ? `${frequency(policy.paymentFrequency)} → ${frequency(request.paymentFrequency)}`
      : request.changeType === 'ADDRESS'
        ? request.correspondenceAddress
        : request.changeType === 'ACCIDENTAL_DEATH_RIDER'
          ? `${request.riderAction === 'ADD' ? 'Add' : 'Remove'} accidental-death rider`
          : request.beneficiaries
              .map((item) => `${item.name} ${item.allocationPercent}%`)
              .join(', ');
  const type =
    request.changeType === 'PAYMENT_FREQUENCY'
      ? 'Payment frequency'
      : request.changeType === 'ADDRESS'
        ? 'Correspondence address'
        : request.changeType === 'ACCIDENTAL_DEATH_RIDER'
          ? 'Accidental-death rider'
          : 'Beneficiaries';
  return (
    <div className="recorded-request" role="status">
      <span className="recorded-request-status">Pending checks</span>
      <h1 ref={heading} tabIndex={-1}>
        Your request was recorded
      </h1>
      <p className="recorded-request-id">Request {request.id}</p>
      <p>Your change is saved. Check whether it can continue to a proposal.</p>
      <dl>
        <div>
          <dt>Requested change</dt>
          <dd>
            {type} · {summary}
          </dd>
        </div>
        <div>
          <dt>Requested effective date</dt>
          <dd>{date(request.requestedEffectiveDate)}</dd>
        </div>
      </dl>
      <p className="request-boundary">
        Recording this request did not approve a change or alter your policy or
        coverage.
      </p>
    </div>
  );
}
