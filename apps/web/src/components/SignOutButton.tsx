'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignOut } from '@/hooks/useSignOut';
import {
  ROUTES,
  SESSION_REASONS,
  signInRoute,
  type NavigationTarget,
} from '@/lib/routes';

type SignOutButtonProps = {
  navigate?: (destination: NavigationTarget) => void;
};

export function SignOutButton({ navigate }: SignOutButtonProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState(false);
  const signOut = useSignOut();

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setError(false);
    try {
      const response = await signOut.mutateAsync();
      if (!response.ok && response.status !== 401)
        throw new Error('Sign-out failed');
      (navigate ?? router.push)(
        signInRoute(ROUTES.signIn, SESSION_REASONS.signedOut),
      );
    } catch {
      setError(true);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div>
      <button
        className="sign-out-button"
        disabled={isSigningOut}
        onClick={handleSignOut}
        type="button"
      >
        Sign out
      </button>
      {error ? (
        <p className="sign-out-error" role="alert">
          Sign-out is unavailable. Try again.
        </p>
      ) : null}
    </div>
  );
}
