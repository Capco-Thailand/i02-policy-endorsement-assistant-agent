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
