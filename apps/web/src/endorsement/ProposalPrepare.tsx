'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { usePrepareProposal } from '../lib/queries';
import { routes } from '../lib/routes';

export function ProposalPrepare({
  policyId,
  requestId,
}: {
  policyId: string;
  requestId: string;
}) {
  const prepare = usePrepareProposal(policyId, requestId);
  const router = useRouter();
  return (
    <div>
      <Button
        type="button"
        disabled={prepare.isPending}
        onClick={async () => {
          try {
            const proposal = await prepare.mutateAsync();
            router.push(routes.proposal(policyId, proposal.id));
          } catch {
            /* visible mutation error below */
          }
        }}
      >
        {prepare.isPending
          ? 'Preparing proposal…'
          : 'Prepare proposal for review'}
      </Button>
      {prepare.isError && (
        <p role="alert">
          {prepare.error.message === 'CALCULATION_UNAVAILABLE' ||
          prepare.error.message === 'API_UNAVAILABLE' ||
          prepare.error.message === 'PROPOSAL_UNAVAILABLE'
            ? 'Could not prepare the proposal. Try again.'
            : 'This request cannot proceed to a proposal.'}
        </p>
      )}
    </div>
  );
}
