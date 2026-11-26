import { expect, it, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RequestForm } from './RequestForm';
import {
  usePolicy,
  useCreateRequest,
  useEligibilityCheck,
} from '../lib/queries';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock('../lib/queries', () => ({
  usePolicy: vi.fn(),
  useCreateRequest: vi.fn(),
  useEligibilityCheck: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    data: undefined,
  })),
}));

it('shows four change choices and only selected fields for an active policy', () => {
  vi.mocked(usePolicy).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      policy: {
        id: 'POL-NARIN-001',
        label: 'Family Protection Plan',
        status: 'ACTIVE',
        effectiveDate: '2025-01-01',
        expiryDate: '2035-12-31',
        paymentFrequency: 'MONTHLY',
        beneficiaries: [],
      },
    },
  } as unknown as ReturnType<typeof usePolicy>);
  vi.mocked(useCreateRequest).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useCreateRequest>);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RequestForm policyId="POL-NARIN-001" />
    </QueryClientProvider>,
  );
  expect(screen.getByText(/POL-NARIN-001/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Record request' })).toBeDisabled();
  const choices = screen.getByRole('combobox', { name: 'Change type' });
  expect(choices.querySelectorAll('option')).toHaveLength(5);
  fireEvent.change(choices, { target: { value: 'BENEFICIARY' } });
  expect(screen.getByText('Replacement beneficiaries')).toHaveFocus();
  expect(
    screen.getByRole('textbox', { name: 'Beneficiary name 1' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('textbox', { name: 'Correspondence address' }),
  ).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Requested effective date'), {
    target: { value: '2026-12-01' },
  });
  expect(screen.getByRole('button', { name: 'Record request' })).toBeDisabled();
  expect(
    screen.getByText(/Allocations must total exactly 100%/),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Add beneficiary' }));
  const secondName = screen.getByRole('textbox', {
    name: 'Beneficiary name 2',
  });
  fireEvent.change(secondName, { target: { value: 'Sam' } });
  fireEvent.click(screen.getByRole('button', { name: 'Remove beneficiary 1' }));
  expect(screen.getByRole('textbox', { name: 'Beneficiary name 1' })).toBe(
    secondName,
  );
  expect(secondName).toHaveValue('Sam');
  fireEvent.change(choices, { target: { value: 'PAYMENT_FREQUENCY' } });
  expect(screen.getByRole('button', { name: 'Record request' })).toBeEnabled();
  fireEvent.change(screen.getByLabelText('Requested effective date'), {
    target: { value: '' },
  });
  expect(screen.getByRole('button', { name: 'Record request' })).toBeDisabled();
});

it('FR-17 current values: shows only authorized context for all four changes', () => {
  vi.mocked(usePolicy).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      policy: {
        id: 'POL-NARIN-001',
        label: 'Family Protection Plan',
        status: 'ACTIVE',
        effectiveDate: '2025-01-01',
        expiryDate: '2035-12-31',
        paymentFrequency: 'MONTHLY',
        beneficiaries: [
          { name: 'Arisa K.', allocationPercent: 60 },
          { name: 'Ben K.', allocationPercent: 40 },
        ],
        terms: {
          coverages: [
            {
              id: 'coverage.accidental-death',
              status: 'confirmed',
              value: {
                name: 'Accidental death benefit',
                amount: 250000,
                currency: 'THB',
              },
              citation: {
                sourceId: 'WORDING',
                title: 'Policy',
                version: 'v1',
                sectionId: 'coverage.accidental-death',
                excerpt: 'Benefit',
              },
            },
          ],
          exclusions: [],
          product: { status: 'unresolved', reason: 'MISSING_SECTION' },
        },
      },
    },
  } as unknown as ReturnType<typeof usePolicy>);
  vi.mocked(useCreateRequest).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useCreateRequest>);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RequestForm policyId="POL-NARIN-001" />
    </QueryClientProvider>,
  );
  const choices = screen.getByRole('combobox', { name: 'Change type' });
  fireEvent.change(choices, { target: { value: 'BENEFICIARY' } });
  expect(screen.getByText(/Arisa K. · 60%/)).toBeInTheDocument();
  expect(screen.getByText(/Ben K. · 40%/)).toBeInTheDocument();
  fireEvent.change(choices, { target: { value: 'ADDRESS' } });
  expect(
    screen.getByText('Not available in this policy record.'),
  ).toBeInTheDocument();
  fireEvent.change(choices, { target: { value: 'PAYMENT_FREQUENCY' } });
  expect(
    within(screen.getByRole('region', { name: 'Current policy' })).getByText(
      'Monthly',
    ),
  ).toBeInTheDocument();
  fireEvent.change(choices, { target: { value: 'ACCIDENTAL_DEATH_RIDER' } });
  expect(
    screen.getByText(/Accidental death benefit · THB 250,000/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Current rider on\/off state is not supplied/),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /View cited policy term/ }),
  ).toHaveAttribute(
    'href',
    '/policies/POL-NARIN-001#source-coverage-accidental-death',
  );
});

