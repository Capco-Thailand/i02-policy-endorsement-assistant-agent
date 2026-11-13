import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProtectedHeader } from '@/components/ProtectedHeader';
import { FocusHeading } from '@/components/FocusHeading';
import {
  getCurrentCustomer,
  getPolicies,
  SESSION_COOKIE_NAME,
} from '@/lib/api';
import { ROUTES, SESSION_REASONS, signInRoute } from '@/lib/routes';

export default async function PoliciesPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect(signInRoute(ROUTES.policies));
  const cookieHeader = `${SESSION_COOKIE_NAME}=${token}`;
  const [customerResult, policiesResult] = await Promise.all([
    getCurrentCustomer(cookieHeader),
    getPolicies(cookieHeader),
  ]);

  if (
    customerResult.kind === 'unauthorized' ||
    policiesResult.kind === 'unauthorized'
  ) {
    redirect(signInRoute(ROUTES.policies, SESSION_REASONS.expired));
  }
  if (customerResult.kind !== 'ok' || policiesResult.kind !== 'ok') {
    return (
      <>
        <main className="shell">
          <h1 className="page-title">Policies are unavailable</h1>
          <p className="notice" role="alert">
            Policy information is unavailable. Try again.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <ProtectedHeader customer={customerResult.customer} />
      <main className="shell">
        <FocusHeading>Your policies</FocusHeading>
        <p className="intro">
          Only synthetic policies linked to your account appear here.
        </p>
        {policiesResult.policies.length === 0 ? (
          <p className="notice">No linked policies are available.</p>
        ) : (
          <ul className="policy-grid">
            {policiesResult.policies.map((policy) => (
              <li key={policy.id}>
                <Link
                  className="policy-card"
                  href={ROUTES.policyDetail(policy.id)}
                >
                  <h2>{policy.id}</h2>
                  <span
                    className={`policy-status ${policy.status.toLowerCase()}`}
                  >
                    {policy.status === 'ACTIVE' ? 'Active' : 'Expired'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
