'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PolicyDto } from '@pea/api/contracts';
import { ApiError, getPolicy } from '@/lib/api';
import { redirectForExpiredSession } from '../layout';

export default function PolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [policy, setPolicy] = useState<PolicyDto | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState({ id, count: 0 });
  const attempt = retry.id === id ? retry.count : 0;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusedPolicyId = useRef<string | null>(null);
  useEffect(() => {
    if (policy?.id === id && focusedPolicyId.current !== id) {
      headingRef.current?.focus();
      focusedPolicyId.current = id;
    }
  }, [id, policy]);
  useEffect(() => {
    let active = true;
    setPolicy(null);
    setError('');
    getPolicy(id).then((response) => {
      if (active) setPolicy(response);
    }).catch((failure) => {
      if (!active) return;
      if (failure instanceof ApiError && failure.status === 401) {
        setPolicy(null);
        redirectForExpiredSession(router);
      }
      else if (failure instanceof ApiError && failure.status === 404) setError('Policy unavailable.');
      else setError('Policy is unavailable. Try again.');
    });
    return () => { active = false; };
  }, [id, router, attempt]);
  return <><Link href="/policies">Back to policies</Link>
    {error && <p role="alert">{error}</p>}
    {error === 'Policy is unavailable. Try again.' && <button type="button" onClick={() => setRetry({ id, count: attempt + 1 })}>Retry policy</button>}
    {!policy && !error && <p>Loading policy…</p>}
    {policy && <><p className="kicker">Synthetic policy</p><h1 tabIndex={-1} ref={headingRef}>{policy.id}</h1><p>Status: {policy.status}</p></>}
  </>;
}
