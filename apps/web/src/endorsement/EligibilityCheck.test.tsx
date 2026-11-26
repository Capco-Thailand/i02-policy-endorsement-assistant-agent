import { afterEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EligibilityCheck } from './EligibilityCheck';
import { useEligibilityCheck } from '../lib/queries';

vi.mock('../lib/queries', () => ({
  useEligibilityCheck: vi.fn(),
  usePrepareProposal: () => ({
    isPending: false,
    isError: false,
    mutateAsync: vi.fn(),
  }),
}));
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
  ['CAN_PROCEED', 'Can proceed to a proposal'],
  ['CANNOT_PROCEED', 'Cannot proceed'],
  ['NEEDS_REVIEW', 'Needs review'],
])(
  'FR-19 assessment: %s shows reason and next step without source details',
  (outcome, heading) => {
    state({
      data: {
        outcome,
        reasonCodes: ['EXAMPLE'],
        reasons: ['Safe reason'],
        nextStep: 'Next step',
        sourceIds: ['SRC'],
        citations: [
          {
            kind: 'POLICY',
            sourceId: 'WORDING',
            version: 'v1',
            sectionId: 'P',
            excerpt: 'Policy is active.',
          },
          {
            kind: 'RULE',
            sourceId: 'SRC',
            ruleId: 'RULE',
            version: 1,
            sectionId: 'S',
          },
        ],
      },
    });
    renderCheck();
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('Safe reason');
    expect(screen.getByText('Next step')).toBeInTheDocument();
    expect(screen.queryByText('Available sources')).not.toBeInTheDocument();
    expect(screen.queryByText(/Rule SRC.*version 1/)).not.toBeInTheDocument();
    expect(
      screen.getByText(/No policy coverage has changed/),
    ).toBeInTheDocument();
  },
);
it('FR-08 UI: service failure hides prior result and leaves retry available', () => {
  state({
    isError: true,
    error: new Error('API_UNAVAILABLE'),
    data: { outcome: 'CAN_PROCEED' },
  });
  renderCheck();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Could not complete the check',
  );
  expect(
    screen.queryByRole('heading', {
      name: 'Can proceed to a proposal',
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

it('FR-08 UI: invalid recorded request shows a distinct non-positive state', () => {
  state({ isError: true, error: new Error('INVALID_REQUEST') });
  renderCheck();
  expect(screen.getByRole('alert')).toHaveTextContent('cannot be checked');
  expect(
    screen.queryByText('Can proceed to a proposal'),
  ).not.toBeInTheDocument();
});

it('FR-08 UI: referral shows safe source IDs when no citation is available', () => {
  state({
    data: {
      outcome: 'NEEDS_REVIEW',
      reasonCodes: ['RULE_CONFLICTING'],
      reasons: ['Rules need human review.'],
      nextStep: 'Wait for review.',
      sourceIds: ['SYNTHETIC:SRC'],
      citations: [],
    },
  });
  renderCheck();
  expect(
    screen.queryByText(/Unresolved source SYNTHETIC:SRC/),
  ).not.toBeInTheDocument();
});

it('FR-17 unresolved sources: identifies missing source even when another rule is cited', () => {
  state({
    data: {
      outcome: 'NEEDS_REVIEW',
      reasonCodes: ['RULE_CONFLICTING'],
      reasons: ['Rules conflict.'],
      nextStep: 'Wait for human review.',
      sourceIds: ['RULE:AVAILABLE', 'RULE:MISSING'],
      citations: [
        {
          kind: 'RULE',
          sourceId: 'RULE:AVAILABLE',
          ruleId: 'R1',
          version: 1,
          sectionId: 'S1',
        },
      ],
    },
  });
  renderCheck();
  expect(
    screen.queryByText(/Unresolved source RULE:MISSING/),
  ).not.toBeInTheDocument();
  expect(screen.getByText('Reason')).toBeInTheDocument();
  expect(screen.getByText('Next action')).toBeInTheDocument();
});

it('FR-08 UI: an expired session redirects to sign-in without showing a result', async () => {
  state({
    isError: true,
    error: new Error('UNAUTHORIZED'),
    data: { outcome: 'CAN_PROCEED' },
  });
  renderCheck();
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/?ended=1'));
  expect(
    screen.queryByText(/Can proceed to a proposal/),
  ).not.toBeInTheDocument();
});

it('FR-08 UI: assessment has no upload guidance or receipt message', () => {
  state({
    data: {
      outcome: 'CAN_PROCEED',
      reasonCodes: [],
      reasons: [],
      nextStep: 'Continue',
      sourceIds: [],
      citations: [],
    },
  });
  renderCheck();
  expect(screen.queryByText(/receipt|upload/i)).not.toBeInTheDocument();
  expect(
    screen.getByText('No blocking reasons were returned for this request.'),
  ).toBeInTheDocument();
});
