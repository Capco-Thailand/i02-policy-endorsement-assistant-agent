import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProtectedHeader } from '@/components/ProtectedHeader';
import { getCurrentCustomer, getPolicy } from '@/lib/api';

type RouteParams = Promise<{ id: string }>;

function signInPath(returnTo: string, expired: boolean): string {
  const params = new URLSearchParams({ returnTo });
  if (expired) params.set('reason', 'expired');
  return `/sign-in?${params.toString()}`;
}

export default async function PolicyDetailPage({
  params,
}: {
  params: RouteParams;
}) {
  const { id } = await params;
  const returnTo = `/policies/${encodeURIComponent(id)}`;
  const cookieJar = await cookies();
  const token = cookieJar.get('pea_session')?.value;
  if (!token) redirect(signInPath(returnTo, false));
  const cookieHeader = `pea_session=${token}`;
  const [customerResult, policyResult] = await Promise.all([
    getCurrentCustomer(cookieHeader),
    getPolicy(cookieHeader, id),
  ]);

  if (
    customerResult.kind === 'unauthorized' ||
    policyResult.kind === 'unauthorized'
  ) {
    redirect(signInPath(returnTo, true));
  }
  if (customerResult.kind !== 'ok') {
    return (
      <main className="shell">
        <h1 className="page-title">Policy is unavailable</h1>
        <p className="notice" role="alert">
          Policy information is unavailable. Try again.
        </p>
      </main>
    );
  }
  if (policyResult.kind === 'not-found') {
    return (
      <>
        <ProtectedHeader customer={customerResult.customer} />
        <main className="shell">
          <h1 className="page-title">Policy unavailable</h1>
          <p className="notice" role="status">
            This policy is unavailable.
          </p>
          <Link className="back-link" href="/policies">
            Back to policies
          </Link>
        </main>
      </>
    );
  }
  if (policyResult.kind !== 'ok') {
    return (
      <main className="shell">
        <h1 className="page-title">Policy is unavailable</h1>
        <p className="notice" role="alert">
          Policy information is unavailable. Try again.
        </p>
      </main>
    );
  }

  return (
    <>
      <ProtectedHeader customer={customerResult.customer} />
      <main className="shell">
        <Link className="back-link" href="/policies">
          Back to policies
        </Link>
        <h1 className="page-title">{policyResult.policy.id}</h1>
        <p className="intro">Synthetic policy details</p>
        <section
          aria-labelledby="policy-status-heading"
          className="policy-card"
        >
          <h2 id="policy-status-heading">Policy status</h2>
          <p
            className={`policy-status ${policyResult.policy.status.toLowerCase()}`}
          >
            {policyResult.policy.status === 'ACTIVE' ? 'Active' : 'Expired'}
          </p>
        </section>
      </main>
    </>
  );
}
