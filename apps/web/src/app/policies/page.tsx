import { SessionGate } from '../../auth/SessionGate';
import { SignOutButton } from '../../auth/SignOutButton';
import { PolicyList } from '../../policies/PolicyList';
import { FocusHeading } from '../../policies/FocusHeading';
import Link from 'next/link';
import { routes } from '../../lib/routes';

export default function PoliciesPage() {
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
        <p className="auth-kicker">Customer access / Policies</p>
        <FocusHeading>Your policies</FocusHeading>
        <p>Select a policy to review its current details.</p>
        <Link className="history-nav" href={routes.history}>
          Customer change history
        </Link>
        <PolicyList />
        <p className="policy-note">
          Synthetic policy data for this prototype. Viewing a policy does not
          change coverage.
        </p>
      </main>
    </SessionGate>
  );
}
