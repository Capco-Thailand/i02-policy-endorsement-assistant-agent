import type { PolicyDto, StaffDto } from './contracts.js';

type PolicyRecord = PolicyDto & { assignedStaffIds: readonly string[] };

const policies: readonly PolicyRecord[] = [
  { id: 'SYN-POL-1001', status: 'ACTIVE', assignedStaffIds: ['demo-alice', 'demo-bob'] },
  { id: 'SYN-POL-1002', status: 'EXPIRED', assignedStaffIds: ['demo-alice'] },
  { id: 'SYN-POL-2001', status: 'ACTIVE', assignedStaffIds: ['demo-bob'] }
];

export function assignedPolicies(actor: StaffDto): PolicyDto[] {
  return policies.filter((policy) => policy.assignedStaffIds.includes(actor.id)).map(({ id, status }) => ({ id, status }));
}

export function assignedPolicy(actor: StaffDto, id: string): PolicyDto | null {
  return assignedPolicies(actor).find((policy) => policy.id === id) ?? null;
}

export function canReviewDraft(actor: StaffDto, policyId: string, creatorId: string): boolean {
  return assignedPolicy(actor, policyId) !== null && actor.id !== creatorId;
}
