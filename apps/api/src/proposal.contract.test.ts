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

it('FR-11 publishes the validated decision route and final response', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    const spec = app.swagger() as {
      paths: Record<
        string,
        {
          post?: { requestBody?: unknown; responses?: Record<string, unknown> };
        }
      >;
    };
    const route =
      spec.paths['/api/policies/{policyId}/proposals/{proposalId}/decision']
        ?.post;
    expect(route?.requestBody).toBeDefined();
    expect(route?.responses?.['200']).toBeDefined();
    expect(route?.responses?.['409']).toBeDefined();
  } finally {
    await app.close();
  }
});
