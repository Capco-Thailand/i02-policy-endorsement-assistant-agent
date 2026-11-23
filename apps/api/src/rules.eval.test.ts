import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from './app.js';
import { database } from './db.js';
import { loadCorpus } from './load-corpus.js';
import { loadRules } from './load-rules.js';
import type { ChangeType } from './rules.js';

type BaseCase = {
  id: string;
  changeType: ChangeType;
  policyId: string;
  productId: string;
  requestedEffectiveDate: string;
  scenario: string;
};
type ApplicableCase = BaseCase & {
  expectedRuleIds: string[];
  expectedVersion: number;
};
type SafetyCase = BaseCase & { expectedStatus: string };
const fixture = JSON.parse(
  await readFile(
    fileURLToPath(
      new URL('../../ai/eval/rule-retrieval-v2.json', import.meta.url),
    ),
    'utf8',
  ),
) as {
  version: string;
  applicableCases: ApplicableCase[];
  safetyCases: SafetyCase[];
};
const url = process.env.TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;

function isFalseReferral(
  eligibleCase: boolean,
  statusCode: number,
  result: { status: string; requiresHumanReferral: boolean },
) {
  return eligibleCase && statusCode === 200 && result.requiresHumanReferral;
}

describe('FR-05 evaluation counter-metrics', () => {
  it('counts unresolved 200 referrals for eligible cases but leaves 503 to retrieval failures', () => {
    expect(
      isFalseReferral(true, 200, {
        status: 'MISSING',
        requiresHumanReferral: true,
      }),
    ).toBe(true);
    expect(
      isFalseReferral(true, 200, {
        status: 'CONFLICTING',
        requiresHumanReferral: true,
      }),
    ).toBe(true);
    expect(
      isFalseReferral(true, 503, {
        status: 'UNAVAILABLE',
        requiresHumanReferral: true,
      }),
    ).toBe(false);
    expect(
      isFalseReferral(true, 200, {
        status: 'AVAILABLE',
        requiresHumanReferral: false,
      }),
    ).toBe(false);
  });
});

