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
  productTerms?: {
    insurer: string;
    type: string;
    name: string;
    version: string;
  } | null;
  coverageTerms?:
    | { id: string; name: string; amount: number; currency: string }[]
    | null;
  exclusionTerms?: { id: string; text: string }[] | null;
}
