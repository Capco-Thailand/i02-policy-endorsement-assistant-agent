import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import PoliciesPage from './page';

vi.mock('../../auth/SessionGate', () => ({
  SessionGate: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('../../auth/SignOutButton', () => ({
  SignOutButton: () => <button>Sign out</button>,
}));
vi.mock('../../policies/PolicyList', () => ({
  PolicyList: () => <p>Policy list</p>,
}));

describe('FR-03 policy list page', () => {
  it('FR-16 explains authorized records and historical expired values', () => {
    render(<PoliciesPage />);
    expect(
      screen.getByText(
        'Only policies linked to this demo account appear here.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/expired policy values are historical/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Customer change history' }),
    ).toHaveAttribute('href', '/history');
    expect(
      screen.getByRole('button', { name: 'Sign out' }),
    ).toBeInTheDocument();
  });
  it('focuses the visible route heading after navigation', () => {
    render(<PoliciesPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Your policies' }),
    ).toHaveFocus();
  });
});
