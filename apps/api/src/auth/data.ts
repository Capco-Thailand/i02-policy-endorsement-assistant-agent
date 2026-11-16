import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export interface Customer {
  id: string;
  accountId: string;
  name: string;
  passwordHash: Buffer;
  salt: Buffer;
}
export interface Policy {
  id: string;
  customerId: string;
  label: string;
  status: 'ACTIVE' | 'EXPIRED';
  effectiveDate: string;
  expiryDate: string;
  paymentFrequency: 'MONTHLY' | 'ANNUAL';
  beneficiaries: { name: string; allocationPercent: number }[];
}

const seed = (
  id: string,
  accountId: string,
  name: string,
  password: string,
): Customer => {
  const salt = randomBytes(16);
  return {
    id,
    accountId,
    name,
    salt,
    passwordHash: scryptSync(password, salt, 64),
  };
};

export const customers = [
  seed('CUS-001', 'narin', 'Narin', 'NarinDemo123!'),
  seed('CUS-002', 'mali', 'Mali', 'MaliDemo123!'),
];

export const policies: Policy[] = [
  {
    id: 'POL-NARIN-001',
    customerId: 'CUS-001',
    label: 'Family Protection Plan',
    status: 'ACTIVE',
    effectiveDate: '2025-01-01',
    expiryDate: '2035-12-31',
    paymentFrequency: 'MONTHLY',
    beneficiaries: [
      { name: 'Arisa K.', allocationPercent: 60 },
      { name: 'Decha K.', allocationPercent: 40 },
    ],
  },
  {
    id: 'POL-MALI-001',
    customerId: 'CUS-002',
    label: 'Secure Future Plan',
    status: 'ACTIVE',
    effectiveDate: '2024-06-01',
    expiryDate: '2034-05-31',
    paymentFrequency: 'ANNUAL',
    beneficiaries: [{ name: 'Pim S.', allocationPercent: 100 }],
  },
  {
    id: 'POL-NARIN-002',
    customerId: 'CUS-001',
    label: 'Classic Life Plan',
    status: 'EXPIRED',
    effectiveDate: '2015-01-01',
    expiryDate: '2025-01-01',
    paymentFrequency: 'ANNUAL',
    beneficiaries: [{ name: 'Arisa K.', allocationPercent: 100 }],
  },
];

export function authenticate(
  accountId: string,
  password: string,
): Customer | undefined {
  const customer = customers.find((item) => item.accountId === accountId);
  const verifier = customer ?? customers[0];
  const supplied = scryptSync(password, verifier.salt, 64);
  return timingSafeEqual(supplied, verifier.passwordHash)
    ? customer
    : undefined;
}
