import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignInForm } from './SignInForm';

describe('FR-01 AC1: customer sign-in form', () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('labels credentials, reports generic rejection, clears password, and focuses the error', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: 'Sign-in failed. Check your account ID and password.',
        }),
      }),
    );
    render(<SignInForm returnTo="/policies" />);

    const account = screen.getByRole('textbox', { name: 'Account ID' });
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');
    await user.type(account, 'demo-alice');
    await user.type(password, 'bad-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    const error = await screen.findByRole('alert');
    expect(error).toHaveTextContent(
      'Sign-in failed. Check your account ID and password.',
    );
    expect(account).toHaveAttribute('aria-describedby', 'sign-in-error');
    expect(password).toHaveAttribute('aria-describedby', 'sign-in-error');
    expect(account).toHaveValue('demo-alice');
    expect(password).toHaveValue('');
    await waitFor(() => expect(error).toHaveFocus());
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/auth/sign-in', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: 'demo-alice',
        password: 'bad-password',
      }),
    });
  });

  it('disables duplicate submission and presents a busy label while the request is pending', async () => {
    const user = userEvent.setup();
    let complete:
      | ((response: { ok: boolean; status: number }) => void)
      | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            complete = resolve;
          }),
      ),
    );
    render(<SignInForm returnTo="/policies" />);
    await user.type(
      screen.getByRole('textbox', { name: 'Account ID' }),
      'demo-alice',
    );
    await user.type(screen.getByLabelText('Password'), 'alice-demo-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    const busyButton = screen.getByRole('button', { name: 'Signing in…' });
    expect(busyButton).toBeDisabled();
    fireEvent.click(busyButton);
    expect(fetch).toHaveBeenCalledTimes(1);
    complete?.({ ok: false, status: 503 });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sign-in is unavailable. Try again.',
    );
  });

  it('navigates only after the API accepts credentials', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );
    render(
      <SignInForm returnTo="/policies/SYN-POL-1001" navigate={navigate} />,
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Account ID' }),
      'demo-alice',
    );
    await user.type(screen.getByLabelText('Password'), 'alice-demo-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith('/policies/SYN-POL-1001'),
    );
  });
});
