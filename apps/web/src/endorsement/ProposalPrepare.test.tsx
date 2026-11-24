import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ProposalPrepare } from './ProposalPrepare';
import { usePrepareProposal } from '../lib/queries';

vi.mock('../lib/queries', () => ({ usePrepareProposal: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

it('FR-10 storage outage offers retry instead of saying request is ineligible', () => {
  vi.mocked(usePrepareProposal).mockReturnValue({
    isPending: false,
    isError: true,
    error: new Error('PROPOSAL_UNAVAILABLE'),
  } as ReturnType<typeof usePrepareProposal>);
  render(<ProposalPrepare policyId="POL" requestId="REQ" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Try again');
  expect(screen.getByRole('alert')).not.toHaveTextContent('cannot proceed');
});
