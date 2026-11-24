import { readFileSync } from 'node:fs';
import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

export const RATING_VERSION = 'synthetic-rating-v1';
export type Frequency = 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY';
export type QuoteInput = {
  contractVersion: 'v1';
  ratingVersion: string;
  requestId: string;
  policyId: string;
  productId: string;
  requestedEffectiveDate: string;
  change:
    | { type: 'PAYMENT_FREQUENCY'; paymentFrequency: Frequency }
    | { type: 'ACCIDENTAL_DEATH_RIDER'; riderAction: 'ADD' | 'REMOVE' };
  current: {
    paymentFrequency: Frequency;
    lifeBenefitBaht: number;
    riderBenefitBaht: number;
  };
};
export type QuoteValues = {
  premiumPerInstallmentSatang: number;
  frequency: Frequency;
  installmentsPerYear: number;
  annualizedScheduledTotalSatang: number;
  lifeBenefitBaht: number;
  riderBenefitBaht: number;
};
export type Quote = {
  ratingVersion: typeof RATING_VERSION;
  currency: 'THB';
  before: QuoteValues;
  after: QuoteValues;
  difference: {
    premiumPerInstallmentSatang: number;
    annualizedScheduledTotalSatang: number;
    lifeBenefitBaht: number;
    riderBenefitBaht: number;
  };
};
export type RatingFixture = {
  policyId: string;
  productId: string;
  ratingVersion: string;
  lifeBenefitBaht: number;
  annualLifeRateSatangPerThousand: number;
  currentFrequency: Frequency;
  riderBenefitBaht: number;
  annualRiderRateSatangPerThousand: number;
};

const schedules = {
  ANNUAL: { count: 1, factor: 10_000 },
  SEMI_ANNUAL: { count: 2, factor: 10_200 },
  QUARTERLY: { count: 4, factor: 10_400 },
  MONTHLY: { count: 12, factor: 10_800 },
} as const;

export class CalculatorError extends Error {
  constructor(public readonly code: 'INVALID_INPUT' | 'FIXTURE_UNAVAILABLE') {
    super(code);
  }
}

const fixtureSchema = Type.Object(
  {
    policyId: Type.String({ minLength: 1 }),
    productId: Type.String({ minLength: 1 }),
    ratingVersion: Type.Literal(RATING_VERSION),
    lifeBenefitBaht: Type.Integer({
      minimum: 1,
      maximum: Number.MAX_SAFE_INTEGER,
      multipleOf: 1_000,
    }),
    annualLifeRateSatangPerThousand: Type.Integer({
      minimum: 0,
      maximum: Number.MAX_SAFE_INTEGER,
    }),
    currentFrequency: Type.Union([
      Type.Literal('ANNUAL'),
      Type.Literal('SEMI_ANNUAL'),
      Type.Literal('QUARTERLY'),
      Type.Literal('MONTHLY'),
    ]),
    riderBenefitBaht: Type.Integer({
      minimum: 0,
      maximum: Number.MAX_SAFE_INTEGER,
      multipleOf: 1_000,
    }),
    annualRiderRateSatangPerThousand: Type.Integer({
      minimum: 0,
      maximum: Number.MAX_SAFE_INTEGER,
    }),
  },
  { additionalProperties: false },
);

export function validateFixtures(value: unknown): RatingFixture[] {
  if (!Array.isArray(value) || value.length === 0)
    throw new CalculatorError('FIXTURE_UNAVAILABLE');
  const policyIds = new Set<string>();
  for (const entry of value) {
    if (!Value.Check(fixtureSchema, entry) || policyIds.has(entry.policyId))
      throw new CalculatorError('FIXTURE_UNAVAILABLE');
    policyIds.add(entry.policyId);
  }
  return value;
}

export function loadFixtures(): RatingFixture[] {
  try {
    const fixtures: unknown = JSON.parse(
      readFileSync(
        new URL('../fixtures/synthetic-rating-v1.json', import.meta.url),
        'utf8',
      ),
    );
    return validateFixtures(fixtures);
  } catch {
    throw new CalculatorError('FIXTURE_UNAVAILABLE');
  }
}

