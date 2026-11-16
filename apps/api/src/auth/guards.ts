import type { Customer, Policy } from './data.js';

export const ownsPolicy = (
  actor: Customer,
  policy: Policy | undefined,
): policy is Policy => Boolean(policy && policy.customerId === actor.id);

export interface Proposal {
  id: string;
  customerId: string;
  policyId: string;
}
export const mayDecideProposal = (
  actor: Customer,
  proposal: Proposal | undefined,
  policy: Policy | undefined,
): boolean =>
  Boolean(
    proposal &&
      policy &&
      proposal.policyId === policy.id &&
      proposal.customerId === actor.id &&
      ownsPolicy(actor, policy),
  );
