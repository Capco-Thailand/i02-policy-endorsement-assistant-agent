'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, currentActor, signIn } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function safeReturnPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/policies';
  return value.startsWith('/sign-in') ? '/policies' : value;
}

export default function SignInPage() {
  const router = useRouter();
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(true);
  const [notice, setNotice] = useState('');
  const errorRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get('reason');
    setNotice(reason === 'expired' ? 'Your session ended. Sign in again to continue.' : reason === 'signed-out' ? 'You signed out.' : '');
    currentActor().then(() => router.replace(safeReturnPath(new URLSearchParams(window.location.search).get('next')))).catch(() => setChecking(false));
  }, [router]);

  useEffect(() => {
    if (!checking && notice) headingRef.current?.focus();
  }, [checking, notice]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError('');
    setPending(true);
    try {
      await signIn(accountId, password);
      const target = safeReturnPath(new URLSearchParams(window.location.search).get('next'));
      router.replace(target);
    } catch (failure) {
      setPassword('');
      setError(failure instanceof ApiError && failure.status === 401
        ? 'Sign-in failed. Check your account ID and password.'
        : 'Sign-in is unavailable. Try again.');
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setPending(false);
    }
  }

  if (checking) return <main className="auth-shell"><p>Checking session…</p></main>;

  return <><header className="site-header"><span className="brand-mark">PE</span><span>Policy Endorsement Assistant<small>Staff workspace · synthetic demo</small></span></header>
    <main className="auth-shell">
      <p className="kicker">Staff workspace</p>
      <h1 ref={headingRef} tabIndex={-1}>Staff sign in</h1>
      <p className="intro">Use your individual demo account to work with assigned synthetic policies.</p>
      {notice && <p className="session-notice" role="status">{notice}</p>}
      <section className="auth-panel" aria-label="Sign-in form">
        <form onSubmit={submit}>
          <Label htmlFor="account-id">Account ID</Label>
          <Input id="account-id" autoComplete="username" required value={accountId} onChange={(event) => setAccountId(event.target.value)} />
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby={error ? 'sign-in-error' : undefined} />
          {error && <p id="sign-in-error" className="form-error" role="alert" tabIndex={-1} ref={errorRef}>{error}</p>}
          <Button type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</Button>
        </form>
        <p className="form-footer">Synthetic demo accounts only.</p>
      </section>
    </main></>;
}
