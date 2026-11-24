import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ProposalReview } from './ProposalReview';
import type { Proposal } from '../lib/api';

it('FR-10 review shows exact quote, citations, and non-binding boundary', () => {
  render(
    <ProposalReview
      proposal={{
        id: 'PROP',
        requestId: 'REQ',
        requesterId: 'CUS',
        policyId: 'POL',
        status: 'PENDING_APPROVAL',
        binding: false,
        createdAt: '2026-11-24T00:00:00Z',
        requestedChange: {
          id: 'REQ',
          requesterId: 'CUS',
          policyId: 'POL',
          createdAt: '2026-11-24T00:00:00Z',
          changeType: 'PAYMENT_FREQUENCY',
          requestedEffectiveDate: '2027-01-01',
          paymentFrequency: 'ANNUAL',
        },
        current: {
          label: 'Synthetic',
          status: 'ACTIVE',
          effectiveDate: '2025-01-01',
          expiryDate: '2035-12-31',
          paymentFrequency: 'MONTHLY',
          beneficiaries: [],
          coverages: [],
        },
        citations: [
          {
            kind: 'POLICY',
            sourceId: 'WORDING',
            version: 'v3',
            sectionId: '6.4',
            excerpt: 'Frequency may change.',
          },
          {
            kind: 'RULE',
            sourceId: 'RULES',
            ruleId: 'RULE-1',
            version: 2,
            sectionId: '2',
          },
        ],
        impact: {
          status: 'CALCULATED',
          quote: {
            ratingVersion: 'synthetic-rating-v1',
            currency: 'THB',
            before: {
              frequency: 'MONTHLY',
              premiumPerInstallmentSatang: 121500,
              installmentsPerYear: 12,
              annualizedScheduledTotalSatang: 1458000,
              lifeBenefitBaht: 1000000,
              riderBenefitBaht: 250000,
            },
            after: {
              frequency: 'ANNUAL',
              premiumPerInstallmentSatang: 1350000,
              installmentsPerYear: 1,
              annualizedScheduledTotalSatang: 1350000,
              lifeBenefitBaht: 1000000,
              riderBenefitBaht: 250000,
            },
            difference: {
              premiumPerInstallmentSatang: 1228500,
              annualizedScheduledTotalSatang: -108000,
              lifeBenefitBaht: 0,
              riderBenefitBaht: 0,
            },
          },
        },
      }}
    />,
  );
  expect(screen.getAllByText(/THB 13,500.00/)).toHaveLength(2);
  expect(screen.getAllByText(/THB 1,000,000/)).toHaveLength(2);
  expect(screen.getAllByText(/THB 250,000/)).toHaveLength(2);
  expect(screen.getAllByText(/Unchanged/).length).toBeGreaterThanOrEqual(2);
  expect(screen.getByText(/WORDING.*v3.*6.4/)).toBeInTheDocument();
  expect(
    screen.getByText(/underlying policy and coverage stay unchanged/),
  ).toBeInTheDocument();
});

it('FR-10 unchanged review labels premium, schedule and benefits unchanged', () => {
  const proposal: Proposal = {
    id: 'PROP-2',
    requestId: 'REQ-2',
    requesterId: 'CUS',
    policyId: 'POL',
    status: 'PENDING_APPROVAL',
    binding: false,
    createdAt: '2026-11-24T00:00:00Z',
    requestedChange: {
      id: 'REQ-2',
      requesterId: 'CUS',
      policyId: 'POL',
      createdAt: '2026-11-24T00:00:00Z',
      changeType: 'ADDRESS',
      requestedEffectiveDate: '2027-01-01',
      correspondenceAddress: '100 Synthetic Road',
    },
    current: {
      label: 'Synthetic',
      status: 'ACTIVE',
      effectiveDate: '2025-01-01',
      expiryDate: '2035-12-31',
      paymentFrequency: 'MONTHLY',
      beneficiaries: [],
      coverages: [],
    },
    citations: [],
    impact: {
      status: 'UNCHANGED',
      premiumImpact: 'UNCHANGED',
      benefitImpact: 'UNCHANGED',
    },
  };
  render(<ProposalReview proposal={proposal} />);
  expect(screen.getByText('Premium: Unchanged')).toBeInTheDocument();
  expect(screen.getByText('Payment schedule: Unchanged')).toBeInTheDocument();
  expect(screen.getByText('Benefits: Unchanged')).toBeInTheDocument();
  expect(screen.getByText('100 Synthetic Road')).toBeInTheDocument();
});
