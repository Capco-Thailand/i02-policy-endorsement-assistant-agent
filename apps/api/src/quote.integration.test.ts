import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { buildApp } from './app.js';
import { database } from './db.js';
import { loadCorpus } from './load-corpus.js';
import { loadRules } from './load-rules.js';
import type { QuoteContract } from '@pea/calculator/contract';

const url = process.env.TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;
integration('FR-09 quote API', () => {
  const db = database(url ?? 'postgresql://localhost/unused');
  const quote: QuoteContract = {
    ratingVersion: 'synthetic-rating-v1',
    currency: 'THB',
    before: {
      frequency: 'MONTHLY',
      premiumPerInstallmentSatang: 121_500,
      installmentsPerYear: 12,
      annualizedScheduledTotalSatang: 1_458_000,
      lifeBenefitBaht: 1_000_000,
      riderBenefitBaht: 250_000,
    },
    after: {
      frequency: 'ANNUAL',
      premiumPerInstallmentSatang: 1_350_000,
      installmentsPerYear: 1,
      annualizedScheduledTotalSatang: 1_350_000,
      lifeBenefitBaht: 1_000_000,
      riderBenefitBaht: 250_000,
    },
    difference: {
      premiumPerInstallmentSatang: 1_228_500,
      annualizedScheduledTotalSatang: -108_000,
      lifeBenefitBaht: 0,
      riderBenefitBaht: 0,
    },
  };
  const calculator = vi.fn(async () => quote);
  let app: Awaited<ReturnType<typeof buildApp>>;
  let narin = '';
  let mali = '';
  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    await db.migrate();
    await db.seed();
    await loadCorpus(db.pool);
    await loadRules(db.pool);
    app = await buildApp({ calculatorClient: calculator });
    for (const [accountId, password, set] of [
      [
        'narin',
        'NarinDemo123!',
        (value: string) => {
          narin = value;
        },
      ],
      [
        'mali',
        'MaliDemo123!',
        (value: string) => {
          mali = value;
        },
      ],
    ] as const) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: { accountId, password },
      });
      set(response.headers['set-cookie']?.toString().split(';')[0] ?? '');
    }
  });
  afterAll(async () => {
    await app?.close();
    await db.close();
  });

  const create = async (payload: Record<string, unknown>) => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/policies/POL-NARIN-001/requests',
      headers: { cookie: narin },
      payload,
    });
    expect(response.statusCode).toBe(200);
    return response.json().request.id as string;
  };
  const path = (id: string, policy = 'POL-NARIN-001') =>
    `/api/policies/${policy}/requests/${id}/quote`;
  const paymentChange = {
    changeType: 'PAYMENT_FREQUENCY',
    requestedEffectiveDate: '2027-01-01',
    paymentFrequency: 'ANNUAL',
  };
  const failedAudit = async (id: string) => {
    const result = await db.pool.query<{ metadata: { reason: string } }>(
      "SELECT metadata FROM audit_events WHERE action='quote-failed' AND metadata->>'requestId'=$1 ORDER BY at DESC LIMIT 1",
      [id],
    );
    expect(result.rows[0]?.metadata.reason).toBe('CALCULATION_UNAVAILABLE');
  };

  it('quotes an owner-only eligible payment change with exact calculator input', async () => {
    const id = await create({
      changeType: 'PAYMENT_FREQUENCY',
      requestedEffectiveDate: '2027-01-01',
      paymentFrequency: 'ANNUAL',
    });
    const before = await db.policy('CUS-001', 'POL-NARIN-001');
    const response = await app.inject({
      method: 'POST',
      url: path(id),
      headers: { cookie: narin },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'CALCULATED', quote });
    expect(calculator).toHaveBeenCalledWith(
      expect.objectContaining({
        policyId: 'POL-NARIN-001',
        productId: 'FAMILY_PROTECTION',
        requestId: id,
        current: {
          paymentFrequency: 'MONTHLY',
          lifeBenefitBaht: 1_000_000,
          riderBenefitBaht: 250_000,
        },
        change: { type: 'PAYMENT_FREQUENCY', paymentFrequency: 'ANNUAL' },
      }),
    );
    expect(await db.policy('CUS-001', 'POL-NARIN-001')).toEqual(before);
  });

  it('does not call calculator for unchanged, referred, foreign or signed-out requests', async () => {
    const address = await create({
      changeType: 'ADDRESS',
      requestedEffectiveDate: '2027-01-01',
      correspondenceAddress: '100 Synthetic Road',
    });
    calculator.mockClear();
    const unchanged = await app.inject({
      method: 'POST',
      url: path(address),
      headers: { cookie: narin },
    });
    expect(unchanged.statusCode).toBe(200);
    expect(unchanged.json()).toEqual({
      status: 'UNCHANGED',
      premiumImpact: 'UNCHANGED',
      benefitImpact: 'UNCHANGED',
    });
    expect(calculator).not.toHaveBeenCalled();
    const beneficiary = await create({
      changeType: 'BENEFICIARY',
      requestedEffectiveDate: '2027-01-01',
      beneficiaries: [{ name: 'Arisa K.', allocationPercent: 100 }],
    });
    const unchangedBeneficiary = await app.inject({
      method: 'POST',
      url: path(beneficiary),
      headers: { cookie: narin },
    });
    expect(unchangedBeneficiary.statusCode).toBe(200);
    expect(unchangedBeneficiary.json().status).toBe('UNCHANGED');
    expect(calculator).not.toHaveBeenCalled();
    expect(
      (
        await app.inject({
          method: 'POST',
          url: path(address),
          headers: { cookie: mali },
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (await app.inject({ method: 'POST', url: path(address) })).statusCode,
    ).toBe(401);
    const rider = await create({
      changeType: 'ACCIDENTAL_DEATH_RIDER',
      requestedEffectiveDate: '2027-01-01',
      riderAction: 'ADD',
    });
    const referred = await app.inject({
      method: 'POST',
      url: path(rider),
      headers: { cookie: narin },
    });
    expect(referred.statusCode).toBe(409);
    expect(referred.json().error).toBe('NOT_ELIGIBLE');
    expect(calculator).not.toHaveBeenCalled();
    const unsupportedFrequency = await create({
      changeType: 'PAYMENT_FREQUENCY',
      requestedEffectiveDate: '2027-01-01',
      paymentFrequency: 'QUARTERLY',
    });
    const cannotProceed = await app.inject({
      method: 'POST',
      url: path(unsupportedFrequency),
      headers: { cookie: narin },
    });
    expect(cannotProceed.statusCode).toBe(409);
    expect(cannotProceed.json().assessment.outcome).toBe('CANNOT_PROCEED');
    expect(calculator).not.toHaveBeenCalled();
  });

  it('rejects a stored request on an expired policy before calculation', async () => {
    const id = randomUUID();
    await db.saveRequest(
      {
        id,
        requesterId: 'CUS-001',
        policyId: 'POL-NARIN-002',
        createdAt: new Date().toISOString(),
        changeType: 'ADDRESS',
        requestedEffectiveDate: '2027-01-01',
        correspondenceAddress: '100 Synthetic Road',
      },
      Date.now(),
    );
    calculator.mockClear();
    const response = await app.inject({
      method: 'POST',
      url: path(id, 'POL-NARIN-002'),
      headers: { cookie: narin },
    });
    expect(response.statusCode).toBe(409);
    expect(calculator).not.toHaveBeenCalled();
  });

  it('rejects mismatched structured policy terms before calling calculator', async () => {
    const id = await create(paymentChange);
    const original = await db.pool.query<{ coverage_terms: unknown }>(
      'SELECT coverage_terms FROM policies WHERE id=$1',
      ['POL-NARIN-001'],
    );
    const terms = structuredClone(original.rows[0].coverage_terms) as {
      amount: number;
    }[];
    terms[0].amount += 1_000;
    calculator.mockClear();
    try {
      await db.pool.query('UPDATE policies SET coverage_terms=$2 WHERE id=$1', [
        'POL-NARIN-001',
        JSON.stringify(terms),
      ]);
      const response = await app.inject({
        method: 'POST',
        url: path(id),
        headers: { cookie: narin },
      });
      expect(response.statusCode).toBe(503);
      expect(response.json().error).toBe('CALCULATION_UNAVAILABLE');
      expect(calculator).not.toHaveBeenCalled();
      await failedAudit(id);
    } finally {
      await db.pool.query('UPDATE policies SET coverage_terms=$2 WHERE id=$1', [
        'POL-NARIN-001',
        JSON.stringify(original.rows[0].coverage_terms),
      ]);
    }
  });

  it.each(['invalid', 'failed'] as const)(
    'rejects %s calculator responses and audits failure',
    async (kind) => {
      const id = await create(paymentChange);
      const before = await db.policy('CUS-001', 'POL-NARIN-001');
      calculator.mockClear();
      if (kind === 'invalid')
        calculator.mockResolvedValueOnce({
          ...quote,
          after: { ...quote.after, lifeBenefitBaht: 123 },
        });
      else
        calculator.mockRejectedValueOnce(new Error('calculator unavailable'));
      const response = await app.inject({
        method: 'POST',
        url: path(id),
        headers: { cookie: narin },
      });
      expect(response.statusCode).toBe(503);
      expect(response.json().error).toBe('CALCULATION_UNAVAILABLE');
      expect(calculator).toHaveBeenCalledOnce();
      await failedAudit(id);
      expect(await db.policy('CUS-001', 'POL-NARIN-001')).toEqual(before);
    },
  );

  it('FR-10 persists the exact calculated quote once and presents the proposal without changing policy', async () => {
    const id = await create(paymentChange);
    const before = await db.policy('CUS-001', 'POL-NARIN-001');
    const endpoint = `/api/policies/POL-NARIN-001/requests/${id}/proposal`;
    calculator.mockClear();
    const first = await app.inject({
      method: 'POST',
      url: endpoint,
      headers: { cookie: narin },
    });
    expect(first.statusCode).toBe(200);
    expect(first.json()).toMatchObject({
      status: 'DRAFT',
      binding: false,
      impact: { status: 'CALCULATED', quote },
    });
    expect(first.json().citations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'POLICY',
          version: expect.any(String),
        }),
        expect.objectContaining({ kind: 'RULE', version: expect.any(Number) }),
      ]),
    );
    expect(calculator).toHaveBeenCalledOnce();
    const second = await app.inject({
      method: 'POST',
      url: endpoint,
      headers: { cookie: narin },
    });
    expect(second.json()).toEqual(first.json());
    expect(calculator).toHaveBeenCalledOnce();
    const audit = await db.pool.query(
      "SELECT count(*)::int AS total FROM audit_events WHERE action='proposal-create' AND metadata->>'requestId'=$1",
      [id],
    );
    expect(audit.rows[0].total).toBe(1);
    const read = await app.inject({
      method: 'GET',
      url: `/api/policies/POL-NARIN-001/proposals/${first.json().id}`,
      headers: { cookie: narin },
    });
    expect(read.json().status).toBe('PENDING_APPROVAL');
    expect(await db.policy('CUS-001', 'POL-NARIN-001')).toEqual(before);
  });

  it('FR-10 does not create a proposal when calculation fails', async () => {
    const id = await create(paymentChange);
    calculator.mockRejectedValueOnce(new Error('calculator unavailable'));
    const result = await app.inject({
      method: 'POST',
      url: `/api/policies/POL-NARIN-001/requests/${id}/proposal`,
      headers: { cookie: narin },
    });
    expect(result.statusCode).toBe(503);
    const rows = await db.pool.query(
      'SELECT id FROM endorsement_proposals WHERE request_id=$1',
      [id],
    );
    expect(rows.rowCount).toBe(0);
  });
});
