import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProtectedHeader } from '@/components/ProtectedHeader';
import { FocusHeading } from '@/components/FocusHeading';
import { getCurrentCustomer, getPolicy, SESSION_COOKIE_NAME } from '@/lib/api';
import { ROUTES, SESSION_REASONS, signInRoute } from '@/lib/routes';

type RouteParams = Promise<{ id: string }>;

export default async function PolicyDetailPage({
  params,
}: {
  params: RouteParams;
}) {
  const { id } = await params;
  const returnTo = ROUTES.policyDetail(id);
  const cookieJar = await cookies();
  const token = cookieJar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect(signInRoute(returnTo));
  const cookieHeader = `${SESSION_COOKIE_NAME}=${token}`;
  const [customerResult, policyResult] = await Promise.all([
    getCurrentCustomer(cookieHeader),
    getPolicy(cookieHeader, id),
  ]);

  if (
    customerResult.kind === 'unauthorized' ||
    policyResult.kind === 'unauthorized'
  ) {
    redirect(signInRoute(returnTo, SESSION_REASONS.expired));
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
          <Link className="back-link" href={ROUTES.policies}>
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
        <Link className="back-link" href={ROUTES.policies}>
          Back to policies
        </Link>
        <FocusHeading>{policyResult.policy.id}</FocusHeading>
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
