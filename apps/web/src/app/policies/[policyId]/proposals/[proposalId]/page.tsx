import { SessionGate } from '../../../../../auth/SessionGate';
import { SignOutButton } from '../../../../../auth/SignOutButton';
import { ProposalPage } from '../../../../../endorsement/ProposalPage';
import { Brand } from '../../../../../components/Brand';

export default async function Page({
  params,
}: {
  params: Promise<{ policyId: string; proposalId: string }>;
}) {
  const { policyId, proposalId } = await params;
  return (
    <SessionGate>
      <header className="site-header">
        <Brand />
        <SignOutButton />
      </header>
      <main className="policy-shell">
        <p className="auth-kicker">Customer access / Proposal review</p>
        <ProposalPage policyId={policyId} proposalId={proposalId} />
      </main>
    </SessionGate>
  );
}
