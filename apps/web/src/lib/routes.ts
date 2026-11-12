export const ROUTES = {
  home: '/',
  signIn: '/sign-in',
  policies: '/policies',
  policyDetail: (id: string): `/policies/${string}` =>
    `/policies/${encodeURIComponent(id)}`,
} as const;

export type AppRoute =
  | typeof ROUTES.home
  | typeof ROUTES.signIn
  | typeof ROUTES.policies
  | `/policies/${string}`;

export const SESSION_REASONS = {
  expired: 'expired',
  signedOut: 'signed-out',
} as const;

export type SessionReason =
  (typeof SESSION_REASONS)[keyof typeof SESSION_REASONS];
export type NavigationTarget = AppRoute | `/sign-in?${string}`;

export function signInRoute(
  returnTo: AppRoute,
  reason?: SessionReason,
): NavigationTarget {
  const params = new URLSearchParams({ returnTo });
  if (reason) params.set('reason', reason);
  return `${ROUTES.signIn}?${params.toString()}`;
}
