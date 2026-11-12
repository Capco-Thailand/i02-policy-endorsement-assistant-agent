'use client';

import React, { useEffect, useRef, useState, type FormEvent } from 'react';

type SignInFormProps = {
  returnTo: string;
  navigate?: (destination: string) => void;
};

type SignInErrorResponse = { error?: string };

const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export function SignInForm({
  returnTo,
  navigate = (destination) => window.location.assign(destination),
}: SignInFormProps) {
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiOrigin}/auth/sign-in`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, password }),
      });
      if (response.ok) {
        navigate(returnTo);
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
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="credential-form" onSubmit={handleSubmit}>
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
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
