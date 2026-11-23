import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from './app.js';
import { database } from './db.js';
import { loadCorpus } from './load-corpus.js';

const url = process.env.TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;

integration('FR-14 owned policy detail terms', () => {
  const db = database(url ?? 'postgresql://localhost/unused');
  let app: Awaited<ReturnType<typeof buildApp>>;
  let narin = '';
  let mali = '';
  let variant: 'current' | 'missing' | 'stale' | 'conflict' = 'current';
  const evidenceDocument = vi.fn(async (policyId: string) => {
    const document = await db.evidenceDocument(policyId);
    if (!document || policyId !== 'POL-NARIN-001' || variant === 'current')
      return document;
    if (variant === 'missing')
      return {
        ...document,
        sections: document.sections.filter(
          (section) => section.sectionId !== 'coverage.life',
        ),
      };
    return {
      ...document,
      sections: document.sections.map((section) =>
        section.sectionId !== 'coverage.life'
          ? section
          : variant === 'stale'
            ? { ...section, encoderVersion: 'old-encoder' }
            : {
                ...section,
                value: {
                  name: 'Life benefit',
                  amount: 900000,
                  currency: 'THB',
                },
              },
      ),
    };
  });
  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    await db.migrate();
    await db.seed();
    await loadCorpus(db.pool);
    app = await buildApp({
      evidenceStore: { evidenceDocument, rankedEvidence: db.rankedEvidence },
    });
    const signIn = async (accountId: string, password: string) => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: { accountId, password },
      });
      return response.headers['set-cookie']?.toString().split(';')[0] ?? '';
    };
    narin = await signIn('narin', 'NarinDemo123!');
    mali = await signIn('mali', 'MaliDemo123!');
  });
  afterAll(async () => {
    await app?.close();
    await db.close();
  });
  const detail = (policyId: string, cookie?: string) =>
    app.inject({
      method: 'GET',
      url: `/api/policies/${policyId}`,
      headers: cookie ? { cookie } : {},
    });

  it('returns exact cited FR-14 terms only for the owner without changing policy data', async () => {
    const before = await db.policy('CUS-001', 'POL-NARIN-001');
    const response = await detail('POL-NARIN-001', narin);
    expect(response.statusCode).toBe(200);
    expect(response.json().policy.terms).toMatchObject({
      product: {
        status: 'confirmed',
        value: { insurer: 'Example Mutual (Synthetic)', version: 'v1' },
        citation: { sourceId: 'POL-NARIN-001:v1', sectionId: 'product' },
      },
      coverages: [
        {
          status: 'confirmed',
          value: { amount: 1000000, currency: 'THB' },
          citation: { sectionId: 'coverage.life' },
        },
        {
          status: 'confirmed',
          value: { amount: 250000, currency: 'THB' },
          citation: { sectionId: 'coverage.accidental-death' },
        },
      ],
      exclusions: [
        { status: 'confirmed', citation: { sectionId: 'exclusions.life' } },
        {
          status: 'confirmed',
          citation: { sectionId: 'exclusions.accidental-death' },
        },
      ],
    });
    expect(await db.policy('CUS-001', 'POL-NARIN-001')).toEqual(before);
    const reads = evidenceDocument.mock.calls.length;
    expect((await detail('POL-NARIN-001')).statusCode).toBe(401);
    const foreign = await detail('POL-NARIN-001', mali);
    const unknown = await detail('POL-UNKNOWN', mali);
    expect(foreign.statusCode).toBe(404);
    expect(foreign.body).toBe(unknown.body);
    expect(evidenceDocument).toHaveBeenCalledTimes(reads);
  });

  it('marks only the affected coverage unresolved for missing, stale, and conflicting evidence', async () => {
    try {
      for (const [state, reason] of [
        ['missing', 'MISSING_SECTION'],
        ['stale', 'STALE_ENCODER'],
        ['conflict', 'CONFLICTING_EVIDENCE'],
      ] as const) {
        variant = state;
        const response = await detail('POL-NARIN-001', narin);
        expect(response.statusCode).toBe(200);
        const terms = response.json().policy.terms;
        expect(terms.coverages[0]).toMatchObject({
          status: 'unresolved',
          reason,
        });
        expect(terms.coverages[0]).not.toHaveProperty('value');
        expect(terms.coverages[1].status).toBe('confirmed');
        expect(terms.product.status).toBe('confirmed');
      }
    } finally {
      variant = 'current';
    }
  });
});
