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
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    href: string;
    'aria-label'?: string;
  }) => (
    <a href={href} aria-label={ariaLabel}>
      {children}
    </a>
  ),
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
          requestId: 'REQUEST-1',
          policyId: 'POL-1',
          policyLabel: 'Family Protection Plan',
          status: 'APPROVED',
          decidedAt: '2026-11-18T03:42:00.000Z',
          requestedChange: {
            id: 'REQUEST-1',
            changeType: 'PAYMENT_FREQUENCY',
            paymentFrequency: 'QUARTERLY',
          },
        },
      ],
    },
  } as ReturnType<typeof useHistory>);
  renderHistory();
  expect(screen.getByText('Approved')).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: /Payment frequency.*Quarterly/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /View recorded proposal/i }),
  ).toHaveAttribute('href', '/policies/POL-1/proposals/P1');
  expect(
    screen.getByText(/policy and coverage did not change/i),
  ).toBeInTheDocument();
});

it('shows an approved legacy decision when change details are unavailable', () => {
  vi.mocked(useHistory).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      history: [
        {
          proposalId: 'P-LEGACY',
          policyId: 'POL-1',
          policyLabel: 'Family Protection Plan',
          requestId: 'REQ-LEGACY',
          status: 'APPROVED',
          decidedAt: '2026-11-18T03:42:00.000Z',
        },
      ],
    },
  } as ReturnType<typeof useHistory>);
  renderHistory();
  expect(
    screen.getByRole('heading', { name: 'Change details unavailable' }),
  ).toBeInTheDocument();
  expect(screen.getByText('REQ-LEGACY')).toBeInTheDocument();
  expect(screen.getByText('Approved')).toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: /View recorded proposal/i }),
  ).not.toBeInTheDocument();
});

it('distinguishes empty history from a retryable failure', async () => {
  const refetch = vi.fn();
  vi.mocked(useHistory).mockReturnValue({
    isPending: false,
    isError: false,
    data: { history: [] },
  } as unknown as ReturnType<typeof useHistory>);
  const view = renderHistory();
  expect(screen.getByText(/record will appear here/i)).toBeInTheDocument();
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
    screen.queryByText(/record will appear here/i),
  ).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('could not load');
  await userEvent.click(screen.getByRole('button', { name: /try again/i }));
  expect(refetch).toHaveBeenCalledOnce();
});

it('FR-18 shows safe summaries and request IDs in server order', () => {
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
        requestId: `REQUEST-${index}`,
        policyId: 'POL-1',
        policyLabel: 'Family Protection Plan',
        status: 'APPROVED',
        decidedAt: '2026-11-18T03:42:00.000Z',
        requestedChange: { ...requestedChange, id: `REQUEST-${index}` },
      })),
    },
  } as unknown as ReturnType<typeof useHistory>);
  renderHistory();
  expect(
    screen.queryAllByText(
      /100 Synthetic Road|200 Synthetic Road|Arisa K\.|Decha K\./,
    ),
  ).toHaveLength(0);
  expect(screen.getAllByText(/Request ID:/)).toHaveLength(5);
  expect(screen.getByText('REQUEST-0')).toBeInTheDocument();
  expect(screen.getByText('REQUEST-4')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem').map((row) => row.textContent)).toEqual(
    [
      expect.stringContaining('REQUEST-0'),
      expect.stringContaining('REQUEST-1'),
      expect.stringContaining('REQUEST-2'),
      expect.stringContaining('REQUEST-3'),
      expect.stringContaining('REQUEST-4'),
    ],
  );
});

it('FR-18 explains non-binding approval before records and offers state actions', () => {
  vi.mocked(useHistory).mockReturnValue({
    isPending: false,
    isError: false,
    data: { history: [] },
  } as unknown as ReturnType<typeof useHistory>);
  renderHistory();
  const heading = screen.getByRole('heading', {
    name: 'Customer change history',
  });
  const boundary = screen.getByText(
    /Approval records your decision on a synthetic proposal/,
  );
  const empty = screen.getByRole('heading', {
    name: 'No approved decisions yet',
  });
  expect(
    heading.compareDocumentPosition(boundary) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(
    boundary.compareDocumentPosition(empty) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(boundary).toHaveTextContent(
    'Your policy and coverage did not change.',
  );
  expect(
    screen.getByRole('link', { name: 'View your policies' }),
  ).toHaveAttribute('href', '/policies');
});

it('FR-18 labels approved records and links each exact proposal', () => {
  vi.mocked(useHistory).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      history: [
        {
          proposalId: 'P9',
          requestId: 'REQUEST-9',
          policyId: 'POL-9',
          policyLabel: 'Secure Future Plan',
          status: 'APPROVED',
          decidedAt: '2026-11-25T02:15:00.000Z',
          requestedChange: {
            id: 'REQUEST-9',
            changeType: 'ADDRESS',
            correspondenceAddress: '100 Synthetic Road',
          },
        },
      ],
    },
  } as unknown as ReturnType<typeof useHistory>);
  renderHistory();
  expect(
    screen.getByRole('heading', { name: 'Approved decisions' }),
  ).toBeInTheDocument();
  expect(screen.getByText('1 record')).toBeInTheDocument();
  expect(screen.getByText('Approved')).toBeInTheDocument();
  expect(
    screen.getByRole('link', {
      name: /View recorded proposal for Secure Future Plan.*REQUEST-9/,
    }),
  ).toHaveAttribute('href', '/policies/POL-9/proposals/P9');
  expect(
    screen.getByText('REQUEST-9').closest('li')?.querySelector('time'),
  ).toHaveAttribute('dateTime', '2026-11-25T02:15:00.000Z');
});

it('FR-18 explains loading and an ended session without protected records', () => {
  vi.mocked(useHistory).mockReturnValue({
    isPending: true,
    isError: false,
  } as ReturnType<typeof useHistory>);
  const view = renderHistory();
  expect(screen.getByRole('status')).toHaveTextContent(
    'Loading your change history',
  );
  vi.mocked(useHistory).mockReturnValue({
    isPending: false,
    isError: true,
    error: new Error('UNAUTHORIZED'),
  } as ReturnType<typeof useHistory>);
  view.rerender(
    <QueryClientProvider client={new QueryClient()}>
      <ChangeHistory />
    </QueryClientProvider>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Session ended');
  expect(screen.getByRole('link', { name: 'Sign in again' })).toHaveAttribute(
    'href',
    '/?ended=1',
  );
  expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
});
