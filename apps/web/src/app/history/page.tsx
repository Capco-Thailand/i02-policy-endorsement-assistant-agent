import { SessionGate } from '../../auth/SessionGate';
import { SignOutButton } from '../../auth/SignOutButton';
import { ChangeHistory } from '../../endorsement/ChangeHistory';

export default function HistoryPage() {
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
      <ChangeHistory />
    </SessionGate>
  );
}
