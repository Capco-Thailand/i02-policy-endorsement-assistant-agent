import { SessionGate } from '../../auth/SessionGate';
import { SignOutButton } from '../../auth/SignOutButton';
import { ChangeHistory } from '../../endorsement/ChangeHistory';
import { Brand } from '../../components/Brand';

export default function HistoryPage() {
  return (
    <SessionGate>
      <header className="site-header">
        <Brand />
        <SignOutButton />
      </header>
      <ChangeHistory />
    </SessionGate>
  );
}
