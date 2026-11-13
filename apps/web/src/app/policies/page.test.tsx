import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PoliciesPage from './page';
import SignInPage from '../sign-in/page';

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: 'expired-session' }) }),
}));
vi.mock('next/navigation', () => ({
  redirect: (destination: string) => {
    throw new Error(`redirect:${destination}`);
  },
}));
describe('FR-01 AC2: protected route after session expiry', () => {
  it('redirects a stale cookie to sign-in with the expiry notice and no policy data', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ status: 401, ok: false });
    vi.stubGlobal('fetch', fetchMock);
    let destination = '';
    try {
      await PoliciesPage();
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('redirect:')) {
        destination = error.message.slice('redirect:'.length);
      } else {
        throw error;
      }
    }

    expect(destination).toBe('/sign-in?returnTo=%2Fpolicies&reason=expired');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const url = new URL(destination, 'http://localhost:3001');
    render(
      <QueryClientProvider client={new QueryClient()}>
        {await SignInPage({
          searchParams: Promise.resolve(Object.fromEntries(url.searchParams)),
        })}
      </QueryClientProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Your session ended. Sign in again to continue.',
    );
    expect(screen.queryByText('SYN-POL-1001')).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
