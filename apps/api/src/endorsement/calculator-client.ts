import { Value } from '@sinclair/typebox/value';
import {
  QuoteSchema,
  type QuoteContract,
  type QuoteInputContract,
} from '@pea/calculator/contract';

export type CalculatorClient = (
  input: QuoteInputContract,
) => Promise<QuoteContract>;

export const calculatorClient: CalculatorClient = async (input) => {
  const endpoint = process.env.CALCULATOR_URL ?? 'http://127.0.0.1:3002';
  const response = await fetch(new URL('/v1/quote', endpoint), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(3_000),
  });
  if (!response.ok) throw new Error('CALCULATION_UNAVAILABLE');
  const body: unknown = await response.json();
  if (!Value.Check(QuoteSchema, body))
    throw new Error('CALCULATION_UNAVAILABLE');
  return body;
};

export function validQuote(
  input: QuoteInputContract,
  quote: QuoteContract,
): boolean {
  if (
    !Value.Check(QuoteSchema, quote) ||
    quote.ratingVersion !== input.ratingVersion
  )
    return false;
  const before = quote.before;
  const after = quote.after;
  if (
    before.frequency !== input.current.paymentFrequency ||
    before.lifeBenefitBaht !== input.current.lifeBenefitBaht ||
    before.riderBenefitBaht !== input.current.riderBenefitBaht ||
    before.annualizedScheduledTotalSatang !==
      before.premiumPerInstallmentSatang * before.installmentsPerYear ||
    after.annualizedScheduledTotalSatang !==
      after.premiumPerInstallmentSatang * after.installmentsPerYear
  )
    return false;
  const schedule = { ANNUAL: 1, SEMI_ANNUAL: 2, QUARTERLY: 4, MONTHLY: 12 };
  if (
    before.installmentsPerYear !== schedule[before.frequency] ||
    after.installmentsPerYear !== schedule[after.frequency]
  )
    return false;
  if (
    input.change.type === 'PAYMENT_FREQUENCY' &&
    (after.frequency !== input.change.paymentFrequency ||
      after.lifeBenefitBaht !== before.lifeBenefitBaht ||
      after.riderBenefitBaht !== before.riderBenefitBaht)
  )
    return false;
  if (
    input.change.type === 'ACCIDENTAL_DEATH_RIDER' &&
    (after.frequency !== before.frequency ||
      after.lifeBenefitBaht !== before.lifeBenefitBaht ||
      (input.change.riderAction === 'ADD' && after.riderBenefitBaht <= 0) ||
      (input.change.riderAction === 'REMOVE' && after.riderBenefitBaht !== 0))
  )
    return false;
  return (
    quote.difference.premiumPerInstallmentSatang ===
      after.premiumPerInstallmentSatang - before.premiumPerInstallmentSatang &&
    quote.difference.annualizedScheduledTotalSatang ===
      after.annualizedScheduledTotalSatang -
        before.annualizedScheduledTotalSatang &&
    quote.difference.lifeBenefitBaht ===
      after.lifeBenefitBaht - before.lifeBenefitBaht &&
    quote.difference.riderBenefitBaht ===
      after.riderBenefitBaht - before.riderBenefitBaht
  );
}
