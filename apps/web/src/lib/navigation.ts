import { ROUTES, type AppRoute } from './routes';

const INTERNAL_ORIGIN = 'http://pea.local';

export function safeDestination(destination: string | undefined): AppRoute {
  if (
    !destination ||
    !destination.startsWith('/') ||
    destination.startsWith('//') ||
    destination.includes('\\')
  ) {
    return ROUTES.policies;
  }
  try {
    const target = new URL(destination, INTERNAL_ORIGIN);
    if (target.origin !== INTERNAL_ORIGIN) return ROUTES.policies;
    if (
      target.pathname !== ROUTES.policies &&
      !target.pathname.startsWith(`${ROUTES.policies}/`)
    ) {
      return ROUTES.policies;
    }
    if (target.pathname === ROUTES.policies) return ROUTES.policies;
    const policyId = decodeURIComponent(
      target.pathname.slice(`${ROUTES.policies}/`.length),
    );
    return `${ROUTES.policyDetail(policyId)}${target.search}${target.hash}`;
  } catch {
    return ROUTES.policies;
  }
}
