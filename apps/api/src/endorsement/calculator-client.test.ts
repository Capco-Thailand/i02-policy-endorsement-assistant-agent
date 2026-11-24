import { describe, expect, it } from 'vitest';
import { createServer } from 'node:http';
import { calculatorClient, validQuote } from './calculator-client.js';
import type {
  QuoteContract,
  QuoteInputContract,
} from '@pea/calculator/contract';

const input: QuoteInputContract = {
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

describe('FR-09 API calculator response validation', () => {
  it('accepts a consistent response and rejects altered amounts or benefits', () => {
    expect(validQuote(input, quote)).toBe(true);
    expect(
      validQuote(input, {
        ...quote,
        after: { ...quote.after, lifeBenefitBaht: 123 },
      }),
    ).toBe(false);
    expect(
      validQuote(input, {
        ...quote,
        difference: { ...quote.difference, annualizedScheduledTotalSatang: 0 },
      }),
    ).toBe(false);
  });

  it('times out when the internal calculator does not respond', async () => {
    const server = createServer((_request, _response) => {});
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('No port');
    const previous = process.env.CALCULATOR_URL;
    process.env.CALCULATOR_URL = `http://127.0.0.1:${address.port}`;
    try {
      await expect(calculatorClient(input)).rejects.toThrow();
    } finally {
      if (previous === undefined) delete process.env.CALCULATOR_URL;
      else process.env.CALCULATOR_URL = previous;
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }, 10_000);
});