function validMoney(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value % 1_000 === 0;
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function values(
  fixture: RatingFixture,
  frequency: Frequency,
  riderBenefitBaht: number,
): QuoteValues {
  const schedule = schedules[frequency];
  const lifeAnnualSatang =
    (fixture.lifeBenefitBaht / 1_000) * fixture.annualLifeRateSatangPerThousand;
  const riderAnnualSatang =
    (riderBenefitBaht / 1_000) * fixture.annualRiderRateSatangPerThousand;
  const annual = lifeAnnualSatang + riderAnnualSatang;
  const denominator = 10_000 * schedule.count;
  const numerator = annual * schedule.factor;
  if (!Number.isSafeInteger(numerator))
    throw new CalculatorError('FIXTURE_UNAVAILABLE');
  const perInstallment = Math.floor(
    (numerator + denominator / 2) / denominator,
  );
  return {
    premiumPerInstallmentSatang: perInstallment,
    frequency,
    installmentsPerYear: schedule.count,
    annualizedScheduledTotalSatang: perInstallment * schedule.count,
    lifeBenefitBaht: fixture.lifeBenefitBaht,
    riderBenefitBaht,
  };
}

export function calculate(input: QuoteInput, fixtures = loadFixtures()): Quote {
  validateFixtures(fixtures);
  if (
    input.contractVersion !== 'v1' ||
    input.ratingVersion !== RATING_VERSION ||
    !input.requestId ||
    !input.policyId ||
    !input.productId ||
    !validDate(input.requestedEffectiveDate) ||
    !Object.hasOwn(schedules, input.current.paymentFrequency) ||
    !validMoney(input.current.lifeBenefitBaht) ||
    !validMoney(input.current.riderBenefitBaht)
  )
    throw new CalculatorError('INVALID_INPUT');
  const selected = fixtures.filter(
    (fixture) =>
      fixture.policyId === input.policyId &&
      fixture.productId === input.productId &&
      fixture.ratingVersion === input.ratingVersion,
  );
  if (selected.length !== 1) throw new CalculatorError('FIXTURE_UNAVAILABLE');
  const fixture = selected[0];
  if (
    !validMoney(fixture.lifeBenefitBaht) ||
    !validMoney(fixture.riderBenefitBaht) ||
    !Number.isSafeInteger(fixture.annualLifeRateSatangPerThousand) ||
    !Number.isSafeInteger(fixture.annualRiderRateSatangPerThousand) ||
    fixture.annualLifeRateSatangPerThousand < 0 ||
    fixture.annualRiderRateSatangPerThousand < 0 ||
    fixture.currentFrequency !== input.current.paymentFrequency ||
    fixture.lifeBenefitBaht !== input.current.lifeBenefitBaht ||
    fixture.riderBenefitBaht !== input.current.riderBenefitBaht
  )
    throw new CalculatorError('FIXTURE_UNAVAILABLE');
  let frequency = input.current.paymentFrequency;
  let riderBenefit = input.current.riderBenefitBaht;
  if (input.change.type === 'PAYMENT_FREQUENCY') {
    if (!Object.hasOwn(schedules, input.change.paymentFrequency))
      throw new CalculatorError('INVALID_INPUT');
    frequency = input.change.paymentFrequency;
  } else if (input.change.type === 'ACCIDENTAL_DEATH_RIDER') {
    if (input.change.riderAction === 'ADD' && riderBenefit === 0)
      riderBenefit = 250_000;
    else if (input.change.riderAction === 'REMOVE' && riderBenefit > 0)
      riderBenefit = 0;
    else throw new CalculatorError('INVALID_INPUT');
  } else throw new CalculatorError('INVALID_INPUT');
  const before = values(
    fixture,
    input.current.paymentFrequency,
    input.current.riderBenefitBaht,
  );
  const after = values(fixture, frequency, riderBenefit);
  return {
    ratingVersion: RATING_VERSION,
    currency: 'THB',
    before,
    after,
    difference: {
      premiumPerInstallmentSatang:
        after.premiumPerInstallmentSatang - before.premiumPerInstallmentSatang,
      annualizedScheduledTotalSatang:
        after.annualizedScheduledTotalSatang -
        before.annualizedScheduledTotalSatang,
      lifeBenefitBaht: after.lifeBenefitBaht - before.lifeBenefitBaht,
      riderBenefitBaht: after.riderBenefitBaht - before.riderBenefitBaht,
    },
  };
}