integration('FR-05 fixed retrieval evaluation', () => {
  const db = database(url ?? 'postgresql://localhost/unused');
  let app: Awaited<ReturnType<typeof buildApp>>;
  let conflictApp: Awaited<ReturnType<typeof buildApp>>;
  let narin = '';
  let mali = '';
  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    await db.migrate();
    await db.seed();
    await loadCorpus(db.pool);
    await loadRules(db.pool);
    app = await buildApp();
    conflictApp = await buildApp({
      ruleStore: {
        selectedRuleProduct: (policyId) => db.selectedRuleProduct(policyId),
        ruleSources: async (productId, changeType, date) => {
          const sources = await db.ruleSources(productId, changeType, date);
          return sources.flatMap((source) => [
            source,
            {
              ...source,
              sourceId: `${source.sourceId}:conflict`,
              sections: source.sections.map((section) =>
                section.role === 'RULE'
                  ? { ...section, value: { kind: 'REFERRAL' } }
                  : section,
              ),
            },
          ]);
        },
        rankedRuleSections: (ids, vector, limit) =>
          db.rankedRuleSections(ids, vector, limit),
      },
    });
    for (const [accountId, set] of [
      [
        'narin',
        (value: string) => {
          narin = value;
        },
      ],
      [
        'mali',
        (value: string) => {
          mali = value;
        },
      ],
    ] as const) {
      const login = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: {
          accountId,
          password: accountId === 'narin' ? 'NarinDemo123!' : 'MaliDemo123!',
        },
      });
      set(login.headers['set-cookie']?.toString().split(';')[0] ?? '');
    }
  });
  afterAll(async () => {
    await app?.close();
    await conflictApp?.close();
    await db.close();
  });

  it('C8 measures relevant-rule recall over 80 applicable cases and separately checks safety cases', async () => {
    expect(fixture.version).toBe('rule-retrieval-v2');
    expect(fixture.applicableCases).toHaveLength(80);
    expect(fixture.safetyCases.length).toBeGreaterThanOrEqual(20);
    const changes: ChangeType[] = [
      'BENEFICIARY',
      'ADDRESS',
      'PAYMENT_FREQUENCY',
      'ACCIDENTAL_DEATH_RIDER',
    ];
    const falseReferrals: Record<
      string,
      { count: number; denominator: number }
    > = {};
    const retrievalFailures: Record<
      string,
      { count: number; denominator: number }
    > = {};
    for (const change of changes) {
      expect(
        fixture.applicableCases.filter((item) => item.changeType === change),
      ).toHaveLength(20);
      falseReferrals[change] = { count: 0, denominator: 0 };
      retrievalFailures[change] = { count: 0, denominator: 0 };
    }
    let denominator = 0;
    let passCount = 0;
    const failedIds: string[] = [];
    const contractFailedIds: string[] = [];
    const safetyFailedIds: string[] = [];
    const request = async (item: BaseCase) => {
      const target = item.scenario === 'conflict' ? conflictApp : app;
      const cookie =
        item.scenario === 'no-session'
          ? ''
          : item.scenario === 'foreign'
            ? narin
            : item.policyId === 'POL-MALI-001'
              ? mali
              : narin;
      return target.inject({
        method: 'GET',
        url: `/api/policies/${item.policyId}/rules?changeType=${item.changeType}&requestedEffectiveDate=${item.requestedEffectiveDate}`,
        headers: cookie ? { cookie } : {},
      });
    };
    for (const item of fixture.applicableCases) {
      expect(item.expectedRuleIds.length).toBeGreaterThan(0);
      denominator += item.expectedRuleIds.length;
      const response = await request(item);
      retrievalFailures[item.changeType].denominator++;
      if (response.statusCode === 503)
        retrievalFailures[item.changeType].count++;
      const body = response.json();
      const rules =
        response.statusCode === 200 && body.status === 'AVAILABLE'
          ? body.citations.filter(
              (citation: { role: string }) => citation.role === 'RULE',
            )
          : [];
      const returnedIds = new Set<string>(
        rules.map((citation: { ruleId: string }) => citation.ruleId),
      );
      const matched = item.expectedRuleIds.filter((id) =>
        returnedIds.has(id),
      ).length;
      passCount += matched;
      if (matched !== item.expectedRuleIds.length) failedIds.push(item.id);
      const exactIds = returnedIds.size === item.expectedRuleIds.length;
      const metadataValid = rules.every(
        (citation: {
          productId: string;
          changeType: string;
          effectiveFrom: string;
          effectiveTo: string;
          version: number;
        }) =>
          citation.productId === item.productId &&
          citation.changeType === item.changeType &&
          citation.effectiveFrom <= item.requestedEffectiveDate &&
          citation.effectiveTo >= item.requestedEffectiveDate &&
          citation.version === item.expectedVersion,
      );
      const referralExpected = item.changeType === 'ACCIDENTAL_DEATH_RIDER';
      const eligibleCase =
        item.scenario === 'active-policy' && !referralExpected;
      if (eligibleCase) falseReferrals[item.changeType].denominator++;
      if (
        response.statusCode !== 200 ||
        body.status !== 'AVAILABLE' ||
        !exactIds ||
        !metadataValid ||
        body.requiresHumanReferral !== referralExpected
      )
        contractFailedIds.push(item.id);
      if (isFalseReferral(eligibleCase, response.statusCode, body))
        falseReferrals[item.changeType].count++;
    }
    for (const item of fixture.safetyCases) {
      const response = await request(item);
      if (item.scenario !== 'foreign' && item.scenario !== 'no-session') {
        retrievalFailures[item.changeType].denominator++;
        if (response.statusCode === 503)
          retrievalFailures[item.changeType].count++;
      }
      const body = response.json();
      const actual =
        response.statusCode === 200 ? body.status : String(response.statusCode);
      if (
        actual !== item.expectedStatus ||
        (response.statusCode === 200 && body.citations.length !== 0)
      )
        safetyFailedIds.push(item.id);
    }
    const percentage = denominator === 0 ? 0 : (passCount / denominator) * 100;
    expect(falseReferrals.BENEFICIARY.denominator).toBe(12);
    expect(retrievalFailures.BENEFICIARY.denominator).toBe(23);
    console.log(
      JSON.stringify({
        version: fixture.version,
        denominator,
        passCount,
        percentage,
        failedIds,
        contractFailedIds,
        safetyDenominator: fixture.safetyCases.length,
        safetyFailedIds,
        falseReferrals,
        retrievalFailures,
      }),
    );
    expect(percentage).toBeGreaterThanOrEqual(95);
    expect(failedIds).toEqual([]);
    expect(contractFailedIds).toEqual([]);
    expect(safetyFailedIds).toEqual([]);
  });
});
