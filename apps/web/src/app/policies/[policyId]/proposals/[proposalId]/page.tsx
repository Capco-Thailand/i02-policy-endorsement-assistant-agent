import { SessionGate } from '../../../../../auth/SessionGate';
import { SignOutButton } from '../../../../../auth/SignOutButton';
import { ProposalPage } from '../../../../../endorsement/ProposalPage';

export default async function Page({
  params,
}: {
  params: Promise<{ policyId: string; proposalId: string }>;
}) {
  const { policyId, proposalId } = await params;
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
        <p className="auth-kicker">Customer access / Proposal review</p>
        <ProposalPage policyId={policyId} proposalId={proposalId} />
      </main>
    </SessionGate>
  );
}
