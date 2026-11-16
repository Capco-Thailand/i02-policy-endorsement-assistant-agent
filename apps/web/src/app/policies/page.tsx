import { SessionGate } from '../../auth/SessionGate';
import { SignOutButton } from '../../auth/SignOutButton';
import { PolicyList } from '../../policies/PolicyList';

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
        <h1>Your linked policies</h1>
        <p>Only synthetic policies linked to your account appear here.</p>
        <PolicyList />
      </main>
    </SessionGate>
  );
}
