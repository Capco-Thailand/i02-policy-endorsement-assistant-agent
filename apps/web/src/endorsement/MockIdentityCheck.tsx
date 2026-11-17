'use client';

import { useState } from 'react';
import { useMockIdentity } from '../lib/queries';

const reasons: Record<string, string> = {
  MOCK_CHECKS_PASSED: 'Synthetic identity checks passed.',
  IDENTITY_MISMATCH: 'Synthetic identity details did not match.',
  ID_EXPIRED: 'Synthetic ID is expired.',
  LIVENESS_FAILED: 'Simulated liveness check failed.',
  LIVENESS_INCONCLUSIVE: 'Simulated liveness check needs review.',
};

export function MockIdentityCheck({ policyId }: { policyId: string }) {
  const [scenario, setScenario] = useState('all-pass');
  const check = useMockIdentity(policyId);
  return (
    <section className="request-panel" aria-labelledby="mock-identity-heading">
      <h2 id="mock-identity-heading">Simulated identity check</h2>
      <p>This demonstration does not verify a real identity.</p>
      <label htmlFor="mock-identity-scenario">Synthetic scenario</label>
      <select
        id="mock-identity-scenario"
        value={scenario}
        onChange={(event) => setScenario(event.target.value)}
      >
        <option value="all-pass">All checks pass</option>
        <option value="identity-mismatch">Identity mismatch</option>
        <option value="id-expired">Expired ID</option>
        <option value="liveness-failed">Liveness failed</option>
        <option value="liveness-inconclusive">Liveness inconclusive</option>
      </select>
      <button
        type="button"
        disabled={check.isPending}
        onClick={() => check.mutate(scenario)}
      >
        {check.isPending ? 'Running mock check…' : 'Run mock check'}
      </button>
      <div aria-live="polite">
        {check.data && (
          <p>
            <strong>{check.data.status}</strong> —{' '}
            {reasons[check.data.reason] ?? check.data.reason}{' '}
            {check.data.disclosure}
          </p>
        )}
        {check.isError && (
          <p role="alert">Could not complete the mock check. Try again.</p>
        )}
      </div>
    </section>
  );
}
