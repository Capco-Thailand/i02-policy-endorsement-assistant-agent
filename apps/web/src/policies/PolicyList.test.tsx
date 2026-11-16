import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PolicyList } from './PolicyList';
import { usePolicies } from '../lib/queries';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('../lib/queries', () => ({ usePolicies: vi.fn() }));

const show = (state: object) => {
  vi.mocked(usePolicies).mockReturnValue(
    state as ReturnType<typeof usePolicies>,
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PolicyList />
    </QueryClientProvider>,
  );
};

describe('FR-03 policy list', () => {
  it('makes each owned policy a link with a visible status', () => {
    show({
      isPending: false,
      isError: false,
      data: {
        policies: [
          {
            id: 'POL-NARIN-001',
            label: 'Family Protection Plan',
            status: 'ACTIVE',
          },
          {
            id: 'POL-NARIN-002',
            label: 'Classic Life Plan',
            status: 'EXPIRED',
          },
        ],
      },
    });
    expect(
      screen.getByRole('link', { name: /Family Protection Plan.*ACTIVE/i }),
    ).toHaveAttribute('href', '/policies/POL-NARIN-001');
    expect(
      screen.getByRole('link', { name: /Classic Life Plan.*EXPIRED/i }),
    ).toHaveAttribute('href', '/policies/POL-NARIN-002');
  });

  it('shows distinct empty and service failure states', () => {
    const { unmount } = renderState({
      isPending: false,
      isError: false,
      data: { policies: [] },
    });
    expect(
      screen.getByText('No policies are linked to this account.'),
    ).toBeInTheDocument();
    unmount();
    const refetch = vi.fn();
    renderState({
      isPending: false,
      isError: true,
      error: new Error('API_UNAVAILABLE'),
      refetch,
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      /Could not load policies/,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('clears protected list data and returns to sign-in when the session ends', async () => {
    replace.mockClear();
    const client = new QueryClient();
    client.setQueryData(['policies'], { policies: [{ id: 'POL-NARIN-001' }] });
    vi.mocked(usePolicies).mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error('UNAUTHORIZED'),
    } as ReturnType<typeof usePolicies>);
    render(
      <QueryClientProvider client={client}>
        <PolicyList />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/?ended=1'));
    expect(client.getQueryData(['policies'])).toBeUndefined();
    expect(screen.queryByText('POL-NARIN-001')).not.toBeInTheDocument();
  });
});

function renderState(state: object) {
  vi.mocked(usePolicies).mockReturnValue(
    state as ReturnType<typeof usePolicies>,
  );
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <PolicyList />
    </QueryClientProvider>,
  );
}
