'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useEligibilityCheck } from '../lib/queries';
import { routes } from '../lib/routes';

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
  const decision = check.isError ? undefined : check.data;
  return (
    <section aria-labelledby="eligibility-heading">
      <h3 id="eligibility-heading">Eligibility</h3>
      <p>
        Check this recorded request, your policy, cited rules, and this
        request&apos;s mock receipt.
      </p>
      <button
        type="button"
        disabled={check.isPending}
        onClick={() => check.mutate()}
      >
        {check.isPending ? 'Checking this request…' : 'Check eligibility'}
      </button>
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
              {decision.outcome === 'ELIGIBLE'
                ? 'Eligible to continue to a mock quote'
                : decision.outcome === 'REFERRED'
                  ? 'Needs human review'
                  : 'Cannot continue yet'}
            </h4>
            <p className="eligibility-next-step">{decision.nextStep}</p>
            {decision.reasonCodes.includes('MISSING_RECEIPT') && (
              <a href="#document-upload-heading">Go to mock document upload</a>
            )}
            {decision.reasons.length > 0 && (
              <ul>
                {decision.reasons.map((reason, index) => (
                  <li key={`${decision.reasonCodes[index]}:${reason}`}>
                    {reason}
                  </li>
                ))}
              </ul>
            )}
            {decision.citations.map((item) => (
              <p
                className="eligibility-citation"
                key={`${item.sourceId}:${item.sectionId}`}
              >
                Source {item.sourceId} · rule {item.ruleId} · version{' '}
                {item.version} · section {item.sectionId}
              </p>
            ))}
            {decision.outcome === 'REFERRED' &&
              decision.citations.length === 0 &&
              decision.sourceIds.map((sourceId) => (
                <p className="eligibility-citation" key={sourceId}>
                  Source {sourceId}
                </p>
              ))}
            <p>
              A mock receipt does not verify document suitability. No policy
              coverage has changed.
            </p>
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
