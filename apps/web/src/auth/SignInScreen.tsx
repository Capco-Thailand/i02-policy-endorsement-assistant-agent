'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SignInForm } from './SignInForm';
import { useSignIn } from '../lib/queries';
import { routes } from '../lib/routes';

export function SignInScreen({ ended }: { ended: boolean }) {
  const signIn = useSignIn();
  const client = useQueryClient();
  const router = useRouter();
  async function submit(accountId: string, password: string) {
    const session = await signIn.mutateAsync({ accountId, password });
    client.clear();
    client.setQueryData(['session'], session);
    router.replace(routes.policies);
  }
  return (
    <>
      <header className="site-header">
        <span className="brand-mark">PEA</span>
        <span>
          Policy Endorsement Assistant
          <small>Synthetic insurance prototype</small>
        </span>
      </header>
      <main className="auth-shell">
        <section className="auth-copy">
          <p className="auth-kicker">Customer access / Sign in</p>
          <h1 className="auth-title">Sign in to view your policies.</h1>
          <p className="auth-intro">
            Use your synthetic demo account to view policies linked to you and
            request a change.
          </p>
          <p className="auth-boundary">
            <strong>Prototype only</strong> No live policy or coverage is
            changed here.
          </p>
        </section>
        <div>
          {ended && (
            <Alert role="status" className="mb-5">
              <AlertDescription>
                Your session ended. Sign in again.
              </AlertDescription>
            </Alert>
          )}
          <SignInForm onSignIn={submit} />
        </div>
      </main>
    </>
  );
}
