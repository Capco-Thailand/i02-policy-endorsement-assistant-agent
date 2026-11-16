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
export type RequestBody =
  paths['/api/policies/{policyId}/requests']['post']['requestBody']['content']['application/json'];
export type RequestResult =
  paths['/api/policies/{policyId}/requests']['post']['responses'][200]['content']['application/json'];
type PolicyResult =
  paths['/api/policies/{policyId}']['get']['responses'][200]['content']['application/json'];
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
    if (response.status === 409) throw new Error('POLICY_EXPIRED');
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
export const getPolicy = (policyId: string) =>
  request<PolicyResult>(`/api/policies/${encodeURIComponent(policyId)}`);

export const createRequest = (policyId: string, body: RequestBody) =>
  request<RequestResult>(
    `/api/policies/${encodeURIComponent(policyId)}/requests`,
    { method: 'POST', body: JSON.stringify(body) },
  );
