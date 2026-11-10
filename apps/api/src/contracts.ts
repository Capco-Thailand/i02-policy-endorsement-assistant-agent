import { Type, type Static } from '@sinclair/typebox';

export const ErrorResponse = Type.Object({ error: Type.String() });
export const Staff = Type.Object({
  id: Type.String(),
  displayName: Type.String()
});
export const Policy = Type.Object({
  id: Type.String(),
  status: Type.Union([Type.Literal('ACTIVE'), Type.Literal('EXPIRED')])
});
export const SignInBody = Type.Object({
  accountId: Type.String({ minLength: 1 }),
  password: Type.String({ minLength: 1 })
});
export const PoliciesResponse = Type.Object({ policies: Type.Array(Policy) });
export const PolicyParams = Type.Object({ id: Type.String() });
export type StaffDto = Static<typeof Staff>;
export type PolicyDto = Static<typeof Policy>;
export type PoliciesDto = Static<typeof PoliciesResponse>;
