import { expect, it, vi } from 'vitest';
import { buildApp } from './app.js';
import { database } from './db.js';

vi.mock('./db.js', () => {
  const db = { close: vi.fn(), audit: vi.fn() };
  return { database: () => db };
});

it('retired FR-07 endpoint is absent and writes no audit event', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/policies/POL/document-upload',
    });
    expect(response.statusCode).toBe(404);
    const openapi = (
      await app.inject({ method: 'GET', url: '/openapi.json' })
    ).json();
    expect(
      openapi.paths['/api/policies/{policyId}/document-upload'],
    ).toBeUndefined();
    expect(database().audit).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});