it('keeps entered address on service failure and confirms only a recorded pending request', async () => {
  vi.mocked(usePolicy).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      policy: {
        id: 'POL-NARIN-001',
        label: 'Family Protection Plan',
        status: 'ACTIVE',
        effectiveDate: '2025-01-01',
        expiryDate: '2035-12-31',
        paymentFrequency: 'MONTHLY',
        beneficiaries: [],
      },
    },
  } as unknown as ReturnType<typeof usePolicy>);
  const mutateAsync = vi
    .fn()
    .mockRejectedValueOnce(new Error('API_UNAVAILABLE'))
    .mockResolvedValueOnce({
      request: {
        id: 'REQ-1',
        changeType: 'ADDRESS',
        requestedEffectiveDate: '2026-12-01',
        correspondenceAddress: '123 Demo Road',
      },
    });
  vi.mocked(useCreateRequest).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useCreateRequest>);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RequestForm policyId="POL-NARIN-001" />
    </QueryClientProvider>,
  );
  fireEvent.change(screen.getByRole('combobox', { name: 'Change type' }), {
    target: { value: 'ADDRESS' },
  });
  expect(screen.getByRole('button', { name: 'Record request' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Requested effective date'), {
    target: { value: '2026-12-01' },
  });
  expect(screen.getByRole('button', { name: 'Record request' })).toBeDisabled();
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Correspondence address' }),
    { target: { value: '123 Demo Road' } },
  );
  expect(screen.getByRole('button', { name: 'Record request' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Record request' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Could not record request. Try again.',
  );
  expect(
    screen.getByRole('textbox', { name: 'Correspondence address' }),
  ).toHaveValue('123 Demo Road');
  fireEvent.click(screen.getByRole('button', { name: 'Record request' }));
  expect(
    await screen.findByRole('heading', {
      name: 'Your request was recorded',
    }),
  ).toBeInTheDocument();
  await waitFor(() =>
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Your request was recorded',
      }),
    ).toHaveFocus(),
  );
  expect(screen.getByRole('status')).toHaveTextContent(
    /did not approve a change or alter your policy or coverage/,
  );
  expect(
    screen.getByText(/Correspondence address · 123 Demo Road/),
  ).toBeInTheDocument();
  expect(screen.getByText('1 December 2026')).toBeInTheDocument();
  expect(screen.getByText('Pending checks')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(/Request REQ-1/);
  expect(
    screen.getByText(
      'Your change is saved. Check whether it can continue to a proposal.',
    ),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'Mock document upload' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Upload synthetic file' }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Check eligibility' }),
  ).toBeEnabled();
  expect(mutateAsync).toHaveBeenCalledTimes(2);
});

it('blocks expired policy entry', () => {
  vi.mocked(usePolicy).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      policy: {
        id: 'POL-NARIN-002',
        label: 'Classic Life Plan',
        status: 'EXPIRED',
        effectiveDate: '2015-01-01',
        expiryDate: '2025-01-01',
        paymentFrequency: 'ANNUAL',
        beneficiaries: [],
      },
    },
  } as unknown as ReturnType<typeof usePolicy>);
  vi.mocked(useCreateRequest).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useCreateRequest>);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RequestForm policyId="POL-NARIN-002" />
    </QueryClientProvider>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent(/expired/i);
  expect(
    screen.queryByRole('button', { name: 'Record request' }),
  ).not.toBeInTheDocument();
});

