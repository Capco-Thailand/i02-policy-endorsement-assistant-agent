import {
  CustomerResponseSchema,
  PoliciesResponseSchema,
  PolicySchema,
  type CustomerDto,
  type PolicyDto,
} from '@pea/api/contracts';
import { Value } from '@sinclair/typebox/value';

export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
export const API_ROUTES = {
  signIn: '/auth/sign-in',
  signOut: '/auth/sign-out',
  currentCustomer: '/auth/me',
  policies: '/policies',
  policy: (id: string) => `/policies/${encodeURIComponent(id)}`,
} as const;
export const SESSION_COOKIE_NAME = 'pea_session';
export const API_REQUEST_OPTIONS = {
  credentials: 'include',
} as const;

const serverApiOrigin =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? API_ORIGIN;

export async function signIn(accountId: string, password: string) {
  return fetch(`${API_ORIGIN}${API_ROUTES.signIn}`, {
    ...API_REQUEST_OPTIONS,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId, password }),
  });
}

export async function signOut() {
  return fetch(`${API_ORIGIN}${API_ROUTES.signOut}`, {
    ...API_REQUEST_OPTIONS,
    method: 'POST',
  });
}

export type PolicyResult =
  | { kind: 'ok'; policy: PolicyDto }
  | { kind: 'unauthorized' }
  | { kind: 'unavailable' }
  | { kind: 'not-found' };

export type PoliciesResult =
  | { kind: 'ok'; policies: PolicyDto[] }
  | { kind: 'unauthorized' }
  | { kind: 'unavailable' };

export type CustomerResult =
  | { kind: 'ok'; customer: CustomerDto }
  | { kind: 'unauthorized' }
  | { kind: 'unavailable' };

export async function getCurrentCustomer(
  sessionCookie: string,
): Promise<CustomerResult> {
  try {
    const response = await fetch(
      `${serverApiOrigin}${API_ROUTES.currentCustomer}`,
      {
        headers: { cookie: sessionCookie },
        cache: 'no-store',
      },
    );
    if (response.status === 401) return { kind: 'unauthorized' };
    if (!response.ok) return { kind: 'unavailable' };
    const result: unknown = await response.json();
    if (!Value.Check(CustomerResponseSchema, result))
      return { kind: 'unavailable' };
    return { kind: 'ok', customer: result.customer };
  } catch {
    return { kind: 'unavailable' };
  }
}

export async function getPolicies(
  sessionCookie: string,
): Promise<PoliciesResult> {
  try {
    const response = await fetch(`${serverApiOrigin}${API_ROUTES.policies}`, {
      headers: { cookie: sessionCookie },
      cache: 'no-store',
    });
    if (response.status === 401) return { kind: 'unauthorized' };
    if (!response.ok) return { kind: 'unavailable' };
    const result: unknown = await response.json();
    if (!Value.Check(PoliciesResponseSchema, result))
      return { kind: 'unavailable' };
    return { kind: 'ok', policies: result.policies };
  } catch {
    return { kind: 'unavailable' };
  }
}

export async function getPolicy(
  sessionCookie: string,
  id: string,
): Promise<PolicyResult> {
  try {
    const response = await fetch(`${serverApiOrigin}${API_ROUTES.policy(id)}`, {
      headers: { cookie: sessionCookie },
      cache: 'no-store',
    });
    if (response.status === 401) return { kind: 'unauthorized' };
    if (response.status === 404) return { kind: 'not-found' };
    if (!response.ok) return { kind: 'unavailable' };
    const policy: unknown = await response.json();
    if (!Value.Check(PolicySchema, policy)) return { kind: 'unavailable' };
    return { kind: 'ok', policy };
  } catch {
    return { kind: 'unavailable' };
  }
}
