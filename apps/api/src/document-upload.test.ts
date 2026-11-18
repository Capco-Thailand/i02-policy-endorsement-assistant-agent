import { afterEach, expect, it, vi } from 'vitest';
import { buildApp } from './app.js';
import { database } from './db.js';

vi.mock('./db.js', () => {
  const actor = { id: 'CUS-001', accountId: 'narin', name: 'Narin' };
  const db = {
    close: vi.fn(),
    session: vi.fn(async (token: string) =>
      token === 'test' ? { actor, expiresAt: Date.now() + 1000 } : undefined,
    ),
    policy: vi.fn(async (_actorId: string, id: string) =>
      id === 'POL-001'
        ? { id, customerId: actor.id, status: 'ACTIVE' }
        : undefined,
    ),
    ownsRequest: vi.fn(
      async (_actorId: string, _policyId: string, id: string) =>
        id === '123e4567-e89b-12d3-a456-426614174000',
    ),
    audit: vi.fn(),
  };
  return { database: () => db };
});

const requestId = '123e4567-e89b-12d3-a456-426614174000';
const boundary = 'mock-upload-test';
const payload = (bytes: Buffer, id = requestId) =>
  Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="requestId"\r\n\r\n${id}\r\n--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="anything.pdf"\r\nContent-Type: application/pdf\r\n\r\n`,
    ),
    bytes,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
const headers = (cookie = 'pea_session=test') => ({
  cookie,
  'content-type': `multipart/form-data; boundary=${boundary}`,
});
afterEach(() => vi.mocked(database().audit).mockReset());

it('FR-07: accepts any synthetic PDF content, records only metadata, and removes the old mock routes', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/policies/POL-001/document-upload',
      headers: headers(),
      payload: payload(Buffer.from('%PDF-arbitrary-content')),
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'RECEIVED_MOCK' });
    expect(response.json().explanation).toMatch(/not verified/);
    const openapi = (
      await app.inject({ method: 'GET', url: '/openapi.json' })
    ).json();
    expect(
      openapi.paths['/api/policies/{policyId}/document-upload'].post.requestBody
        .content['multipart/form-data'].schema.required,
    ).toEqual(['requestId', 'document']);
    expect(vi.mocked(database().audit)).toHaveBeenCalledWith(
      'CUS-001',
      'document-upload',
      expect.any(Number),
      {
        policyId: 'POL-001',
        requestId,
        status: 'RECEIVED_MOCK',
        mediaType: 'application/pdf',
        byteSize: String(Buffer.byteLength('%PDF-arbitrary-content')),
      },
    );
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/policies/POL-001/mock-identity',
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/policies/POL-001/document-bypass',
        })
      ).statusCode,
    ).toBe(404);
  } finally {
    await app.close();
  }
});

it.each([
  ['PNG', Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1]), 'image/png'],
  ['JPEG', Buffer.from([255, 216, 255, 1, 2, 3]), 'image/jpeg'],
])(
  'FR-07: accepts synthetic %s bytes without checking document meaning',
  async (_label, bytes, mediaType) => {
    const app = await buildApp({ schemaOnly: true });
    try {
      const response = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-001/document-upload',
        headers: headers(),
        payload: payload(bytes),
      });
      expect(response.statusCode).toBe(200);
      expect(vi.mocked(database().audit).mock.calls.at(-1)?.[3]).toMatchObject({
        mediaType,
        status: 'RECEIVED_MOCK',
      });
    } finally {
      await app.close();
    }
  },
);

it('FR-07: rejects unauthorized, unowned, and unsupported uploads without receipt', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    const url = '/api/policies/POL-001/document-upload';
    const bytes = payload(Buffer.from('%PDF-synthetic'));
    expect(
      (
        await app.inject({
          method: 'POST',
          url,
          headers: headers(''),
          payload: bytes,
        })
      ).statusCode,
    ).toBe(401);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/policies/OTHER/document-upload',
          headers: headers(),
          payload: bytes,
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          method: 'POST',
          url,
          headers: headers(),
          payload: payload(Buffer.from('not-a-document')),
        })
      ).statusCode,
    ).toBe(415);
    expect(
      (
        await app.inject({
          method: 'POST',
          url,
          headers: headers(),
          payload: payload(
            Buffer.from('%PDF-fixture'),
            '123e4567-e89b-12d3-a456-426614174001',
          ),
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          method: 'POST',
          url,
          headers: headers(),
          payload: payload(Buffer.alloc(0)),
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await app.inject({
          method: 'POST',
          url,
          headers: headers(),
          payload: payload(
            Buffer.concat([
              Buffer.from('%PDF-'),
              Buffer.alloc(10 * 1024 * 1024),
            ]),
          ),
        })
      ).statusCode,
    ).toBe(413);
    expect(vi.mocked(database().audit)).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});

it('FR-07: fails the upload when the audit write fails', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    vi.mocked(database().audit).mockRejectedValueOnce(
      new Error('audit unavailable'),
    );
    const response = await app.inject({
      method: 'POST',
      url: '/api/policies/POL-001/document-upload',
      headers: headers(),
      payload: payload(Buffer.from('%PDF-fixture')),
    });
    expect(response.statusCode).toBe(500);
    expect(response.body).not.toContain('RECEIVED_MOCK');
  } finally {
    await app.close();
  }
});
