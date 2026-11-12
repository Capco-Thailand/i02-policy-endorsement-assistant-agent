import Link from 'next/link';
import type { CustomerDto } from '@pea/api/contracts';
import { SignOutButton } from './SignOutButton';

export function ProtectedHeader({ customer }: { customer: CustomerDto }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/policies">
        <span aria-hidden="true" className="brand-mark">
          PEA
        </span>
        <span>
          Policy Endorsement Assistant
          <small>Synthetic policy demo</small>
        </span>
      </Link>
      <div className="account-control">
        <span>{customer.displayName}</span>
        <SignOutButton />
      </div>
    </header>
  );
}
