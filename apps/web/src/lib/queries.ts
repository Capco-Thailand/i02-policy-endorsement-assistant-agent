import { useMutation, useQuery } from '@tanstack/react-query';
import type { RequestBody } from './api';
import {
  uploadDocument,
  createRequest,
  getPolicies,
  getPolicy,
  getEvidence,
  getRules,
  getSession,
  signIn,
  signOut,
} from './api';

export const queryKeys = {
  session: ['session'],
  policies: ['policies'],
  policy: (policyId: string) => ['policies', policyId],
  evidence: (policyId: string, query: string) => [
    'policies',
    policyId,
    'evidence',
    query,
  ],
  rules: (
    policyId: string,
    changeType: RequestBody['changeType'],
    requestedEffectiveDate: string,
  ) => ['policies', policyId, 'rules', changeType, requestedEffectiveDate],
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
export const useEvidence = (policyId: string, query: string) =>
  useQuery({
    queryKey: queryKeys.evidence(policyId, query),
    queryFn: () => getEvidence(policyId, query),
    retry: false,
  });
export const useRules = (
  policyId: string,
  changeType: RequestBody['changeType'],
  requestedEffectiveDate: string,
) =>
  useQuery({
    queryKey: queryKeys.rules(policyId, changeType, requestedEffectiveDate),
    queryFn: () => getRules(policyId, changeType, requestedEffectiveDate),
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

export const useDocumentUpload = (policyId: string) =>
  useMutation({
    mutationFn: ({ requestId, file }: { requestId: string; file: File }) =>
      uploadDocument(policyId, requestId, file),
  });
