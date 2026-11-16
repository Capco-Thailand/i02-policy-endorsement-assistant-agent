export const routes = {
  signIn: '/',
  policies: '/policies',
  policy: (policyId: string) => `/policies/${encodeURIComponent(policyId)}`,
} as const;
