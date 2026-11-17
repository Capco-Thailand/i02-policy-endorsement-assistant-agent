import { SessionGate } from '../../../auth/SessionGate';
import { SignOutButton } from '../../../auth/SignOutButton';
import { PolicyDetail } from '../../../policies/PolicyDetail';

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ policyId: string }>;
}) {
  const { policyId } = await params;
  return (
    <SessionGate>
      <header className="site-header">
        <span className="brand-mark">PEA</span>
        <span>
          Policy Endorsement Assistant
          <small>Synthetic insurance prototype</small>
        </span>
        <SignOutButton />
      </header>
      <main className="policy-shell policy-detail-shell">
        <p className="auth-kicker">Customer access / Policy detail</p>
        <PolicyDetail policyId={policyId} />
      </main>
    </SessionGate>
  );
}
