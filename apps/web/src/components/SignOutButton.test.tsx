import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
    render(<SignOutButton navigate={navigate} />);

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/auth/sign-out',
      {
        method: 'POST',
        credentials: 'include',
      },
    );
    expect(navigate).toHaveBeenCalledWith('/sign-in?reason=signed-out');
  });
});
