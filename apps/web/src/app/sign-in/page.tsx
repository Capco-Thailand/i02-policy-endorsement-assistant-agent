import { SignInForm } from './SignInForm';
import { safeDestination } from '@/lib/navigation';
import { SessionNotice } from '@/components/SessionNotice';
import { SESSION_REASONS } from '@/lib/routes';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const reason = firstValue(params.reason);
  const noticeReason =
    reason === SESSION_REASONS.expired || reason === SESSION_REASONS.signedOut
      ? reason
      : null;
  const returnTo = safeDestination(firstValue(params.returnTo));

  return (
    <main className="auth-shell">
      <section aria-labelledby="page-title" className="auth-copy">
        <p className="auth-kicker">
          Customer access <span aria-hidden="true">·</span> Synthetic demo
        </p>
        <h1 className="auth-title" id="page-title">
          Sign in to request a policy change
        </h1>
        <p className="auth-intro">
          Use your demo account to view your synthetic policies and request a
          change.
        </p>
        <p className="auth-boundary">
          <strong>Synthetic demo accounts only</strong>
          <span>
            This prototype does not connect to live insurer systems or change
            coverage.
          </span>
        </p>
      </section>
      <section aria-labelledby="form-title" className="auth-panel">
        <div className="auth-panel-heading">
          <p className="auth-panel-kicker">Account access</p>
          <h2 id="form-title">Enter your credentials</h2>
        </div>
        {noticeReason ? <SessionNotice reason={noticeReason} /> : null}
        <SignInForm returnTo={returnTo} />
        <p className="auth-footer">
          You can access only your policies. Review proposed changes before you
          approve them; approved changes appear in history. No live coverage
          changes here.
        </p>
      </section>
    </main>
  );
}
