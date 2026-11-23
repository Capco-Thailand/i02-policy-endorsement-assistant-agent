import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
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
  it('C3/C5 selects authored v2 address guidance for current dates and v1 for historical dates', () => {
    const sources = ['endorsement-rules.json', 'endorsement-rules-v2.json']
      .flatMap(
        (name) =>
          JSON.parse(
            readFileSync(
              new URL(`../../ai/corpus/${name}`, import.meta.url),
              'utf8',
            ),
          ) as RuleSource[],
      )
      .filter(
        (item) =>
          item.productId === 'FAMILY_PROTECTION' &&
          item.changeType === 'ADDRESS',
      );
    expect(selectRules(sources, '2026-11-22').sources[0]?.version).toBe(1);
    const current = selectRules(sources, '2027-01-01');
    expect(current.sources[0]?.version).toBe(2);
    expect(
      current.sources[0]?.sections.find((item) => item.role === 'GUIDANCE')
        ?.value,
    ).toMatchObject({
      kind: 'DOCUMENT',
      handling: 'real-world follow-up only',
    });
    expect(JSON.stringify(current.sources)).not.toMatch(/mock receipt/i);
  });
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
