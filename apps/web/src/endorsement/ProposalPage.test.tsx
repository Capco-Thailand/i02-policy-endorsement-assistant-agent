import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ProposalPage } from './ProposalPage';
import { ProposalDecision } from './ProposalDecision';
import { useDecideProposal, useProposal } from '../lib/queries';

vi.mock('../lib/queries', () => ({
  useProposal: vi.fn(),
  useDecideProposal: vi.fn(),
}));
vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

it('FR-10 review announces loading state', () => {
  vi.mocked(useDecideProposal).mockReturnValue({
    isPending: false,
    isError: false,
  } as ReturnType<typeof useDecideProposal>);
  vi.mocked(useProposal).mockReturnValue({ isPending: true } as ReturnType<
    typeof useProposal
  >);
  render(<ProposalPage policyId="POL" proposalId="PROP" />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading proposal');
});

it('FR-10 review gives retryable error without claiming proposal success', () => {
  vi.mocked(useDecideProposal).mockReturnValue({
    isPending: false,
    isError: false,
  } as ReturnType<typeof useDecideProposal>);
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

it('FR-15 suppresses decisions when a calculated quote is absent', () => {
  vi.mocked(useDecideProposal).mockReturnValue({
    isPending: false,
    isError: false,
  } as ReturnType<typeof useDecideProposal>);
  vi.mocked(useProposal).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      id: 'PROP',
      policyId: 'POL',
      status: 'PENDING_APPROVAL',
      current: {
        label: 'Synthetic',
        paymentFrequency: 'MONTHLY',
        beneficiaries: [],
        coverages: [],
      },
      requestedChange: {
        changeType: 'PAYMENT_FREQUENCY',
        paymentFrequency: 'ANNUAL',
        requestedEffectiveDate: '2027-01-01',
      },
      citations: [],
      impact: { status: 'CALCULATED' },
    },
  } as unknown as ReturnType<typeof useProposal>);
  render(<ProposalPage policyId="POL" proposalId="PROP" />);
  expect(screen.getByRole('alert')).toHaveTextContent(/quote unavailable/i);
  expect(
    screen.queryByRole('button', { name: 'Approve proposal' }),
  ).not.toBeInTheDocument();
});

it('FR-11 rejection requires confirmation and Cancel makes no write', async () => {
  const user = (await import('@testing-library/user-event')).default.setup();
  const onDecide = vi.fn();
  render(
    <ProposalDecision onDecide={onDecide} isPending={false} isError={false} />,
  );
  await user.click(screen.getByRole('button', { name: 'Reject proposal' }));
  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Confirm rejection' }),
  ).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  await user.tab({ shift: true });
  expect(
    screen.getByRole('button', { name: 'Confirm rejection' }),
  ).toHaveFocus();
  expect(onDecide).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(onDecide).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Reject proposal' })).toHaveFocus();
});

it('FR-11 approval is direct and a failed write keeps retry actions visible', async () => {
  const user = (await import('@testing-library/user-event')).default.setup();
  const onDecide = vi.fn();
  const view = render(
    <ProposalDecision onDecide={onDecide} isPending={false} isError={false} />,
  );
  await user.click(screen.getByRole('button', { name: 'Approve proposal' }));
  expect(onDecide).toHaveBeenCalledWith('APPROVED');
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  view.rerender(
    <ProposalDecision onDecide={onDecide} isPending={false} isError />,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('not recorded');
  await user.click(screen.getByRole('button', { name: 'Approve proposal' }));
  expect(onDecide).toHaveBeenCalledTimes(2);
});
