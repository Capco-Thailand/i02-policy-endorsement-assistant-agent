import { useMutation, useQuery } from '@tanstack/react-query';
import type { RequestBody } from './api';
import {
  createRequest,
  getPolicies,
  getPolicy,
  getSession,
  signIn,
  signOut,
  runMockIdentity,
} from './api';

export const queryKeys = {
  session: ['session'],
  policies: ['policies'],
  policy: (policyId: string) => ['policies', policyId],
} as const;
export const useSession = () =>
  useQuery({ queryKey: queryKeys.session, queryFn: getSession, retry: false });
export const usePolicies = () =>
  useQuery({
    queryKey: queryKeys.policies,
    queryFn: getPolicies,
    retry: false,
  });
export const usePolicy = (policyId: string) =>
  useQuery({
    queryKey: queryKeys.policy(policyId),
    queryFn: () => getPolicy(policyId),
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

export const useCreateRequest = (policyId: string) =>
  useMutation({
    mutationFn: (body: RequestBody) => createRequest(policyId, body),
  });

export const useMockIdentity = (policyId: string) =>
  useMutation({
    mutationFn: (scenario: string) => runMockIdentity(policyId, scenario),
  });
