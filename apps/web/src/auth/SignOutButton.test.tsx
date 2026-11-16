import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SignOutButton } from './SignOutButton';
import { signOut } from '../lib/api';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('../lib/api', () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

describe('FR-01 sign-out', () => {
  it('waits for API invalidation, clears protected cache, and returns to sign-in', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['policies'], [{ id: 'POL-MALI-001' }]);
    render(
      <QueryClientProvider client={queryClient}>
        <SignOutButton />
      </QueryClientProvider>,
    );
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(queryClient.getQueryData(['policies'])).toBeUndefined();
  });
  it('clears protected state when sign-out discovers an invalid session', async () => {
    vi.mocked(signOut).mockRejectedValueOnce(new Error('UNAUTHORIZED'));
    const queryClient = new QueryClient();
    queryClient.setQueryData(['policies'], [{ id: 'POL-MALI-001' }]);
    render(
      <QueryClientProvider client={queryClient}>
        <SignOutButton />
      </QueryClientProvider>,
    );
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() =>
      expect(queryClient.getQueryData(['policies'])).toBeUndefined(),
    );
    expect(replace).toHaveBeenCalledWith('/?ended=1');
  });
});
