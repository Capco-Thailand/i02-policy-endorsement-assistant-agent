import { Type, type Static } from '@sinclair/typebox';

const common = {
  changeType: Type.String(),
  requestedEffectiveDate: Type.String(),
};
const strict = { additionalProperties: false };
const beneficiary = Type.Object(
  {
    name: Type.String({ minLength: 1 }),
    allocationPercent: Type.Number({ exclusiveMinimum: 0, maximum: 100 }),
  },
  strict,
);
export const RequestBody = Type.Union([
  Type.Object(
    {
      ...common,
      changeType: Type.Literal('BENEFICIARY'),
      beneficiaries: Type.Array(beneficiary, { minItems: 1 }),
    },
    strict,
  ),
  Type.Object(
    {
      ...common,
      changeType: Type.Literal('ADDRESS'),
      correspondenceAddress: Type.String({ minLength: 1 }),
    },
    strict,
  ),
  Type.Object(
    {
      ...common,
      changeType: Type.Literal('PAYMENT_FREQUENCY'),
      paymentFrequency: Type.Union([
        Type.Literal('MONTHLY'),
        Type.Literal('QUARTERLY'),
        Type.Literal('SEMI_ANNUAL'),
        Type.Literal('ANNUAL'),
      ]),
    },
    strict,
  ),
  Type.Object(
    {
      ...common,
      changeType: Type.Literal('ACCIDENTAL_DEATH_RIDER'),
      riderAction: Type.Union([Type.Literal('ADD'), Type.Literal('REMOVE')]),
    },
    strict,
  ),
]);
export type RequestInput = Static<typeof RequestBody>;
export const RequestRecordSchema = Type.Union(
  RequestBody.anyOf.map((variant) =>
    Type.Object(
      {
        ...variant.properties,
        id: Type.String(),
        requesterId: Type.String(),
        policyId: Type.String(),
        createdAt: Type.String(),
      },
      strict,
    ),
  ),
);
export type RequestRecord = RequestInput & {
  id: string;
  requesterId: string;
  policyId: string;
  createdAt: string;
};
export const validDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
};
export const validAllocation = (body: RequestInput): boolean =>
  body.changeType !== 'BENEFICIARY' ||
  body.beneficiaries.reduce((sum, item) => sum + item.allocationPercent, 0) ===
    100;
