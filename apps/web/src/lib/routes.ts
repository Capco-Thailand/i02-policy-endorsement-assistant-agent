export const routes = {
  signIn: '/',
  policies: '/policies',
  policy: (policyId: string) => `/policies/${encodeURIComponent(policyId)}`,
  request: (policyId: string) =>
    `/policies/${encodeURIComponent(policyId)}/request`,
} as const;
