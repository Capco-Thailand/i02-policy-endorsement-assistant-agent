'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession } from '../lib/queries';
import { routes } from '../lib/routes';

export function SessionGate({ children }: { children: ReactNode }) {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [timerExpired, setTimerExpired] = useState(false);
  const expired =
    timerExpired ||
    Boolean(session.data && session.data.expiresAt <= Date.now());
  useEffect(() => {
    if (!session.data) return;
    const delay = Math.max(0, session.data.expiresAt - Date.now());
    const timer = window.setTimeout(() => setTimerExpired(true), delay);
    return () => window.clearTimeout(timer);
  }, [session.data]);
  useEffect(() => {
    if (session.isError || expired) {
      queryClient.clear();
      router.replace(`${routes.signIn}?ended=1`);
    }
  }, [session.isError, expired, queryClient, router]);
  if (session.isPending || session.isError || expired)
    return <p role="status">Checking your session…</p>;
  return <>{children}</>;
}
