'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useEligibilityCheck } from '../lib/queries';
import { routes } from '../lib/routes';
import { ProposalPrepare } from './ProposalPrepare';

export function EligibilityCheck({
  policyId,
  requestId,
}: {
  policyId: string;
  requestId: string;
}) {
  const check = useEligibilityCheck(policyId, requestId);
  const router = useRouter();
  const client = useQueryClient();
  useEffect(() => {
    if (check.error?.message === 'UNAUTHORIZED') {
      client.clear();
      router.replace(`${routes.signIn}?ended=1`);
    }
  }, [check.error, client, router]);
  if (check.error?.message === 'UNAUTHORIZED') return null;
  if (check.error?.message === 'NOT_FOUND')
    return <p role="alert">This request is unavailable.</p>;
  if (
    check.error?.message === 'POLICY_EXPIRED' ||
    check.error?.message === 'INVALID_REQUEST'
  )
    return (
      <p role="alert">
        This request cannot be checked because its policy or recorded details
        are no longer valid.
      </p>
    );
  const decision = check.isError ? undefined : check.data;
  return (
    <section aria-labelledby="eligibility-heading">
      <h3 id="eligibility-heading">Eligibility</h3>
      <p>Check this recorded request, your policy, and cited rules.</p>
      <Button
        type="button"
        disabled={check.isPending}
        onClick={() => check.mutate()}
      >
        {check.isPending ? 'Checking this request…' : 'Check eligibility'}{' '}
        <span aria-hidden="true">→</span>
      </Button>
      {check.isError && (
        <p role="alert">Could not complete the check. Try again.</p>
      )}
      <div aria-live="polite">
        {check.isPending ? (
          <p>Checking this request…</p>
        ) : decision ? (
          <div
            className={`eligibility-result ${decision.outcome.toLowerCase()}`}
          >
            <h4>
              {decision.outcome === 'CAN_PROCEED'
                ? 'Can proceed to a proposal'
                : decision.outcome === 'NEEDS_REVIEW'
                  ? 'Needs review'
                  : 'Cannot proceed'}
            </h4>
            <h5>Reason</h5>
            {decision.reasons.length > 0 && (
              <ul>
                {decision.reasons.map((reason, index) => (
                  <li key={`${decision.reasonCodes[index]}:${reason}`}>
                    {reason}
                  </li>
                ))}
              </ul>
            )}
            {decision.reasons.length === 0 && (
              <p>
                {decision.outcome === 'CAN_PROCEED'
                  ? 'No blocking reasons were returned for this request.'
                  : 'The eligibility service did not provide a reason for this result.'}
              </p>
            )}
            <h5>Next action</h5>
            <p className="eligibility-next-step">{decision.nextStep}</p>
            <p>No policy coverage has changed.</p>
            {decision.outcome === 'CAN_PROCEED' && (
              <ProposalPrepare policyId={policyId} requestId={requestId} />
            )}
          </div>
        ) : (
          <p>
            Not checked yet. Select Check eligibility to see whether this
            request can continue.
          </p>
        )}
      </div>
    </section>
  );
}
