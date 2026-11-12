import type { CustomerDto, PolicyDto } from '@pea/api/contracts';

const serverApiOrigin =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000';

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
    const response = await fetch(`${serverApiOrigin}/auth/me`, {
      headers: { cookie: sessionCookie },
      cache: 'no-store',
    });
    if (response.status === 401) return { kind: 'unauthorized' };
    if (!response.ok) return { kind: 'unavailable' };
    const result = (await response.json()) as { customer: CustomerDto };
    return { kind: 'ok', customer: result.customer };
  } catch {
    return { kind: 'unavailable' };
  }
}

export async function getPolicies(
  sessionCookie: string,
): Promise<PoliciesResult> {
  try {
    const response = await fetch(`${serverApiOrigin}/policies`, {
      headers: { cookie: sessionCookie },
      cache: 'no-store',
    });
    if (response.status === 401) return { kind: 'unauthorized' };
    if (!response.ok) return { kind: 'unavailable' };
    const result = (await response.json()) as { policies: PolicyDto[] };
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
    const response = await fetch(
      `${serverApiOrigin}/policies/${encodeURIComponent(id)}`,
      {
        headers: { cookie: sessionCookie },
        cache: 'no-store',
      },
    );
    if (response.status === 401) return { kind: 'unauthorized' };
    if (response.status === 404) return { kind: 'not-found' };
    if (!response.ok) return { kind: 'unavailable' };
    const policy = (await response.json()) as PolicyDto;
    return { kind: 'ok', policy };
  } catch {
    return { kind: 'unavailable' };
  }
}
