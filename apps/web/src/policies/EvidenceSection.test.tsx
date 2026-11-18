import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EvidenceSection } from './EvidenceSection';
import { useEvidence } from '../lib/queries';

vi.mock('../lib/queries', () => ({ useEvidence: vi.fn() }));
const show = (state: object) => {
  vi.mocked(useEvidence).mockReturnValue(
    state as ReturnType<typeof useEvidence>,
  );
  render(<EvidenceSection policyId="POL-NARIN-001" />);
};
describe('FR-04 evidence section', () => {
  it('shows loading while policy facts can remain on the page', () => {
    show({ isPending: true });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading policy evidence',
    );
  });
  it('shows source identity, excerpt and matching state', () => {
    show({
      isPending: false,
      isError: false,
      data: {
        evidence: {
          status: 'available',
          citations: [
            {
              documentId: 'DOC-FAMILY-001',
              version: '1.0.0',
              sectionId: 'dates',
              title: 'Family Protection Plan mock policy',
              excerpt: 'The effective date is 2025-01-01.',
            },
          ],
        },
      },
    });
    expect(screen.getByText('Matches policy facts.')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Document DOC-FAMILY-001 · Version 1.0.0 · Section dates/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The effective date is 2025-01-01.'),
    ).toBeInTheDocument();
  });
  it('shows an unresolved reason with retry', () => {
    const refetch = vi.fn();
    show({
      isPending: false,
      isError: false,
      data: {
        evidence: {
          status: 'unresolved',
          reason: 'conflicting',
          citations: [],
        },
      },
      refetch,
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      /conflicts with the policy facts/i,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence' }));
    expect(refetch).toHaveBeenCalledOnce();
  });
  it('shows service failure with retry and no verified claim', () => {
    const refetch = vi.fn();
    show({
      isPending: false,
      isError: true,
      error: new Error('API_UNAVAILABLE'),
      refetch,
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Policy evidence is temporarily unavailable',
    );
    expect(screen.queryByText('Matches policy facts.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledOnce();
  });
  it('shows session-ended sign-in action without protected text', () => {
    show({ isPending: false, isError: true, error: new Error('UNAUTHORIZED') });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your session has ended',
    );
    expect(screen.getByRole('link', { name: 'Sign in again' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.queryByText('Matches policy facts.')).not.toBeInTheDocument();
  });
});
