import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignInForm } from './SignInForm';

describe('FR-01 sign-in form', () => {
  it('FR-16 sign-in names the synthetic demo account boundary', () => {
    render(<SignInForm onSignIn={vi.fn()} />);
    expect(screen.getByText('Synthetic demo account')).toBeInTheDocument();
  });
  it('names and associates missing account ID and password fields', async () => {
    const signIn = vi.fn();
    render(<SignInForm onSignIn={signIn} />);
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Sign in' }));
    const account = screen.getByLabelText('Account ID');
    const password = screen.getByLabelText('Password');
    expect(screen.getByText('Enter your account ID.')).toHaveAttribute(
      'id',
      'account-id-error',
    );
    expect(screen.getByText('Enter your password.')).toHaveAttribute(
      'id',
      'password-error',
    );
    expect(account).toHaveAttribute('aria-describedby', 'account-id-error');
    expect(password).toHaveAttribute('aria-describedby', 'password-error');
    expect(account).toHaveAttribute('aria-invalid', 'true');
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(account).toHaveFocus();
    expect(signIn).not.toHaveBeenCalled();
    await userEvent.setup().type(account, 'mali');
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Sign in' }));
    expect(
      screen.queryByText('Enter your account ID.'),
    ).not.toBeInTheDocument();
    expect(password).toHaveFocus();
  });

  it('shows a generic credential error, preserves account ID, and clears password', async () => {
    const signIn = vi.fn().mockRejectedValue(new Error('INVALID_CREDENTIALS'));
    render(<SignInForm onSignIn={signIn} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Account ID'), 'mali');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "We couldn't sign you in. Check your details and try again.",
    );
    expect(screen.getByLabelText('Account ID')).toHaveValue('mali');
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });
});
