import { describe, expect, it } from 'vitest';
import { selectRules, type RuleSource } from './rules.js';

const source = (
  version: number,
  from: string,
  conditions = 'ALLOW',
): RuleSource => ({
  sourceId: `FAMILY_PROTECTION:BENEFICIARY:v${version}`,
  ruleId: 'FAMILY_PROTECTION:BENEFICIARY',
  version,
  productId: 'FAMILY_PROTECTION',
  changeType: 'BENEFICIARY',
  effectiveFrom: from,
  effectiveTo: '2035-12-31',
  sections: [
    {
      sectionId: 'rule',
      role: 'RULE',
      text: 'Synthetic beneficiary rule.',
      value: { kind: conditions },
    },
    {
      sectionId: 'guidance',
      role: 'GUIDANCE',
      text: 'No document required.',
      value: { kind: 'NONE' },
    },
  ],
});

describe('FR-05 rule selection', () => {
  it('C3 selects the highest applicable numeric version and preserves history', () => {
    const sources = [source(2, '2027-01-01'), source(10, '2028-01-01')];
    expect(selectRules(sources, '2027-06-01').sources[0]?.version).toBe(2);
    expect(selectRules(sources, '2029-01-01').sources[0]?.version).toBe(10);
  });

  it('C3/C4 detects incompatible current evidence and missing guidance', () => {
    const conflict = [
      source(2, '2027-01-01'),
      { ...source(2, '2027-01-01', 'REFERRAL'), sourceId: 'other' },
    ];
    expect(selectRules(conflict, '2028-01-01')).toMatchObject({
      status: 'CONFLICTING',
      requiresHumanReferral: true,
    });
    expect(
      selectRules(
        [
          {
            ...source(2, '2027-01-01'),
            sections: source(2, '2027-01-01').sections.slice(0, 1),
          },
        ],
        '2028-01-01',
      ),
    ).toMatchObject({ status: 'MISSING', requiresHumanReferral: true });
  });

  it('C4 treats contradictory guidance within one source as conflicting', () => {
    const item = source(1, '2025-01-01');
    item.sections.push({
      sectionId: 'other-guidance',
      role: 'GUIDANCE',
      text: 'Address proof required.',
      value: { kind: 'DOCUMENT' },
    });
    expect(selectRules([item], '2027-01-01').status).toBe('CONFLICTING');
  });

  it('C4 detects contradictory conditions and guidance across distinct active rule IDs', () => {
    const first = source(1, '2025-01-01');
    first.sections[0].value = {
      kind: 'CHECK',
      field: 'paymentFrequency',
      allowedValues: ['MONTHLY'],
    };
    const second = {
      ...source(1, '2025-01-01'),
      sourceId: 'another-rule:v1',
      ruleId: 'another-rule',
    };
    second.sections[0].value = {
      kind: 'CHECK',
      field: 'paymentFrequency',
      allowedValues: ['ANNUAL'],
    };
    second.sections[1].value = {
      kind: 'DOCUMENT',
      documentType: 'proof',
      handling: 'mock receipt only',
    };
    expect(selectRules([first, second], '2027-01-01')).toMatchObject({
      status: 'CONFLICTING',
      sourceIds: ['FAMILY_PROTECTION:BENEFICIARY:v1', 'another-rule:v1'],
    });
    second.sections[0].value = first.sections[0].value;
    expect(selectRules([first, second], '2027-01-01').status).toBe(
      'CONFLICTING',
    );
    second.sections[1].value = first.sections[1].value;
    expect(selectRules([first, second], '2027-01-01').status).toBe('AVAILABLE');
  });
});
