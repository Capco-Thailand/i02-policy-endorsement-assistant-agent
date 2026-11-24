'use client';

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
        ← Back to policy
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
          <button type="button" onClick={() => proposal.refetch()}>
            Try again
          </button>
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
