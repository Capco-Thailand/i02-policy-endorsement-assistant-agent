'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { StaffDto } from '@pea/api/contracts';
import { ApiError, currentActor, signOut } from '@/lib/api';

export function redirectForExpiredSession(router: ReturnType<typeof useRouter>, expired = true) {
  const next = window.location.pathname;
  router.replace(`/sign-in?${expired ? 'reason=expired&' : ''}next=${encodeURIComponent(next)}`);
}

export default function PoliciesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [actor, setActor] = useState<StaffDto | null>(null);
  const [checking, setChecking] = useState(true);
  const [sessionCheckFailed, setSessionCheckFailed] = useState(false);
  const [checkAttempt, setCheckAttempt] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);
  const latestCheck = useRef(0);
  const hadActor = useRef(false);

  useEffect(() => {
    let active = true;
    async function check() {
      const checkId = ++latestCheck.current;
      try {
        const response = await currentActor();
        if (active && checkId === latestCheck.current) {
          hadActor.current = true;
          setActor(response.actor);
          setSessionCheckFailed(false);
        }
      } catch (error) {
        if (active && checkId === latestCheck.current && error instanceof ApiError && error.status === 401) {
          setActor(null);
          redirectForExpiredSession(router, hadActor.current);
        } else if (active && checkId === latestCheck.current) {
          setActor(null);
          setSessionCheckFailed(true);
        }
      } finally {
        if (active && checkId === latestCheck.current) setChecking(false);
      }
    }
    void check();
    const timer = window.setInterval(check, 30_000);
    return () => { active = false; latestCheck.current++; window.clearInterval(timer); };
  }, [router, checkAttempt]);

  function retrySessionCheck() {
    setActor(null);
    setSessionCheckFailed(false);
    setChecking(true);
    setCheckAttempt((attempt) => attempt + 1);
  }

  async function leave() {
    if (signingOut) return;
    latestCheck.current++;
    setSigningOut(true);
    setSignOutFailed(false);
    try {
      await signOut();
      setActor(null);
      router.replace('/sign-in?reason=signed-out');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setActor(null);
        router.replace('/sign-in?reason=signed-out');
      } else {
        setSignOutFailed(true);
      }
    } finally {
      setSigningOut(false);
    }
  }

  if (signingOut || signOutFailed) return <main className="page-shell">
    {signOutFailed ? <><p role="alert">Sign-out is unavailable. Try again.</p><button type="button" onClick={leave}>Retry sign out</button></> : <p>Signing out…</p>}
  </main>;
  if (sessionCheckFailed) return <main className="page-shell"><p role="alert">Session check is unavailable. Try again.</p><button type="button" onClick={retrySessionCheck}>Retry session check</button></main>;
  if (checking || !actor) return <main className="page-shell"><p>Checking session…</p></main>;
  return <><header className="site-header"><span className="brand-mark">PE</span><span>Policy Endorsement Assistant<small>Staff workspace · synthetic demo</small></span><div className="account-control"><span>{actor.displayName}</span><button type="button" className="text-button" onClick={leave}>Sign out</button></div></header><main className="page-shell" key={actor.id}>{children}</main></>;
}
