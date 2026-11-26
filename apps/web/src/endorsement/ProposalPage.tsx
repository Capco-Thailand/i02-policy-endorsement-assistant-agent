'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useDecideProposal, useProposal } from '../lib/queries';
import { routes } from '../lib/routes';
import { ProposalReview } from './ProposalReview';
import { ProposalDecision } from './ProposalDecision';

export function ProposalPage({
  policyId,
  proposalId,
}: {
  policyId: string;
  proposalId: string;
}) {
  const proposal = useProposal(policyId, proposalId);
  const decision = useDecideProposal(policyId, proposalId);
  return (
    <>
      <Link className="policy-back" href={routes.policy(policyId)}>
        <span aria-hidden="true">←</span> Back to policy
      </Link>
      {proposal.isPending ? (
        <p role="status">Loading proposal…</p>
      ) : proposal.isError ? (
        <section role="alert">
          <h1>Proposal unavailable</h1>
          <p>
            {proposal.error.message === 'NOT_FOUND'
              ? 'This proposal is unavailable.'
              : 'Could not load the proposal. Try again.'}
          </p>
          <Button type="button" onClick={() => proposal.refetch()}>
            Try again
          </Button>
        </section>
      ) : proposal.data.impact.status === 'CALCULATED' &&
        !proposal.data.impact.quote ? (
        <section role="alert" className="request-panel">
          <h1>Proposal quote unavailable</h1>
          <p>
            Cannot review this proposal yet. Its server quote is unavailable.
          </p>
          <Button type="button" onClick={() => void proposal.refetch()}>
            Try again
          </Button>
        </section>
      ) : (
        <>
          <ProposalReview proposal={proposal.data} />
          {proposal.data.status === 'PENDING_APPROVAL' && (
            <ProposalDecision
              onDecide={(choice) => decision.mutate(choice)}
              isPending={decision.isPending}
              isError={decision.isError}
            />
          )}
        </>
      )}
    </>
  );
}
