import { expect, it } from 'vitest';
import { buildApp } from './app.js';

it('FR-09 publishes the quote endpoint in OpenAPI', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    const spec = app.swagger() as { paths: Record<string, unknown> };
    expect(
      spec.paths['/api/policies/{policyId}/requests/{requestId}/quote'],
    ).toBeDefined();
  } finally {
    await app.close();
  }
});