it('requires replacement beneficiaries to total exactly 100 before submission', async () => {
  vi.mocked(usePolicy).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      policy: {
        id: 'POL-NARIN-001',
        label: 'Family Protection Plan',
        status: 'ACTIVE',
        effectiveDate: '2025-01-01',
        expiryDate: '2035-12-31',
        paymentFrequency: 'MONTHLY',
        beneficiaries: [],
      },
    },
  } as unknown as ReturnType<typeof usePolicy>);
  const mutateAsync = vi.fn();
  vi.mocked(useCreateRequest).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useCreateRequest>);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RequestForm policyId="POL-NARIN-001" />
    </QueryClientProvider>,
  );
  fireEvent.change(screen.getByRole('combobox', { name: 'Change type' }), {
    target: { value: 'BENEFICIARY' },
  });
  fireEvent.change(screen.getByLabelText('Requested effective date'), {
    target: { value: '2026-12-01' },
  });
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Beneficiary name 1' }),
    { target: { value: 'Alex' } },
  );
  fireEvent.change(
    screen.getByRole('spinbutton', { name: 'Allocation percent 1' }),
    { target: { value: '99.9999999999' } },
  );
  expect(
    screen.getByText(/Total allocation: 99.9999999999%/),
  ).toBeInTheDocument();
  expect(screen.getByText('Under 100%')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Record request' })).toBeDisabled();
  fireEvent.change(
    screen.getByRole('spinbutton', { name: 'Allocation percent 1' }),
    { target: { value: '100' } },
  );
  expect(screen.getByText('Exactly 100%')).toBeInTheDocument();
  fireEvent.change(
    screen.getByRole('spinbutton', { name: 'Allocation percent 1' }),
    { target: { value: '101' } },
  );
  expect(screen.getByText('Over 100%')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Record request' })).toBeDisabled();
  fireEvent.change(
    screen.getByRole('spinbutton', { name: 'Allocation percent 1' }),
    { target: { value: '100' } },
  );
  expect(screen.getByRole('button', { name: 'Record request' })).toBeEnabled();
  expect(mutateAsync).not.toHaveBeenCalled();
  expect(
    screen.getByRole('textbox', { name: 'Beneficiary name 1' }),
  ).toHaveValue('Alex');
});

it('removes the form if the policy expires before submission finishes', async () => {
  vi.mocked(usePolicy).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      policy: {
        id: 'POL-NARIN-001',
        label: 'Family Protection Plan',
        status: 'ACTIVE',
        effectiveDate: '2025-01-01',
        expiryDate: '2035-12-31',
        paymentFrequency: 'MONTHLY',
        beneficiaries: [],
      },
    },
  } as unknown as ReturnType<typeof usePolicy>);
  vi.mocked(useCreateRequest).mockReturnValue({
    mutateAsync: vi.fn().mockRejectedValue(new Error('POLICY_EXPIRED')),
    isPending: false,
  } as unknown as ReturnType<typeof useCreateRequest>);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RequestForm policyId="POL-NARIN-001" />
    </QueryClientProvider>,
  );
  fireEvent.change(screen.getByRole('combobox', { name: 'Change type' }), {
    target: { value: 'ADDRESS' },
  });
  fireEvent.change(screen.getByLabelText('Requested effective date'), {
    target: { value: '2026-12-01' },
  });
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Correspondence address' }),
    { target: { value: '123 Demo Road' } },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Record request' }));
  expect(await screen.findByText(/This policy is expired/)).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Record request' }),
  ).not.toBeInTheDocument();
});

it('submits only once while a request is pending', () => {
  vi.mocked(usePolicy).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      policy: {
        id: 'POL-NARIN-001',
        label: 'Family Protection Plan',
        status: 'ACTIVE',
        effectiveDate: '2025-01-01',
        expiryDate: '2035-12-31',
        paymentFrequency: 'MONTHLY',
        beneficiaries: [],
      },
    },
  } as unknown as ReturnType<typeof usePolicy>);
  const mutateAsync = vi.fn(() => new Promise(() => {}));
  vi.mocked(useCreateRequest).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useCreateRequest>);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RequestForm policyId="POL-NARIN-001" />
    </QueryClientProvider>,
  );
  fireEvent.change(screen.getByRole('combobox', { name: 'Change type' }), {
    target: { value: 'ADDRESS' },
  });
  fireEvent.change(screen.getByLabelText('Requested effective date'), {
    target: { value: '2026-12-01' },
  });
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Correspondence address' }),
    { target: { value: '123 Demo Road' } },
  );
  const submit = screen.getByRole('button', { name: 'Record request' });
  fireEvent.click(submit);
  fireEvent.click(submit);
  expect(mutateAsync).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('status')).toHaveTextContent('Recording request');
});
