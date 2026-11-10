import type { PolicyDto, PoliciesDto, StaffDto } from '@pea/api/contracts';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`API request failed: ${status}`);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    signal: AbortSignal.timeout(10_000),
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init?.headers }
  });
  if (!response.ok) throw new ApiError(response.status);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function currentActor(): Promise<{ actor: StaffDto }> {
  return request('/auth/me');
}

export function signIn(accountId: string, password: string): Promise<{ actor: StaffDto; expiresInSeconds: number }> {
  return request('/auth/sign-in', { method: 'POST', body: JSON.stringify({ accountId, password }) });
}

export function signOut(): Promise<void> {
  return request('/auth/sign-out', { method: 'POST' });
}

export function getPolicies(): Promise<PoliciesDto> {
  return request('/policies');
}

export function getPolicy(id: string): Promise<PolicyDto> {
  return request(`/policies/${encodeURIComponent(id)}`);
}
