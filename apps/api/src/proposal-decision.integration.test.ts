import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { database } from './db.js';

const url = process.env.TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;

integration('FR-11 PostgreSQL decision transaction', () => {
  const db = database(url ?? 'postgresql://localhost/unused');
  const policyId = 'POL-NARIN-001';
  const customerId = 'CUS-001';
  const requestIds: string[] = [];
  const proposalIds: string[] = [];
  beforeAll(async () => {
    await db.migrate();
    await db.seed();
  });
  afterAll(async () => {
    await db.pool.query(
      "DELETE FROM audit_events WHERE action='proposal-decision' AND metadata->>'proposalId'=ANY($1::text[])",
      [proposalIds],
    );
    await db.pool.query(
      'DELETE FROM endorsement_proposals WHERE id=ANY($1::text[])',
      [proposalIds],
    );
    await db.pool.query(
      'DELETE FROM endorsement_requests WHERE id=ANY($1::uuid[])',
      [requestIds],
    );
    await db.close();
  });

  async function proposal() {
    const requestId = randomUUID();
    const proposalId = randomUUID();
    const payload = {
      id: proposalId,
      requestId,
      requesterId: customerId,
      policyId,
      status: 'PENDING_APPROVAL',
      binding: false,
      createdAt: new Date().toISOString(),
    };
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
    requestIds.push(requestId);
    await db.pool.query(
      'INSERT INTO endorsement_proposals(id,request_id,requester_id,policy_id,status,payload,created_at) VALUES ($1,$2,$3,$4,$5,$6,now())',
      [
        proposalId,
        requestId,
        customerId,
        policyId,
        'PENDING_APPROVAL',
        JSON.stringify(payload),
      ],
    );
    proposalIds.push(proposalId);
    return { requestId, proposalId };
  }

  it('keeps one final decision and audit under concurrent attempts without changing policy', async () => {
    const { proposalId } = await proposal();
    const before = await db.policy(customerId, policyId);
    const results = await Promise.all([
      db.decideProposal(customerId, policyId, proposalId, 'APPROVED', 1000),
      db.decideProposal(customerId, policyId, proposalId, 'REJECTED', 2000),
    ]);
    expect(results.map((item) => item.kind).sort()).toEqual([
      'conflict',
      'decided',
    ]);
    const stored = (await db.proposalFor(customerId, policyId, proposalId)) as {
      status: string;
      decidedAt: string;
    };
    expect(['APPROVED', 'REJECTED']).toContain(stored.status);
    const same = await db.decideProposal(
      customerId,
      policyId,
      proposalId,
      stored.status as 'APPROVED' | 'REJECTED',
      3000,
    );
    expect(same).toMatchObject({
      kind: 'decided',
      proposal: { decidedAt: stored.decidedAt },
    });
    const audit = await db.pool.query(
      "SELECT metadata FROM audit_events WHERE action='proposal-decision' AND metadata->>'proposalId'=$1",
      [proposalId],
    );
    expect(audit.rowCount).toBe(1);
    expect(audit.rows[0].metadata).toMatchObject({
      policyId,
      proposalId,
      decision: stored.status,
    });
    expect(await db.policy(customerId, policyId)).toEqual(before);
  });

  it('rolls back status when audit storage fails', async () => {
    const { proposalId } = await proposal();
    await db.pool.query(
      "CREATE OR REPLACE FUNCTION fr11_fail_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='proposal-decision' THEN RAISE EXCEPTION 'synthetic audit failure'; END IF; RETURN NEW; END $$",
    );
    await db.pool.query(
      'CREATE TRIGGER fr11_fail_audit BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION fr11_fail_audit()',
    );
    try {
      await expect(
        db.decideProposal(customerId, policyId, proposalId, 'APPROVED', 1000),
      ).rejects.toThrow('synthetic audit failure');
      expect(
        (
          (await db.proposalFor(customerId, policyId, proposalId)) as {
            status: string;
          }
        ).status,
      ).toBe('PENDING_APPROVAL');
    } finally {
      await db.pool.query('DROP TRIGGER fr11_fail_audit ON audit_events');
      await db.pool.query('DROP FUNCTION fr11_fail_audit()');
    }
    expect(
      (
        await db.decideProposal(
          customerId,
          policyId,
          proposalId,
          'APPROVED',
          2000,
        )
      ).kind,
    ).toBe('decided');
  });
});
