export const routes = {
  signIn: '/',
  policies: '/policies',
  policy: (policyId: string) => `/policies/${encodeURIComponent(policyId)}`,
  request: (policyId: string) =>
    `/policies/${encodeURIComponent(policyId)}/request`,
  proposal: (policyId: string, proposalId: string) =>
    `/policies/${encodeURIComponent(policyId)}/proposals/${encodeURIComponent(proposalId)}`,
} as const;
