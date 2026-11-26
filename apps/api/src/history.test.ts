import { afterEach, expect, it, vi } from 'vitest';
import { Pool } from 'pg';
import { database } from './db.js';

afterEach(() => vi.restoreAllMocks());

it('returns approved history when an older proposal has no current policy label', async () => {
  const query = vi.spyOn(Pool.prototype, 'query').mockResolvedValueOnce({
    rows: [
      {
        proposal_id: 'PRP-LEGACY-1',
        request_id: 'REQ-LEGACY-1',
        policy_id: 'POL-NARIN-001',
        decided_at: new Date('2026-11-24T00:00:00Z'),
        payload: { requestedChange: { id: 'REQ-LEGACY-1' } },
        request_payload: {
          id: 'REQ-LEGACY-1',
          requesterId: 'CUS-001',
          policyId: 'POL-NARIN-001',
          createdAt: '2026-11-24T00:00:00.000Z',
          changeType: 'ADDRESS',
          requestedEffectiveDate: '2026-12-01',
          correspondenceAddress: 'Synthetic address',
        },
        policy_label: 'Family Protection Plan',
      },
      {
        proposal_id: 'PRP-INVALID-2',
        request_id: 'REQ-INVALID-2',
        policy_id: 'POL-NARIN-001',
        decided_at: new Date('2026-11-24T00:00:00Z'),
        payload: {},
        request_payload: { id: 'REQ-INVALID-2' },
        policy_label: 'Family Protection Plan',
      },
    ],
  } as never);
  const db = database('postgresql://localhost/unused');

  const history = await db.approvedHistory('CUS-001');

  expect(history).toEqual([
    expect.objectContaining({
      proposalId: 'PRP-LEGACY-1',
      requestId: 'REQ-LEGACY-1',
      policyLabel: 'Family Protection Plan',
      requestedChange: expect.objectContaining({ id: 'REQ-LEGACY-1' }),
    }),
    expect.objectContaining({
      proposalId: 'PRP-INVALID-2',
      requestId: 'REQ-INVALID-2',
      policyLabel: 'Family Protection Plan',
      requestedChange: undefined,
    }),
  ]);
  expect(query.mock.calls[0]?.[0]).toContain('p.requester_id=$1');
  expect(query.mock.calls[0]?.[0]).toContain(
    'JOIN policies pol ON pol.id=p.policy_id AND pol.customer_id=p.requester_id',
  );
  expect(query.mock.calls[0]?.[0]).not.toContain('LEFT JOIN policies');
  expect(query.mock.calls[0]?.[1]).toEqual(['CUS-001']);
  await db.close();
});
