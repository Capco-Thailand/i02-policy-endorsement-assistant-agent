export const mockIdentityScenarios = [
  'all-pass',
  'identity-mismatch',
  'id-expired',
  'liveness-failed',
  'liveness-inconclusive',
] as const;

export type MockIdentityStatus = 'VERIFIED' | 'FAILED' | 'REVIEW_REQUIRED';

export function evaluateMockIdentity(
  scenario: string,
): { status: MockIdentityStatus; reason: string } | undefined {
  const results: Record<
    string,
    { status: MockIdentityStatus; reason: string }
  > = {
    'all-pass': { status: 'VERIFIED', reason: 'MOCK_CHECKS_PASSED' },
    'identity-mismatch': { status: 'FAILED', reason: 'IDENTITY_MISMATCH' },
    'id-expired': { status: 'FAILED', reason: 'ID_EXPIRED' },
    'liveness-failed': { status: 'FAILED', reason: 'LIVENESS_FAILED' },
    'liveness-inconclusive': {
      status: 'REVIEW_REQUIRED',
      reason: 'LIVENESS_INCONCLUSIVE',
    },
  };
  return results[scenario];
}
