'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
      <div>
        <p role="alert">Could not load policies. Try again.</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void query.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  if (!query.data.policies.length)
    return <p>No policies are linked to this account.</p>;
  return (
    <ul className="policy-list">
      {query.data.policies.map((policy) => (
        <li key={policy.id}>
          <Link className="policy-card" href={routes.policy(policy.id)}>
            <span className="policy-card-head">
              <span>
                <strong>{policy.label}</strong>
                <span className="policy-id">{policy.id}</span>
              </span>
              <span className={`policy-status ${policy.status.toLowerCase()}`}>
                {policy.status}
              </span>
            </span>
            <span className="policy-linkline">
              View policy <span aria-hidden="true">→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
