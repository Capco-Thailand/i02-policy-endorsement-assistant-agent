import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ChangeHistory } from './ChangeHistory';
import { useHistory } from '../lib/queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../lib/queries', () => ({ useHistory: vi.fn() }));
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));
const renderHistory = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ChangeHistory />
    </QueryClientProvider>,
  );

it('shows approved snapshot details and a keyboard accessible link', () => {
  vi.mocked(useHistory).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      history: [
        {
          proposalId: 'P1',
          policyId: 'POL-1',
          policyLabel: 'Family Protection Plan',
          status: 'APPROVED',
          decidedAt: '2026-11-18T03:42:00.000Z',
          requestedChange: {
            changeType: 'PAYMENT_FREQUENCY',
            paymentFrequency: 'QUARTERLY',
          },
        },
      ],
    },
  } as ReturnType<typeof useHistory>);
  renderHistory();
  expect(screen.getByText('APPROVED')).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: /Payment frequency.*Quarterly/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /View recorded proposal/i }),
  ).toHaveAttribute('href', '/policies/POL-1/proposals/P1');
  expect(
    screen.getByText(/underlying policy and coverage stay unchanged/i),
  ).toBeInTheDocument();
});

it('distinguishes empty history from a retryable failure', async () => {
  const refetch = vi.fn();
  vi.mocked(useHistory).mockReturnValue({
    isPending: false,
    isError: false,
    data: { history: [] },
  } as unknown as ReturnType<typeof useHistory>);
  const view = renderHistory();
  expect(
    screen.getByText(/approved changes will appear here/i),
  ).toBeInTheDocument();
  vi.mocked(useHistory).mockReturnValue({
    isPending: false,
    isError: true,
    error: new Error('API_UNAVAILABLE'),
    refetch,
  } as unknown as ReturnType<typeof useHistory>);
  view.rerender(
    <QueryClientProvider client={new QueryClient()}>
      <ChangeHistory />
    </QueryClientProvider>,
  );
  expect(
    screen.queryByText(/approved changes will appear here/i),
  ).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('could not load');
  await userEvent.click(screen.getByRole('button', { name: /try again/i }));
  expect(refetch).toHaveBeenCalledOnce();
});

it('distinguishes recorded actions of every change type', () => {
  const changes = [
    { changeType: 'ADDRESS', correspondenceAddress: '100 Synthetic Road' },
    { changeType: 'ADDRESS', correspondenceAddress: '200 Synthetic Road' },
    {
      changeType: 'BENEFICIARY',
      beneficiaries: [
        { name: 'Arisa K.', allocationPercent: 60 },
        { name: 'Decha K.', allocationPercent: 40 },
      ],
    },
    { changeType: 'PAYMENT_FREQUENCY', paymentFrequency: 'SEMI_ANNUAL' },
    { changeType: 'ACCIDENTAL_DEATH_RIDER', riderAction: 'REMOVE' },
  ];
  vi.mocked(useHistory).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      history: changes.map((requestedChange, index) => ({
        proposalId: `P${index}`,
        policyId: 'POL-1',
        policyLabel: 'Family Protection Plan',
        status: 'APPROVED',
        decidedAt: '2026-11-18T03:42:00.000Z',
        requestedChange,
      })),
    },
  } as unknown as ReturnType<typeof useHistory>);
  renderHistory();
  for (const value of [
    '100 Synthetic Road',
    '200 Synthetic Road',
    'Arisa K. 60%, Decha K. 40%',
    'Semi Annual',
    'Remove',
  ])
    expect(
      screen.getByRole('heading', {
        name: new RegExp(value.replaceAll('.', '\\.')),
      }),
    ).toBeInTheDocument();
});
