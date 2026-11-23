import { afterEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EligibilityCheck } from './EligibilityCheck';
import { useEligibilityCheck } from '../lib/queries';

vi.mock('../lib/queries', () => ({ useEligibilityCheck: vi.fn() }));
const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
afterEach(() => vi.clearAllMocks());
const renderCheck = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <EligibilityCheck policyId="POL" requestId="REQ" />
    </QueryClientProvider>,
  );
const state = (patch: Record<string, unknown>) =>
  vi.mocked(useEligibilityCheck).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    data: undefined,
    ...patch,
  } as unknown as ReturnType<typeof useEligibilityCheck>);

it('FR-08 UI: starts idle and runs a check for the recorded request', () => {
  const mutate = vi.fn();
  vi.mocked(useEligibilityCheck).mockReturnValue({
    mutate,
    isPending: false,
    data: undefined,
    isError: false,
  } as unknown as ReturnType<typeof useEligibilityCheck>);
  renderCheck();
  expect(screen.getByText(/Not checked yet/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Check eligibility' }));
  expect(mutate).toHaveBeenCalled();
});

it('FR-08 UI: pending check disables duplicate action', () => {
  state({ isPending: true });
  renderCheck();
  expect(
    screen.getByRole('button', { name: /Checking this request/ }),
  ).toBeDisabled();
});
it.each([
  ['ELIGIBLE', 'Eligible to continue to a mock quote'],
  ['INELIGIBLE', 'Cannot continue yet'],
  ['REFERRED', 'Needs human review'],
])(
  'FR-08 UI: %s result shows reason, citation, next step and mock disclosure',
  (outcome, heading) => {
    state({
      data: {
        outcome,
        reasonCodes: ['EXAMPLE'],
        reasons: ['Safe reason'],
        nextStep: 'Next step',
        sourceIds: ['SRC'],
        citations: [
          { sourceId: 'SRC', ruleId: 'RULE', version: 1, sectionId: 'S' },
        ],
      },
    });
    renderCheck();
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('Safe reason');
    expect(screen.getByText('Next step')).toBeInTheDocument();
    expect(
      screen.getByText(/Source SRC.*rule RULE.*version 1.*section S/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not verify document suitability/),
    ).toBeInTheDocument();
  },
);
it('FR-08 UI: service failure hides prior result and leaves retry available', () => {
  state({
    isError: true,
    error: new Error('API_UNAVAILABLE'),
    data: { outcome: 'ELIGIBLE' },
  });
  renderCheck();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Could not complete the check',
  );
  expect(
    screen.queryByRole('heading', {
      name: 'Eligible to continue to a mock quote',
    }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Check eligibility' }),
  ).toBeEnabled();
});
it('FR-08 UI: unavailable request has one non-disclosing message', () => {
  state({ isError: true, error: new Error('NOT_FOUND') });
  renderCheck();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'This request is unavailable.',
  );
});

it('FR-08 UI: referral shows safe source IDs when no citation is available', () => {
  state({
    data: {
      outcome: 'REFERRED',
      reasonCodes: ['RULE_CONFLICTING'],
      reasons: ['Rules need human review.'],
      nextStep: 'Wait for review.',
      sourceIds: ['SYNTHETIC:SRC'],
      citations: [],
    },
  });
  renderCheck();
  expect(screen.getByText(/Source SYNTHETIC:SRC/)).toBeInTheDocument();
});

it('FR-08 UI: an expired session redirects to sign-in without showing a result', async () => {
  state({
    isError: true,
    error: new Error('UNAUTHORIZED'),
    data: { outcome: 'ELIGIBLE' },
  });
  renderCheck();
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/?ended=1'));
  expect(screen.queryByText(/Eligible to continue/)).not.toBeInTheDocument();
});

it('FR-08 UI: missing receipt links directly to this request upload section', () => {
  state({
    data: {
      outcome: 'INELIGIBLE',
      reasonCodes: ['MISSING_RECEIPT'],
      reasons: ['Upload a synthetic file for this request.'],
      nextStep: 'Upload a synthetic file, then check again.',
      sourceIds: [],
      citations: [],
    },
  });
  renderCheck();
  expect(
    screen.getByRole('link', { name: 'Go to mock document upload' }),
  ).toHaveAttribute('href', '#document-upload-heading');
});
