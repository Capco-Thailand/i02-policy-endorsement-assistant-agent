'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PolicyDto } from '@pea/api/contracts';
import { ApiError, getPolicies } from '@/lib/api';
import { redirectForExpiredSession } from './layout';

export default function PoliciesPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<PolicyDto[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    getPolicies().then((response) => setPolicies(response.policies)).catch((failure) => {
      if (failure instanceof ApiError && failure.status === 401) {
        setPolicies(null);
        redirectForExpiredSession(router);
      }
      else setError(true);
    });
  }, [router]);
  return <><p className="kicker">Assigned work</p><h1 tabIndex={-1} ref={(node) => node?.focus()}>Policies</h1>
    {error && <p role="alert">Policies are unavailable. Try again.</p>}
    {!error && policies === null && <p>Loading policies…</p>}
    {policies?.length === 0 && <p>No policies are assigned to your account.</p>}
    {policies && <ul className="policy-list">{policies.map((policy) => <li key={policy.id}><Link href={`/policies/${encodeURIComponent(policy.id)}`}>{policy.id}</Link><span>{policy.status}</span></li>)}</ul>}
  </>;
}
