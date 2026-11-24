import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ProposalPage } from './ProposalPage';
import { useProposal } from '../lib/queries';

vi.mock('../lib/queries', () => ({ useProposal: vi.fn() }));
vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

it('FR-10 review announces loading state', () => {
  vi.mocked(useProposal).mockReturnValue({ isPending: true } as ReturnType<
    typeof useProposal
  >);
  render(<ProposalPage policyId="POL" proposalId="PROP" />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading proposal');
});

it('FR-10 review gives retryable error without claiming proposal success', () => {
  vi.mocked(useProposal).mockReturnValue({
    isPending: false,
    isError: true,
    error: new Error('API_UNAVAILABLE'),
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useProposal>);
  render(<ProposalPage policyId="POL" proposalId="PROP" />);
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Could not load the proposal',
  );
  expect(screen.queryByText('PENDING APPROVAL')).not.toBeInTheDocument();
});
