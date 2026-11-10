'use client';

import { use, useEffect, useState } from 'react';
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
  useEffect(() => {
    getPolicy(id).then(setPolicy).catch((failure) => {
      if (failure instanceof ApiError && failure.status === 401) {
        setPolicy(null);
        redirectForExpiredSession(router);
      }
      else if (failure instanceof ApiError && failure.status === 404) setError('Policy unavailable.');
      else setError('Policy is unavailable. Try again.');
    });
  }, [id, router]);
  return <><Link href="/policies">Back to policies</Link>
    {error && <p role="alert">{error}</p>}
    {!policy && !error && <p>Loading policy…</p>}
    {policy && <><p className="kicker">Synthetic policy</p><h1 tabIndex={-1} ref={(node) => node?.focus()}>{policy.id}</h1><p>Status: {policy.status}</p></>}
  </>;
}
