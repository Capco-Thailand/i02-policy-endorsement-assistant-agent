import { useMutation, useQuery } from '@tanstack/react-query';
import { getPolicies, getSession, signIn, signOut } from './api';

export const queryKeys = {
  session: ['session'],
  policies: ['policies'],
} as const;
export const useSession = () =>
  useQuery({ queryKey: queryKeys.session, queryFn: getSession, retry: false });
export const usePolicies = () =>
  useQuery({
    queryKey: queryKeys.policies,
    queryFn: getPolicies,
    retry: false,
  });
export const useSignIn = () =>
  useMutation({
    mutationFn: ({
      accountId,
      password,
    }: {
      accountId: string;
      password: string;
    }) => signIn(accountId, password),
  });
export const useSignOut = () => useMutation({ mutationFn: signOut });
