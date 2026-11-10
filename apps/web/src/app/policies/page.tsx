'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PolicyDto } from '@pea/api/contracts';
import { ApiError, getPolicies } from '@/lib/api';
import { redirectForExpiredSession } from './layout';

export default function PoliciesPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<PolicyDto[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  useEffect(() => {
    let active = true;
    setPolicies(null);
    setError(false);
    getPolicies().then((response) => {
      if (active) setPolicies(response.policies);
    }).catch((failure) => {
      if (!active) return;
      if (failure instanceof ApiError && failure.status === 401) {
        setPolicies(null);
        redirectForExpiredSession(router);
      }
      else setError(true);
    });
    return () => { active = false; };
  }, [router, attempt]);
  return <><p className="kicker">Assigned work</p><h1 tabIndex={-1} ref={headingRef}>Policies</h1>
    {error && <div role="alert"><p>Policies are unavailable. Try again.</p><button type="button" onClick={() => setAttempt((value) => value + 1)}>Retry policies</button></div>}
    {!error && policies === null && <p>Loading policies…</p>}
    {policies?.length === 0 && <p>No policies are assigned to your account.</p>}
    {policies && <ul className="policy-list">{policies.map((policy) => <li key={policy.id}><Link href={`/policies/${encodeURIComponent(policy.id)}`}>{policy.id}</Link><span>{policy.status}</span></li>)}</ul>}
  </>;
}
