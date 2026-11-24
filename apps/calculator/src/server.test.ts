import { describe, expect, it } from 'vitest';
import { buildCalculatorApp } from './server.js';

describe('FR-09 calculator HTTP contract', () => {
  it('returns a versioned quote and rejects invalid input', async () => {
    const app = buildCalculatorApp();
    try {
      const payload = {
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
      const response = await app.inject({
        method: 'POST',
        url: '/v1/quote',
        payload,
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().after.annualizedScheduledTotalSatang).toBe(
        1_350_000,
      );
      expect(
        (await app.inject({ method: 'GET', url: '/health' })).statusCode,
      ).toBe(200);
      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/v1/quote',
            payload: { ...payload, customerName: 'Narin' },
          })
        ).statusCode,
      ).toBe(400);
      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/v1/quote',
            payload: { ...payload, policyId: 'UNKNOWN' },
          })
        ).statusCode,
      ).toBe(422);
    } finally {
      await app.close();
    }
  });
});
