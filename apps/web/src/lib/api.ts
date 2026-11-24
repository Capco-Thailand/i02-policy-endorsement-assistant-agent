import type { paths } from './api-types';

export type Actor =
  paths['/api/auth/session']['get']['responses'][200]['content']['application/json']['actor'];
export type Policy =
  paths['/api/policies']['get']['responses'][200]['content']['application/json']['policies'][number];
export type PolicyDetail =
  paths['/api/policies/{policyId}']['get']['responses'][200]['content']['application/json']['policy'];
type SignInBody =
  paths['/api/auth/sign-in']['post']['requestBody']['content']['application/json'];
type SignInResult =
  paths['/api/auth/sign-in']['post']['responses'][200]['content']['application/json'];
type SessionResult =
  paths['/api/auth/session']['get']['responses'][200]['content']['application/json'];
type PoliciesResult =
  paths['/api/policies']['get']['responses'][200]['content']['application/json'];
export type HistoryResult =
  paths['/api/history']['get']['responses'][200]['content']['application/json'];
export type RequestBody =
  paths['/api/policies/{policyId}/requests']['post']['requestBody']['content']['application/json'];
export type RequestResult =
  paths['/api/policies/{policyId}/requests']['post']['responses'][200]['content']['application/json'];
type PolicyResult =
  paths['/api/policies/{policyId}']['get']['responses'][200]['content']['application/json'];
export type EvidenceResult =
  paths['/api/policies/{policyId}/evidence']['get']['responses'][200]['content']['application/json'];
type RulesQuery =
  paths['/api/policies/{policyId}/rules']['get']['parameters']['query'];
export type RulesResult =
  paths['/api/policies/{policyId}/rules']['get']['responses'][200]['content']['application/json'];
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers:
      init?.body == null
        ? init?.headers
        : { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) {
    if (response.status === 401)
      throw new Error(
        path === '/api/auth/sign-in' ? 'INVALID_CREDENTIALS' : 'UNAUTHORIZED',
      );
    if (response.status === 404) throw new Error('NOT_FOUND');
    if (response.status === 400) {
      const body = (await response.json()) as { error?: string };
      throw new Error(body.error ?? 'INVALID_REQUEST');
    }
    if (response.status === 409) {
      const body = (await response.json()) as { error?: string };
      throw new Error(body.error ?? 'POLICY_EXPIRED');
    }
    throw new Error('API_UNAVAILABLE');
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const signIn = (accountId: string, password: string) =>
  request<SignInResult>('/api/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify({ accountId, password } satisfies SignInBody),
  });
export const getSession = () => request<SessionResult>('/api/auth/session');
export const signOut = () =>
  request<void>('/api/auth/sign-out', { method: 'POST' });
export const getPolicies = () => request<PoliciesResult>('/api/policies');
export const getHistory = () => request<HistoryResult>('/api/history');
export const getPolicy = (policyId: string) =>
  request<PolicyResult>(`/api/policies/${encodeURIComponent(policyId)}`);
export const getEvidence = (policyId: string, query: string) =>
  request<EvidenceResult>(
    `/api/policies/${encodeURIComponent(policyId)}/evidence?query=${encodeURIComponent(query)}`,
  );
export const getRules = (
  policyId: string,
  changeType: RulesQuery['changeType'],
  requestedEffectiveDate: RulesQuery['requestedEffectiveDate'],
) =>
  request<RulesResult>(
    `/api/policies/${encodeURIComponent(policyId)}/rules?changeType=${encodeURIComponent(changeType)}&requestedEffectiveDate=${encodeURIComponent(requestedEffectiveDate)}`,
  );

export const createRequest = (policyId: string, body: RequestBody) =>
  request<RequestResult>(
    `/api/policies/${encodeURIComponent(policyId)}/requests`,
    { method: 'POST', body: JSON.stringify(body) },
  );

export type EligibilityResult =
  paths['/api/policies/{policyId}/requests/{requestId}/eligibility']['post']['responses'][200]['content']['application/json'];
export const checkEligibility = (policyId: string, requestId: string) =>
  request<EligibilityResult>(
    `/api/policies/${encodeURIComponent(policyId)}/requests/${encodeURIComponent(requestId)}/eligibility`,
    { method: 'POST' },
  );
export type Proposal =
  paths['/api/policies/{policyId}/proposals/{proposalId}']['get']['responses'][200]['content']['application/json'];
export const prepareProposal = (policyId: string, requestId: string) =>
  request<Proposal>(
    `/api/policies/${encodeURIComponent(policyId)}/requests/${encodeURIComponent(requestId)}/proposal`,
    { method: 'POST' },
  );
export const getProposal = (policyId: string, proposalId: string) =>
  request<Proposal>(
    `/api/policies/${encodeURIComponent(policyId)}/proposals/${encodeURIComponent(proposalId)}`,
  );
export type Decision =
  paths['/api/policies/{policyId}/proposals/{proposalId}/decision']['post']['requestBody']['content']['application/json']['decision'];
export const decideProposal = (
  policyId: string,
  proposalId: string,
  decision: Decision,
) =>
  request<Proposal>(
    `/api/policies/${encodeURIComponent(policyId)}/proposals/${encodeURIComponent(proposalId)}/decision`,
    {
      method: 'POST',
      body: JSON.stringify({ decision }),
    },
  );
