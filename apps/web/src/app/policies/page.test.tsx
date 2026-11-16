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
  it('focuses the visible route heading after navigation', () => {
    render(<PoliciesPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Your policies' }),
    ).toHaveFocus();
  });
});
