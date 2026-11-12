export type Customer = { id: string; displayName: string };
export type Policy = { id: string; status: 'ACTIVE' | 'EXPIRED' };
type PolicyRecord = Policy & { ownerId: string };

const policies: readonly PolicyRecord[] = [
  { id: 'SYN-POL-1001', status: 'ACTIVE', ownerId: 'demo-alice' },
  { id: 'SYN-POL-1002', status: 'EXPIRED', ownerId: 'demo-alice' },
  { id: 'SYN-POL-2001', status: 'ACTIVE', ownerId: 'demo-bob' },
];

export function assignedPolicies(customer: Customer): Policy[] {
  return policies
    .filter((policy) => policy.ownerId === customer.id)
    .map(({ id, status }) => ({ id, status }));
}

export function assignedPolicy(customer: Customer, id: string): Policy | null {
  const policy = policies.find(
    (entry) => entry.ownerId === customer.id && entry.id === id,
  );
  return policy ? { id: policy.id, status: policy.status } : null;
}

export type ProposalRecord = { id: string; ownerId: string; policyId: string };
export type LoadProposal = (id: string) => Promise<ProposalRecord | null>;

export async function authorizeProposalDecision(
  customer: Customer,
  proposalId: string,
  loadProposal: LoadProposal,
): Promise<boolean> {
  const proposal = await loadProposal(proposalId);
  return (
    proposal !== null &&
    proposal.id === proposalId &&
    proposal.ownerId === customer.id &&
    assignedPolicy(customer, proposal.policyId) !== null
  );
}
