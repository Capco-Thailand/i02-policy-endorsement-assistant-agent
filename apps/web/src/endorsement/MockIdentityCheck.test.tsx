import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MockIdentityCheck } from './MockIdentityCheck';
import { useMockIdentity } from '../lib/queries';

vi.mock('../lib/queries', () => ({ useMockIdentity: vi.fn() }));

it('labels a completed result as simulated and shows its reason', () => {
  const mutate = vi.fn();
  vi.mocked(useMockIdentity).mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    data: {
      status: 'FAILED',
      reason: 'ID_EXPIRED',
      disclosure:
        'Simulated identity check only. No real identity was verified.',
    },
  } as unknown as ReturnType<typeof useMockIdentity>);
  render(<MockIdentityCheck policyId="POL-NARIN-001" />);
  expect(screen.getByText(/Synthetic ID is expired/)).toBeInTheDocument();
  expect(screen.getByText(/No real identity was verified/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Synthetic scenario'), {
    target: { value: 'identity-mismatch' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Run mock check' }));
  expect(mutate).toHaveBeenCalledWith('identity-mismatch');
});
