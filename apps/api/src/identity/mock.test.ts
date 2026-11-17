import { describe, expect, it } from 'vitest';
import { evaluateMockIdentity } from './mock.js';

describe('FR-06 synthetic identity scenarios', () => {
  it.each([
    ['all-pass', 'VERIFIED', 'MOCK_CHECKS_PASSED'],
    ['identity-mismatch', 'FAILED', 'IDENTITY_MISMATCH'],
    ['id-expired', 'FAILED', 'ID_EXPIRED'],
    ['liveness-failed', 'FAILED', 'LIVENESS_FAILED'],
    ['liveness-inconclusive', 'REVIEW_REQUIRED', 'LIVENESS_INCONCLUSIVE'],
  ] as const)('%s yields %s', (scenario, status, reason) => {
    expect(evaluateMockIdentity(scenario)).toEqual({ status, reason });
  });
  it('rejects unknown scenarios', () => {
    expect(evaluateMockIdentity('unknown')).toBeUndefined();
  });
});
