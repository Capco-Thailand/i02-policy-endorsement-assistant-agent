import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PolicyDetail } from './PolicyDetail';
import { usePolicy } from '../lib/queries';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('../lib/queries', () => ({ usePolicy: vi.fn() }));

const show = (state: object) => {
  vi.mocked(usePolicy).mockReturnValue(state as ReturnType<typeof usePolicy>);
  const client = new QueryClient();
  client.setQueryData(['policies'], { policies: [{ id: 'POL-NARIN-001' }] });
  render(
    <QueryClientProvider client={client}>
      <PolicyDetail policyId="POL-NARIN-001" />
    </QueryClientProvider>,
  );
  return client;
};

describe('FR-03 policy detail', () => {
  it('shows status, facts, allocations, and a return link without a request action', () => {
    show({
      isPending: false,
      isError: false,
      data: {
        policy: {
          id: 'POL-NARIN-001',
          label: 'Family Protection Plan',
          status: 'ACTIVE',
          effectiveDate: '2025-01-01',
          expiryDate: '2035-12-31',
          paymentFrequency: 'MONTHLY',
          beneficiaries: [
            { name: 'Arisa K.', allocationPercent: 60 },
            { name: 'Decha K.', allocationPercent: 40 },
          ],
        },
      },
    });
    expect(
      screen.getByRole('heading', { name: 'Family Protection Plan' }),
    ).toHaveFocus();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('1 January 2025')).toBeInTheDocument();
    expect(screen.getByText('31 December 2035')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Arisa K.')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Back to policies/ }),
    ).toHaveAttribute('href', '/policies');
    expect(
      screen.queryByRole('button', { name: /request|endorse/i }),
    ).not.toBeInTheDocument();
  });

  it('separates unavailable and retry states without showing policy facts', () => {
    const { unmount } = renderState({
      isPending: false,
      isError: true,
      error: new Error('NOT_FOUND'),
    });
    expect(screen.getByRole('alert')).toHaveTextContent(/unavailable/i);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /unavailable/i,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
    expect(
      screen.getByRole('link', { name: /Back to policies/ }),
    ).toHaveAttribute('href', '/policies');
    expect(screen.queryByText('Current beneficiaries')).not.toBeInTheDocument();
    unmount();
    const refetch = vi.fn();
    renderState({
      isPending: false,
      isError: true,
      error: new Error('API_UNAVAILABLE'),
      refetch,
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      /Could not load policy/i,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('announces loading and an empty beneficiary list', () => {
    const { unmount } = renderState({ isPending: true });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /loading/i,
    );
    unmount();
    show({
      isPending: false,
      isError: false,
      data: {
        policy: {
          id: 'POL-NARIN-002',
          label: 'Classic Life Plan',
          status: 'EXPIRED',
          effectiveDate: '2015-01-01',
          expiryDate: '2025-01-01',
          paymentFrequency: 'ANNUAL',
          beneficiaries: [],
        },
      },
    });
    expect(screen.getByText('EXPIRED')).toBeInTheDocument();
    expect(screen.getByText(/No beneficiaries/)).toBeInTheDocument();
  });

  it('clears protected cache and returns to sign-in when the session ends', async () => {
    replace.mockClear();
    const client = show({
      isPending: false,
      isError: true,
      error: new Error('UNAUTHORIZED'),
    });
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/?ended=1'));
    expect(client.getQueryData(['policies'])).toBeUndefined();
  });
});

function renderState(state: object) {
  vi.mocked(usePolicy).mockReturnValue(state as ReturnType<typeof usePolicy>);
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <PolicyDetail policyId="UNKNOWN" />
    </QueryClientProvider>,
  );
}
