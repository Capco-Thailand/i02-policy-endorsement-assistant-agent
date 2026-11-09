export type PolicyStatus = 'ACTIVE' | 'EXPIRED';

export interface Beneficiary {
  beneficiary_id: string;
  full_name: string;
  relationship: string;
  allocation_percentage: number;
}

export interface Policy {
  policy_id: string;
  policy_number: string;
  policyholder_name: string;
  product_name: string;
  policy_status: PolicyStatus;
  sum_assured: string;
  annual_premium: string;
  effective_date: string;
  expiry_date: string | null;
  beneficiaries: Beneficiary[];
}

const usersByToken = new Map([
  ['demo-alice', 'user-alice'],
  ['demo-bob', 'user-bob'],
  ['demo-empty', 'user-empty'],
]);

const records: ReadonlyArray<{ owner: string; policy: Policy }> = [
  {
    owner: 'user-alice',
    policy: {
      policy_id: 'SYN-POL-1001', policy_number: 'LIFE-1001',
      policyholder_name: 'Alex Synthetic', product_name: 'Synthetic Life Protect',
      policy_status: 'ACTIVE', sum_assured: '1000000.00', annual_premium: '12000.00',
      effective_date: '2025-01-01', expiry_date: '2024-12-31',
      beneficiaries: [{ beneficiary_id: 'BEN-1', full_name: 'Taylor Synthetic', relationship: 'spouse', allocation_percentage: 100 }],
    },
  },
  {
    owner: 'user-alice',
    policy: {
      policy_id: 'SYN-POL-1002', policy_number: 'LIFE-1002',
      policyholder_name: 'Alex Synthetic', product_name: 'Synthetic Life Basic',
      policy_status: 'EXPIRED', sum_assured: '500000.00', annual_premium: '6000.00',
      effective_date: '2020-01-01', expiry_date: '2030-01-01', beneficiaries: [],
    },
  },
  {
    owner: 'user-bob',
    policy: {
      policy_id: 'SYN-POL-2001', policy_number: 'LIFE-2001',
      policyholder_name: 'Casey Synthetic', product_name: 'Synthetic Life Protect',
      policy_status: 'ACTIVE', sum_assured: '750000.00', annual_premium: '9000.00',
      effective_date: '2025-03-01', expiry_date: '2026-03-01', beneficiaries: [],
    },
  },
];

export function resolveDemoUser(authorization: string | undefined): string | undefined {
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) return undefined;
  return usersByToken.get(match[1]);
}

export function listPolicies(userId: string): Policy[] {
  return records.filter((record) => record.owner === userId).map(({ policy }) => policy);
}

export function findOwnedPolicy(userId: string, policyId: string): Policy | undefined {
  return records.find((record) => record.owner === userId && record.policy.policy_id === policyId)?.policy;
}
