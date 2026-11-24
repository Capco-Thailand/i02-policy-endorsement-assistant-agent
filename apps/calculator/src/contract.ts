import { Type, type Static } from '@sinclair/typebox';

export const FrequencySchema = Type.Union([
  Type.Literal('ANNUAL'),
  Type.Literal('SEMI_ANNUAL'),
  Type.Literal('QUARTERLY'),
  Type.Literal('MONTHLY'),
]);
const Amount = Type.Integer({ minimum: 0, maximum: Number.MAX_SAFE_INTEGER });
export const QuoteInputSchema = Type.Object(
  {
    contractVersion: Type.Literal('v1'),
    ratingVersion: Type.Literal('synthetic-rating-v1'),
    requestId: Type.String({ minLength: 1 }),
    policyId: Type.String({ minLength: 1 }),
    productId: Type.String({ minLength: 1 }),
    requestedEffectiveDate: Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
    change: Type.Union([
      Type.Object(
        {
          type: Type.Literal('PAYMENT_FREQUENCY'),
          paymentFrequency: FrequencySchema,
        },
        { additionalProperties: false },
      ),
      Type.Object(
        {
          type: Type.Literal('ACCIDENTAL_DEATH_RIDER'),
          riderAction: Type.Union([
            Type.Literal('ADD'),
            Type.Literal('REMOVE'),
          ]),
        },
        { additionalProperties: false },
      ),
    ]),
    current: Type.Object(
      {
        paymentFrequency: FrequencySchema,
        lifeBenefitBaht: Amount,
        riderBenefitBaht: Amount,
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
const Values = Type.Object(
  {
    premiumPerInstallmentSatang: Amount,
    frequency: FrequencySchema,
    installmentsPerYear: Type.Integer({ minimum: 1, maximum: 12 }),
    annualizedScheduledTotalSatang: Amount,
    lifeBenefitBaht: Amount,
    riderBenefitBaht: Amount,
  },
  { additionalProperties: false },
);
const Signed = Type.Integer({
  minimum: -Number.MAX_SAFE_INTEGER,
  maximum: Number.MAX_SAFE_INTEGER,
});
export const QuoteSchema = Type.Object(
  {
    ratingVersion: Type.Literal('synthetic-rating-v1'),
    currency: Type.Literal('THB'),
    before: Values,
    after: Values,
    difference: Type.Object(
      {
        premiumPerInstallmentSatang: Signed,
        annualizedScheduledTotalSatang: Signed,
        lifeBenefitBaht: Signed,
        riderBenefitBaht: Signed,
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export type QuoteInputContract = Static<typeof QuoteInputSchema>;
export type QuoteContract = Static<typeof QuoteSchema>;
