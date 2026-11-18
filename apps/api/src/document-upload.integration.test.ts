import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { buildApp } from './app.js';
import { database } from './db.js';

const url = process.env.TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;
const boundary = 'pea-fixture-boundary';
const upload = (requestId: string, file: Buffer) =>
  Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="requestId"\r\n\r\n${requestId}\r\n--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="synthetic.pdf"\r\nContent-Type: application/pdf\r\n\r\n`,
    ),
    file,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
const headers = (cookie?: string) => ({
  ...(cookie ? { cookie } : {}),
  'content-type': `multipart/form-data; boundary=${boundary}`,
});

integration('FR-07 mock document upload', () => {
  const db = database(url ?? 'postgresql://localhost/unused');
  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    await db.migrate();
    await db.seed();
  });
  afterAll(async () => db.close());

  it('accepts arbitrary synthetic PDF content for the owning request and audits metadata only', async () => {
    const app = await buildApp();
    try {
      const signIn = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: { accountId: 'narin', password: 'NarinDemo123!' },
      });
      const setCookie = signIn.headers['set-cookie'];
      const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
      const created = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-NARIN-001/requests',
        headers: { cookie },
        payload: {
          changeType: 'ADDRESS',
          requestedEffectiveDate: '2027-01-01',
          correspondenceAddress: '100 Demo Road',
        },
      });
      expect(created.statusCode).toBe(200);
      const requestId = created.json().request.id;
      const route = '/api/policies/POL-NARIN-001/document-upload';
      const payload = upload(
        requestId,
        Buffer.from('%PDF-arbitrary-fixture-not-a-real-document'),
      );
      expect(
        (
          await app.inject({
            method: 'POST',
            url: route,
            headers: headers(),
            payload,
          })
        ).statusCode,
      ).toBe(401);
      const ok = await app.inject({
        method: 'POST',
        url: route,
        headers: headers(cookie),
        payload,
      });
      expect(ok.statusCode).toBe(200);
      expect(ok.json()).toMatchObject({ status: 'RECEIVED_MOCK' });
      expect(ok.json().explanation).toMatch(/not verified/i);
      const audit = await db.pool.query(
        "SELECT metadata FROM audit_events WHERE action='document-upload' ORDER BY id DESC LIMIT 1",
      );
      expect(audit.rows[0].metadata).toEqual({
        policyId: 'POL-NARIN-001',
        requestId,
        status: 'RECEIVED_MOCK',
        mediaType: 'application/pdf',
        byteSize: String(
          Buffer.byteLength('%PDF-arbitrary-fixture-not-a-real-document'),
        ),
      });
      expect(JSON.stringify(audit.rows[0].metadata)).not.toContain(
        'arbitrary-fixture',
      );
      const unknown = await app.inject({
        method: 'POST',
        url: route,
        headers: headers(cookie),
        payload: upload(randomUUID(), Buffer.from('%PDF-fixture')),
      });
      expect(unknown.statusCode).toBe(404);
      const foreign = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-MALI-001/document-upload',
        headers: headers(cookie),
        payload,
      });
      expect(foreign.statusCode).toBe(404);
      expect(foreign.body).toBe(unknown.body);
      const expired = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-NARIN-002/document-upload',
        headers: headers(cookie),
        payload,
      });
      expect(expired.statusCode).toBe(409);
      const unsupported = await app.inject({
        method: 'POST',
        url: route,
        headers: headers(cookie),
        payload: upload(requestId, Buffer.from('not-a-pdf')),
      });
      expect(unsupported.statusCode).toBe(415);
      const tooLarge = await app.inject({
        method: 'POST',
        url: route,
        headers: headers(cookie),
        payload: upload(
          requestId,
          Buffer.concat([Buffer.from('%PDF-'), Buffer.alloc(10 * 1024 * 1024)]),
        ),
      });
      expect(tooLarge.statusCode).toBe(413);
      const gone = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-NARIN-001/mock-identity',
        headers: { cookie },
        payload: { scenario: 'all-pass' },
      });
      expect(gone.statusCode).toBe(404);
    } finally {
      await app.close();
    }
  });
});
