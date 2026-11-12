import { Type, type Static } from '@sinclair/typebox';

export const CustomerSchema = Type.Object({
  id: Type.String(),
  displayName: Type.String(),
});
export const ErrorResponseSchema = Type.Object({ error: Type.String() });
export const SignInBodySchema = Type.Object({
  accountId: Type.String({ minLength: 1 }),
  password: Type.String({ minLength: 1 }),
});
export const PolicySchema = Type.Object({
  id: Type.String(),
  status: Type.Union([Type.Literal('ACTIVE'), Type.Literal('EXPIRED')]),
});
export const PolicyParamsSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
});
export const CustomerResponseSchema = Type.Object({ customer: CustomerSchema });
export const SignInResponseSchema = Type.Object({
  customer: CustomerSchema,
  expiresInSeconds: Type.Integer(),
});
export const PoliciesResponseSchema = Type.Object({
  policies: Type.Array(PolicySchema),
});

export type CustomerDto = Static<typeof CustomerSchema>;
export type PolicyDto = Static<typeof PolicySchema>;
export type CustomerResponse = Static<typeof CustomerResponseSchema>;
export type SignInResponse = Static<typeof SignInResponseSchema>;
export type PoliciesResponse = Static<typeof PoliciesResponseSchema>;
