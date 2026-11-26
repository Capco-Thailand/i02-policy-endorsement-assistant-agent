import { SessionGate } from '../../../../auth/SessionGate';
import { SignOutButton } from '../../../../auth/SignOutButton';
import { RequestForm } from '../../../../endorsement/RequestForm';
import { Brand } from '../../../../components/Brand';

export default async function RequestPage({
  params,
}: {
  params: Promise<{ policyId: string }>;
}) {
  const { policyId } = await params;
  return (
    <SessionGate>
      <header className="site-header">
        <Brand />
        <SignOutButton />
      </header>
      <main className="policy-shell">
        <RequestForm policyId={policyId} />
      </main>
    </SessionGate>
  );
}
