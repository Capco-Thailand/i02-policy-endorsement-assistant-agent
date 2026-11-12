import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SignOutButton } from './SignOutButton';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('FR-01 AC3: signed-in customer sign-out', () => {
  it('calls the API and navigates to the signed-out notice even when the session already ended', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401 });
    vi.stubGlobal('fetch', fetchMock);
    const queryClient = new QueryClient();
    queryClient.setQueryData(['policies'], [{ id: 'SYN-POL-1001' }]);
    render(
      <QueryClientProvider client={queryClient}>
        <SignOutButton navigate={navigate} />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/auth/sign-out',
      {
        method: 'POST',
        credentials: 'include',
      },
    );
    expect(navigate).toHaveBeenCalledWith('/sign-in?reason=signed-out');
    expect(queryClient.getQueryData(['policies'])).toBeUndefined();
  });

  it('does not claim sign-out when the API cannot revoke the session', async () => {
    const navigate = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SignOutButton navigate={navigate} />
      </QueryClientProvider>,
    );

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Sign out' }));

    expect(navigate).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sign-out is unavailable. Try again.',
    );
  });
});
