'use client';

import React, { useState } from 'react';

const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type SignOutButtonProps = { navigate?: (destination: string) => void };

export function SignOutButton({
  navigate = (destination) => window.location.assign(destination),
}: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await fetch(`${apiOrigin}/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // The page transition still clears protected UI; the API remains authority.
    } finally {
      navigate('/sign-in?reason=signed-out');
    }
  }

  return (
    <button
      className="sign-out-button"
      disabled={isSigningOut}
      onClick={handleSignOut}
      type="button"
    >
      Sign out
    </button>
  );
}
