import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Pool } from 'pg';
import { database } from './db.js';
import { buildApp } from './app.js';

const url = process.env.TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;

it('publishes the session-scoped history route with success and failure contracts', async () => {
  const app = await buildApp({ schemaOnly: true });
  try {
    const spec = app.swagger() as {
      paths: Record<string, { get?: { responses?: Record<string, unknown> } }>;
    };
    expect(spec.paths['/api/history']?.get?.responses).toMatchObject({
      '200': expect.anything(),
      '401': expect.anything(),
      '503': expect.anything(),
    });
  } finally {
    await app.close();
  }
});

integration('FR-12 approved history', () => {
  const db = database(url ?? 'postgresql://localhost/unused');
  beforeAll(async () => {
    await db.migrate();
    await db.seed();
  });
  afterAll(() => db.close());

  it('rejects a missing session before reading history', async () => {
    const app = await buildApp();
    try {
      const response = await app.inject({ method: 'GET', url: '/api/history' });
      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: 'UNAUTHORIZED' });
    } finally {
      await app.close();
    }
  });

  it('returns 503 when session storage fails', async () => {
    const app = await buildApp();
    const query = vi
      .spyOn(Pool.prototype, 'query')
      .mockRejectedValueOnce(new Error('synthetic session outage'));
    try {
      const response = await app.inject({
        method: 'GET',
        url: '/api/history',
        headers: { cookie: 'pea_session=synthetic' },
      });
      expect(response.statusCode).toBe(503);
      expect(response.json()).toEqual({ error: 'HISTORY_UNAVAILABLE' });
    } finally {
      query.mockRestore();
      await app.close();
    }
  });

  it('returns only owner approvals in stable decision order and leaves policy unchanged', async () => {
    const customerId = `CUS-HISTORY-${randomUUID()}`;
    const policyId = `POL-HISTORY-${randomUUID()}`;
    await db.pool.query(
      "INSERT INTO customers(id,account_id,name,password_hash,salt) SELECT $1,$1,name,password_hash,salt FROM customers WHERE id='CUS-001'",
      [customerId],
    );
    await db.pool.query(
      "INSERT INTO policies(id,customer_id,label,status,effective_date,expiry_date,payment_frequency,product_terms,coverage_terms,exclusion_terms) SELECT $1,$2,label,status,effective_date,expiry_date,payment_frequency,product_terms,coverage_terms,exclusion_terms FROM policies WHERE id='POL-NARIN-001'",
      [policyId, customerId],
    );
    const before = await db.policy(customerId, policyId);
    const ids = [randomUUID(), randomUUID(), randomUUID()];
    const requestIds: string[] = [];
    try {
      for (const [index, status] of [
        'APPROVED',
        'APPROVED',
        'REJECTED',
      ].entries()) {
        const requestId = randomUUID();
        requestIds.push(requestId);
        await db.pool.query(
          'INSERT INTO endorsement_requests(id,requester_id,policy_id,created_at,change_type,payload) VALUES ($1,$2,$3,now(),$4,$5)',
          [
            requestId,
            customerId,
            policyId,
            'ADDRESS',
            JSON.stringify({ id: requestId }),
          ],
        );
        await db.pool.query(
          'INSERT INTO endorsement_proposals(id,request_id,requester_id,policy_id,status,payload,created_at,decided_at) VALUES ($1,$2,$3,$4,$5,$6,now(),$7)',
          [
            ids[index],
            requestId,
            customerId,
            policyId,
            status,
            JSON.stringify({
              id: ids[index],
              policyId,
              status,
              decidedAt: '2026-11-24T00:00:00.000Z',
              requestedChange: {
                id: requestId,
                requesterId: customerId,
                policyId,
                createdAt: '2026-11-24T00:00:00.000Z',
                changeType: 'ADDRESS',
                requestedEffectiveDate: '2026-12-01',
                correspondenceAddress: 'Synthetic address',
              },
              current: { label: 'Family Protection Plan' },
            }),
            '2026-11-24T00:00:00.000Z',
          ],
        );
      }
      const app = await buildApp();
      try {
        const ownerSignIn = await app.inject({
          method: 'POST',
          url: '/api/auth/sign-in',
          payload: { accountId: customerId, password: 'NarinDemo123!' },
        });
        expect(ownerSignIn.statusCode).toBe(200);
        const owner = await app.inject({
          method: 'GET',
          url: '/api/history',
          headers: { cookie: ownerSignIn.headers['set-cookie'] },
        });
        expect(owner.statusCode).toBe(200);
        expect(
          owner
            .json()
            .history.map((item: { proposalId: string }) => item.proposalId),
        ).toEqual(ids.slice(0, 2).sort().reverse());
        const reopened = await buildApp();
        try {
          const persisted = await reopened.inject({
            method: 'GET',
            url: '/api/history',
            headers: { cookie: ownerSignIn.headers['set-cookie'] },
          });
          expect(persisted.statusCode).toBe(200);
          expect(
            persisted
              .json()
              .history.map((item: { proposalId: string }) => item.proposalId),
          ).toEqual(ids.slice(0, 2).sort().reverse());
        } finally {
          await reopened.close();
        }
        const foreignSignIn = await app.inject({
          method: 'POST',
          url: '/api/auth/sign-in',
          payload: { accountId: 'mali', password: 'MaliDemo123!' },
        });
        const foreignCookie = foreignSignIn.headers['set-cookie'];
        const foreign = await app.inject({
          method: 'GET',
          url: '/api/history',
          headers: { cookie: foreignCookie },
        });
        expect(foreign.statusCode).toBe(200);
        expect(foreign.json().history).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ proposalId: ids[0] }),
          ]),
        );
        const detail = await app.inject({
          method: 'GET',
          url: `/api/policies/${policyId}/proposals/${ids[0]}`,
          headers: { cookie: foreignCookie },
        });
        expect(detail.statusCode).toBe(404);
      } finally {
        await app.close();
      }
      expect(await db.policy(customerId, policyId)).toEqual(before);
    } finally {
      await db.pool.query(
        'DELETE FROM endorsement_proposals WHERE id = ANY($1::text[])',
        [ids],
      );
      await db.pool.query(
        'DELETE FROM endorsement_requests WHERE id = ANY($1::uuid[])',
        [requestIds],
      );
      await db.pool.query('DELETE FROM sessions WHERE customer_id=$1', [
        customerId,
      ]);
      await db.pool.query('DELETE FROM audit_events WHERE actor_id=$1', [
        customerId,
      ]);
      await db.pool.query('DELETE FROM policies WHERE id=$1', [policyId]);
      await db.pool.query('DELETE FROM customers WHERE id=$1', [customerId]);
    }
  });
  it('records request identifiers without personal details in audit metadata', async () => {
    const id = randomUUID();
    await db.saveRequest(
      {
        id,
        requesterId: 'CUS-001',
        policyId: 'POL-NARIN-001',
        changeType: 'ADDRESS',
        requestedEffectiveDate: '2026-12-01',
        correspondenceAddress: 'Synthetic address',
        createdAt: new Date().toISOString(),
      },
      Date.now(),
    );
    const result = await db.pool.query(
      "SELECT actor_id, metadata FROM audit_events WHERE action='request-create' AND metadata->>'requestId'=$1",
      [id],
    );
    expect(result.rows[0]).toMatchObject({
      actor_id: 'CUS-001',
      metadata: {
        requestId: id,
        policyId: 'POL-NARIN-001',
        changeType: 'ADDRESS',
      },
    });
    expect(JSON.stringify(result.rows[0])).not.toContain('Synthetic address');
  });
});
