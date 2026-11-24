import { describe, expect, it } from 'vitest';
import { calculate, loadFixtures, type QuoteInput } from './calculator.js';

const current: QuoteInput = {
  contractVersion: 'v1',
  ratingVersion: 'synthetic-rating-v1',
  requestId: 'REQ-1',
  policyId: 'POL-NARIN-001',
  productId: 'FAMILY_PROTECTION',
  requestedEffectiveDate: '2027-01-01',
  change: { type: 'PAYMENT_FREQUENCY', paymentFrequency: 'ANNUAL' },
  current: {
    paymentFrequency: 'MONTHLY',
    lifeBenefitBaht: 1_000_000,
    riderBenefitBaht: 250_000,
  },
};

describe('FR-09 synthetic calculator', () => {
  it('loads only complete, unique synthetic fixtures', () => {
    const fixtures = loadFixtures();
    expect(fixtures.length).toBeGreaterThan(1);
    expect(new Set(fixtures.map((fixture) => fixture.policyId)).size).toBe(
      fixtures.length,
    );
    const invalid = (fixtures: unknown) =>
      expect(() =>
        calculate(current, fixtures as Parameters<typeof calculate>[1]),
      ).toThrow('FIXTURE_UNAVAILABLE');
    invalid([...fixtures, { ...fixtures[1], productId: '' }]);
    invalid([...fixtures, { ...fixtures[1], unexpectedRate: 5 }]);
    invalid([...fixtures, { ...fixtures[1], policyId: fixtures[0].policyId }]);
    invalid([...fixtures, { ...fixtures[1], ratingVersion: 'stale' }]);
  });
  it('returns the exact monthly-to-annual comparison and is deterministic', () => {
    const quote = calculate(current);
    expect(quote).toMatchObject({
      ratingVersion: 'synthetic-rating-v1',
      currency: 'THB',
      before: {
        premiumPerInstallmentSatang: 121_500,
        installmentsPerYear: 12,
        annualizedScheduledTotalSatang: 1_458_000,
        lifeBenefitBaht: 1_000_000,
        riderBenefitBaht: 250_000,
      },
      after: {
        premiumPerInstallmentSatang: 1_350_000,
        installmentsPerYear: 1,
        annualizedScheduledTotalSatang: 1_350_000,
      },
      difference: { annualizedScheduledTotalSatang: -108_000 },
    });
    expect(calculate(current)).toEqual(quote);
  });

  it.each([
    ['ANNUAL', 1_350_000, 1],
    ['SEMI_ANNUAL', 688_500, 2],
    ['QUARTERLY', 351_000, 4],
    ['MONTHLY', 121_500, 12],
  ] as const)(
    'quotes %s with its exact schedule',
    (frequency, amount, count) => {
      expect(
        calculate({
          ...current,
          change: { type: 'PAYMENT_FREQUENCY', paymentFrequency: frequency },
        }).after,
      ).toMatchObject({
        premiumPerInstallmentSatang: amount,
        installmentsPerYear: count,
      });
    },
  );

  it('calculates rider add and remove against the selected fixture', () => {
    const removed = calculate({
      ...current,
      change: { type: 'ACCIDENTAL_DEATH_RIDER', riderAction: 'REMOVE' },
    });
    expect(removed.after).toMatchObject({
      riderBenefitBaht: 0,
      premiumPerInstallmentSatang: 108_000,
    });
    const added = calculate({
      ...current,
      policyId: 'POL-MALI-001',
      productId: 'SECURE_FUTURE',
      current: {
        paymentFrequency: 'ANNUAL',
        lifeBenefitBaht: 750_000,
        riderBenefitBaht: 0,
      },
      change: { type: 'ACCIDENTAL_DEATH_RIDER', riderAction: 'ADD' },
    });
    expect(added.after).toMatchObject({
      riderBenefitBaht: 250_000,
      premiumPerInstallmentSatang: 1_050_000,
    });
  });

  it('rejects unknown fixtures, stale versions and contradictory facts', () => {
    expect(() => calculate({ ...current, policyId: 'UNKNOWN' })).toThrow();
    expect(() => calculate({ ...current, ratingVersion: 'old' })).toThrow();
    expect(() =>
      calculate({
        ...current,
        current: { ...current.current, lifeBenefitBaht: 1 },
      }),
    ).toThrow();
  });

  it('rounds a fractional installment half-up in integer satang and handles zero difference', () => {
    const tiny = {
      ...current,
      current: {
        paymentFrequency: 'MONTHLY' as const,
        lifeBenefitBaht: 1_000,
        riderBenefitBaht: 0,
      },
    };
    const fixture = {
      policyId: tiny.policyId,
      productId: tiny.productId,
      ratingVersion: 'synthetic-rating-v1',
      lifeBenefitBaht: 1_000,
      annualLifeRateSatangPerThousand: 7,
      currentFrequency: 'MONTHLY' as const,
      riderBenefitBaht: 0,
      annualRiderRateSatangPerThousand: 0,
    };
    const rounded = calculate(tiny, [fixture]);
    expect(rounded.before.premiumPerInstallmentSatang).toBe(1);
    expect(rounded.after.premiumPerInstallmentSatang).toBe(7);
    const same = calculate(
      {
        ...tiny,
        change: { type: 'PAYMENT_FREQUENCY', paymentFrequency: 'MONTHLY' },
      },
      [fixture],
    );
    expect(same.difference.annualizedScheduledTotalSatang).toBe(0);
  });
});
