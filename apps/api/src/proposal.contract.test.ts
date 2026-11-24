import { expect, it } from 'vitest';
import { buildApp } from './app.js';

it('FR-10 publishes prepare and read proposal routes', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    const spec = app.swagger() as { paths: Record<string, unknown> };
    expect(
      spec.paths['/api/policies/{policyId}/requests/{requestId}/proposal'],
    ).toBeDefined();
    expect(
      spec.paths['/api/policies/{policyId}/proposals/{proposalId}'],
    ).toBeDefined();
  } finally {
    await app.close();
  }
});
