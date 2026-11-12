import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProtectedHeader } from '@/components/ProtectedHeader';
import { getCurrentCustomer, getPolicies } from '@/lib/api';

function signInPath(returnTo: string, expired: boolean): string {
  const params = new URLSearchParams({ returnTo });
  if (expired) params.set('reason', 'expired');
  return `/sign-in?${params.toString()}`;
}

export default async function PoliciesPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get('pea_session')?.value;
  if (!token) redirect(signInPath('/policies', false));
  const cookieHeader = `pea_session=${token}`;
  const [customerResult, policiesResult] = await Promise.all([
    getCurrentCustomer(cookieHeader),
    getPolicies(cookieHeader),
  ]);

  if (
    customerResult.kind === 'unauthorized' ||
    policiesResult.kind === 'unauthorized'
  ) {
    redirect(signInPath('/policies', true));
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
        <h1 className="page-title">Your policies</h1>
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
                  href={`/policies/${encodeURIComponent(policy.id)}`}
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
