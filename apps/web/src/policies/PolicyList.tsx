'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { usePolicies } from '../lib/queries';
import { routes } from '../lib/routes';

export function PolicyList() {
  const query = usePolicies();
  const client = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    if (query.error?.message === 'UNAUTHORIZED') {
      client.clear();
      router.replace(`${routes.signIn}?ended=1`);
    }
  }, [query.error, client, router]);
  if (query.isPending) return <p role="status">Loading policies…</p>;
  if (query.isError)
    return query.error.message === 'UNAUTHORIZED' ? null : (
      <p role="alert">Could not load policies. Please refresh to try again.</p>
    );
  if (!query.data.policies.length) return <p>No linked policies yet.</p>;
  return (
    <ul className="policy-list">
      {query.data.policies.map((policy) => (
        <li key={policy.id}>
          <strong>{policy.id}</strong>
          <span>{policy.label}</span>
        </li>
      ))}
    </ul>
  );
}
