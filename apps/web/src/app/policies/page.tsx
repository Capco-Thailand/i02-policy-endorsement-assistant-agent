import { SessionGate } from '../../auth/SessionGate';
import { SignOutButton } from '../../auth/SignOutButton';
import { PolicyList } from '../../policies/PolicyList';
import { FocusHeading } from '../../policies/FocusHeading';
import Link from 'next/link';
import { routes } from '../../lib/routes';
import { Brand } from '../../components/Brand';

export default function PoliciesPage() {
  return (
    <SessionGate>
      <header className="site-header">
        <Brand />
        <SignOutButton />
      </header>
      <main className="policy-shell policy-list-shell">
        <p className="auth-kicker">Customer access / Policies</p>
        <div className="policy-list-heading">
          <FocusHeading>Your policies</FocusHeading>
          <Link className="history-nav" href={routes.history}>
            Change history
          </Link>
        </div>
        <p>Choose a policy to review its current details.</p>
        <p>Only policies linked to this demo account appear here.</p>
        <PolicyList />
      </main>
    </SessionGate>
  );
}
