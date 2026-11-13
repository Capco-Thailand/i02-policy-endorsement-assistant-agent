'use client';

import React, { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@/hooks/useSignIn';
import { ROUTES, type AppRoute, type NavigationTarget } from '@/lib/routes';

type SignInFormProps = {
  returnTo: AppRoute;
  navigate?: (destination: NavigationTarget) => void;
};

export function SignInForm({ returnTo, navigate }: SignInFormProps) {
  const router = useRouter();
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const signIn = useSignIn();

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (signIn.isPending) return;
    setError(null);
    try {
      const response = await signIn.mutateAsync({ accountId, password });
      if (response.ok) {
        (navigate ?? router.push)(returnTo || ROUTES.policies);
        return;
      }
      const message =
        response.status === 401
          ? 'Sign-in failed. Check your account ID and password.'
          : 'Sign-in is unavailable. Try again.';
      setPassword('');
      setError(message);
    } catch {
      setPassword('');
      setError('Sign-in is unavailable. Try again.');
    }
  }

  return (
    <form className="credential-form" method="post" onSubmit={handleSubmit}>
      <div className="auth-field">
        <label htmlFor="account-id">Account ID</label>
        <input
          aria-describedby={error ? 'sign-in-error' : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete="username"
          id="account-id"
          name="accountId"
          onChange={(event) => setAccountId(event.target.value)}
          required
          value={accountId}
        />
      </div>
      <div className="auth-field">
        <label htmlFor="password">Password</label>
        <input
          aria-describedby={error ? 'sign-in-error' : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete="current-password"
          id="password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>
      {error ? (
        <p
          aria-live="assertive"
          className="auth-message error"
          id="sign-in-error"
          ref={errorRef}
          role="alert"
          tabIndex={-1}
        >
          {error}
        </p>
      ) : null}
      <button
        className="button auth-submit"
        disabled={signIn.isPending}
        type="submit"
      >
        {signIn.isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
