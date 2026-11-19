import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EvidenceSection } from './EvidenceSection';
import { useEvidence } from '../lib/queries';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('../lib/queries', () => ({ useEvidence: vi.fn() }));

function show(state: object) {
  vi.mocked(useEvidence).mockReturnValue(
    state as ReturnType<typeof useEvidence>,
  );
  const client = new QueryClient();
  client.setQueryData(['policies'], { policies: [{ id: 'POL-NARIN-001' }] });
  const view = render(
    <QueryClientProvider client={client}>
      <EvidenceSection policyId="POL-NARIN-001" />
    </QueryClientProvider>,
  );
  return { client, ...view };
}

describe('FR-04 evidence section', () => {
  it('shows a cited synthetic source and a policy fact match', () => {
    show({
      isPending: false,
      isError: false,
      data: {
        status: 'available',
        match: 'Matches policy facts',
        citations: [
          {
            sourceId: 'POL-NARIN-001:v1',
            title: 'Family Protection Plan synthetic policy',
            version: 'v1',
            sectionId: 'dates',
            excerpt: 'Protection begins on 2025-01-01.',
          },
        ],
      },
    });
    expect(
      screen.getByRole('heading', { name: 'Synthetic policy evidence' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Matches policy facts')).toBeInTheDocument();
    expect(
      screen.getByText('Family Protection Plan synthetic policy'),
    ).toBeInTheDocument();
    expect(screen.getByText(/v1/)).toBeInTheDocument();
    expect(screen.getByText(/dates/)).toBeInTheDocument();
    expect(
      screen.getByText('Protection begins on 2025-01-01.'),
    ).toBeInTheDocument();
  });
  it('announces loading and unresolved states without a verified claim', () => {
    const { unmount } = show({ isPending: true });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading policy evidence…',
    );
    unmount();
    show({
      isPending: false,
      isError: false,
      data: {
        status: 'unresolved',
        reason: 'CONFLICTING_EVIDENCE',
        citations: [],
      },
    });
    expect(screen.getByRole('status')).toHaveTextContent(/conflict/i);
    expect(screen.queryByText('Matches policy facts')).not.toBeInTheDocument();
  });
  it('shows service failure and retries with a new request', () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence' }));
    expect(refetch).toHaveBeenCalledOnce();
  });
  it('clears protected evidence and sends an expired session to sign-in', async () => {
    replace.mockClear();
    const client = show({
      isPending: false,
      isError: true,
      error: new Error('UNAUTHORIZED'),
    });
    expect(screen.getByRole('alert')).toHaveTextContent(/session ended/i);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/?ended=1'));
    expect(client.client.getQueryData(['policies'])).toBeUndefined();
  });
});
