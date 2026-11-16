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
    label: 'Narin synthetic policy',
  },
  { id: 'POL-MALI-001', customerId: 'CUS-002', label: 'Mali synthetic policy' },
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
