import type { ReactNode } from 'react';

type Status =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';

export function StatusBadge({
  status,
  pill = false,
  children,
}: {
  status: Status;
  pill?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`policy-status ${status.toLowerCase()}${pill ? ' pill' : ''}`}
    >
      {children}
    </span>
  );
}
