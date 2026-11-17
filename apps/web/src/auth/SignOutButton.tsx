'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSignOut } from '../lib/queries';
import { routes } from '../lib/routes';

export function SignOutButton() {
  const signOut = useSignOut();
  const queryClient = useQueryClient();
  const router = useRouter();
  async function submit() {
    try {
      await signOut.mutateAsync();
      queryClient.clear();
      router.replace(routes.signIn);
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        queryClient.clear();
        router.replace(`${routes.signIn}?ended=1`);
      }
    }
  }
  return (
    <div className="sign-out">
      <Button
        variant="link"
        type="button"
        onClick={submit}
        disabled={signOut.isPending}
      >
        Sign out
      </Button>
      {signOut.isError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>
            Could not sign out. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
