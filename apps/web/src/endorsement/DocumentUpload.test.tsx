import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DocumentUpload } from './DocumentUpload';
import { useDocumentUpload, useRules } from '../lib/queries';

vi.mock('../lib/queries', () => ({
  useRules: vi.fn(),
  useDocumentUpload: vi.fn(),
}));
const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const citation = {
  sourceId: 'synthetic-source',
  ruleId: 'RULE-ADDRESS',
  version: 3,
  productId: 'FAMILY_PROTECTION',
  changeType: 'ADDRESS',
  effectiveFrom: '2026-01-01',
  effectiveTo: '2028-01-01',
  sectionId: 'documents',
  role: 'GUIDANCE',
  text: 'Use synthetic address evidence.',
  value: {
    kind: 'DOCUMENT',
    documentType: 'address evidence',
    handling: 'mock receipt only',
  },
};
const renderUpload = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DocumentUpload
        policyId="POL-1"
        requestId="REQ-1"
        changeType="ADDRESS"
        requestedEffectiveDate="2027-01-01"
      />
    </QueryClientProvider>,
  );

it('shows dated FR-05 document guidance and source citation', () => {
  vi.mocked(useDocumentUpload).mockReturnValue({
    data: null,
    isPending: false,
    isError: false,
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof useDocumentUpload>);
  vi.mocked(useRules).mockReturnValue({
    isPending: false,
    isError: false,
    data: { status: 'AVAILABLE', citations: [citation] },
  } as unknown as ReturnType<typeof useRules>);
  renderUpload();
  expect(useRules).toHaveBeenCalledWith('POL-1', 'ADDRESS', '2027-01-01');
  expect(
    screen.getByText(/Use synthetic address evidence/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/synthetic-source.*version 3.*documents/),
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/Example guidance from a synthetic fixture/),
  ).not.toBeInTheDocument();
});

it('states cited NONE explicitly while leaving mock upload available', () => {
  vi.mocked(useDocumentUpload).mockReturnValue({
    data: null,
    isPending: false,
    isError: false,
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof useDocumentUpload>);
  vi.mocked(useRules).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      status: 'AVAILABLE',
      citations: [
        {
          ...citation,
          text: 'No document is needed for this change.',
          value: { kind: 'NONE' },
        },
      ],
    },
  } as unknown as ReturnType<typeof useRules>);
  renderUpload();
  expect(
    screen.getByText(/No document required: No document is needed/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/synthetic-source.*version 3.*documents/),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Upload synthetic file' }),
  ).toBeDisabled();
});

it.each(['MISSING', 'CONFLICTING', 'AVAILABLE'] as const)(
  'keeps %s without cited guidance unresolved',
  (status) => {
    vi.mocked(useDocumentUpload).mockReturnValue({
      data: null,
      isPending: false,
      isError: false,
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useDocumentUpload>);
    vi.mocked(useRules).mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        status,
        citations:
          status === 'AVAILABLE' ? [{ ...citation, role: 'RULE' }] : [],
      },
    } as unknown as ReturnType<typeof useRules>);
    renderUpload();
    expect(
      screen.getByText(/Document guidance is unresolved/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Use synthetic address evidence/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/synthetic fixture/)).not.toBeInTheDocument();
  },
);

it('keeps the mock receipt independent of a guidance service failure', () => {
  const mutate = vi.fn();
  vi.mocked(useDocumentUpload).mockReturnValue({
    data: null,
    isPending: false,
    isError: false,
    mutate,
  } as unknown as ReturnType<typeof useDocumentUpload>);
  const refetch = vi.fn();
  vi.mocked(useRules).mockReturnValue({
    isPending: false,
    isError: true,
    error: new Error('API_UNAVAILABLE'),
    refetch,
  } as unknown as ReturnType<typeof useRules>);
  renderUpload();
  expect(
    screen.getByText(/Document guidance is unresolved/),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry guidance' }));
  expect(refetch).toHaveBeenCalled();
  const file = new File(['synthetic'], 'sample.pdf', {
    type: 'application/pdf',
  });
  fireEvent.change(screen.getByLabelText(/Synthetic document/), {
    target: { files: [file] },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Upload synthetic file' }),
  );
  expect(mutate).toHaveBeenCalledWith({ requestId: 'REQ-1', file });
  expect(
    screen.getByText(/does not check whether the file meets any requirement/),
  ).toBeInTheDocument();
});

it('suppresses cached available guidance after a failed refetch', () => {
  vi.mocked(useDocumentUpload).mockReturnValue({
    data: null,
    isPending: false,
    isError: false,
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof useDocumentUpload>);
  vi.mocked(useRules).mockReturnValue({
    isPending: false,
    isError: true,
    error: new Error('API_UNAVAILABLE'),
    data: { status: 'AVAILABLE', citations: [citation] },
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useRules>);
  renderUpload();
  expect(
    screen.getByText(/Document guidance is unresolved/),
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/Use synthetic address evidence/),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(/synthetic-source.*version 3/),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Retry guidance' }),
  ).toBeInTheDocument();
});

it('does not show guidance or upload for an unavailable policy', () => {
  vi.mocked(useDocumentUpload).mockReturnValue({
    data: null,
  } as unknown as ReturnType<typeof useDocumentUpload>);
  vi.mocked(useRules).mockReturnValue({
    isPending: false,
    isError: true,
    error: new Error('NOT_FOUND'),
  } as unknown as ReturnType<typeof useRules>);
  renderUpload();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'This policy is unavailable.',
  );
  expect(
    screen.queryByRole('button', { name: 'Upload synthetic file' }),
  ).not.toBeInTheDocument();
});

it('follows sign-in handling when the rules session ends', () => {
  replace.mockClear();
  vi.mocked(useDocumentUpload).mockReturnValue({
    data: null,
  } as unknown as ReturnType<typeof useDocumentUpload>);
  vi.mocked(useRules).mockReturnValue({
    isPending: false,
    isError: true,
    error: new Error('UNAUTHORIZED'),
  } as unknown as ReturnType<typeof useRules>);
  renderUpload();
  expect(replace).toHaveBeenCalledWith('/?ended=1');
  expect(
    screen.queryByRole('button', { name: 'Upload synthetic file' }),
  ).not.toBeInTheDocument();
});

it('keeps the received mock disclosure visible with unresolved guidance', () => {
  vi.mocked(useDocumentUpload).mockReturnValue({
    data: {
      status: 'RECEIVED_MOCK',
      explanation:
        'File received for demonstration only. Content and suitability were not verified.',
    },
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useDocumentUpload>);
  vi.mocked(useRules).mockReturnValue({
    isPending: false,
    isError: false,
    data: { status: 'CONFLICTING', citations: [] },
  } as unknown as ReturnType<typeof useRules>);
  renderUpload();
  expect(
    screen.getByText(/Document guidance is unresolved/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Content and suitability were not verified/),
  ).toBeInTheDocument();
  expect(screen.getByText(/RECEIVED_MOCK/)).toBeInTheDocument();
});
