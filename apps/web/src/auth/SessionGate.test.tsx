import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionGate } from './SessionGate';
import { getSession } from '../lib/api';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('../lib/api', () => ({
  getSession: vi.fn().mockRejectedValue(new Error('UNAUTHORIZED')),
}));

describe('FR-01 protected gate', () => {
  it('clears cached policy data and redirects when the session is rejected', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(['policies'], [{ id: 'POL-NARIN-001' }]);
    render(
      <QueryClientProvider client={queryClient}>
        <SessionGate>
          <p>Private policy</p>
        </SessionGate>
      </QueryClientProvider>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalled());
    expect(queryClient.getQueryData(['policies'])).toBeUndefined();
    expect(screen.queryByText('Private policy')).not.toBeInTheDocument();
  });

  it('clears policy data when the server expiry time has elapsed', async () => {
    vi.mocked(getSession).mockResolvedValueOnce({
      actor: { id: 'CUS-001', accountId: 'narin', name: 'Narin' },
      expiresAt: Date.now() - 1,
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(['policies'], [{ id: 'POL-NARIN-001' }]);
    render(
      <QueryClientProvider client={queryClient}>
        <SessionGate>
          <p>Private policy</p>
        </SessionGate>
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(queryClient.getQueryData(['policies'])).toBeUndefined(),
    );
    expect(screen.queryByText('Private policy')).not.toBeInTheDocument();
  });
});
