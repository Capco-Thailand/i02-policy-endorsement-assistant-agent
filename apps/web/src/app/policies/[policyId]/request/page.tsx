import { SessionGate } from '../../../../auth/SessionGate';
import { SignOutButton } from '../../../../auth/SignOutButton';
import { RequestForm } from '../../../../endorsement/RequestForm';

export default async function RequestPage({
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
      <main className="policy-shell">
        <p className="auth-kicker">Customer access / Change request</p>
        <RequestForm policyId={policyId} />
      </main>
    </SessionGate>
  );
}
