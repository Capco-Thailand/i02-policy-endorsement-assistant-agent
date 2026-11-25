'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface Props {
  onSignIn: (accountId: string, password: string) => Promise<unknown>;
}
export function SignInForm({ onSignIn }: Props) {
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [missing, setMissing] = useState({ accountId: false, password: false });
  const [pending, setPending] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError('');
    const nextMissing = {
      accountId: accountId.trim().length === 0,
      password: password.length === 0,
    };
    setMissing(nextMissing);
    if (nextMissing.accountId || nextMissing.password) {
      (nextMissing.accountId ? accountRef : passwordRef).current?.focus();
      return;
    }
    setPending(true);
    try {
      await onSignIn(accountId, password);
    } catch (cause) {
      setPassword('');
      setError(
        cause instanceof Error && cause.message === 'INVALID_CREDENTIALS'
          ? "We couldn't sign you in. Check your details and try again."
          : 'Sign-in is unavailable. Please try again.',
      );
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="auth-panel">
      <p className="auth-kicker">Customer sign-in</p>
      <h2>Your demo account</h2>
      {error && (
        <Alert variant="destructive" role="alert" tabIndex={-1} ref={errorRef}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <FieldGroup className="gap-4">
        <Field data-invalid={missing.accountId || undefined}>
          <FieldLabel htmlFor="account-id">Account ID</FieldLabel>
          <Input
            ref={accountRef}
            id="account-id"
            name="accountId"
            autoComplete="username"
            required
            aria-invalid={missing.accountId}
            aria-describedby={
              missing.accountId ? 'account-id-error' : undefined
            }
            value={accountId}
            onChange={(event) => {
              setAccountId(event.target.value);
              setMissing((previous) => ({ ...previous, accountId: false }));
            }}
            className="h-11"
          />
          {missing.accountId && (
            <FieldError id="account-id-error">
              Enter your account ID.
            </FieldError>
          )}
        </Field>
        <Field data-invalid={missing.password || undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={missing.password}
            aria-describedby={missing.password ? 'password-error' : undefined}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setMissing((previous) => ({ ...previous, password: false }));
            }}
            className="h-11"
          />
          {missing.password && (
            <FieldError id="password-error">Enter your password.</FieldError>
          )}
        </Field>
      </FieldGroup>
      <Button className="mt-6 h-11 w-full" type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
      <p className="auth-note">Synthetic demo account</p>
    </form>
  );
}
