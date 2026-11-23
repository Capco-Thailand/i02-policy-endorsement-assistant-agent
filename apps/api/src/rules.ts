import {
  encodeRuleSection,
  RULE_ENCODER_VERSION,
} from '../../ai/rule-retrieval.js';
import { equalFact } from './evidence.js';

export type ChangeType =
  | 'BENEFICIARY'
  | 'ADDRESS'
  | 'PAYMENT_FREQUENCY'
  | 'ACCIDENTAL_DEATH_RIDER';
export type RuleSection = {
  sectionId: string;
  role: 'RULE' | 'GUIDANCE';
  text: string;
  value: { kind: string; [key: string]: unknown };
  encoderVersion?: string;
};
export type RuleSource = {
  sourceId: string;
  ruleId: string;
  version: number;
  productId: string;
  changeType: ChangeType;
  effectiveFrom: string;
  effectiveTo: string;
  sections: RuleSection[];
  encoderVersion?: string;
};

export function selectRules(sources: RuleSource[], date: string) {
  const applicable = sources.filter(
    (source) => source.effectiveFrom <= date && date <= source.effectiveTo,
  );
  if (!applicable.length)
    return {
      status: 'MISSING' as const,
      requiresHumanReferral: true,
      sourceIds: [],
      sources: [],
    };
  const highest = new Map<string, number>();
  for (const source of applicable)
    highest.set(
      source.ruleId,
      Math.max(highest.get(source.ruleId) ?? 0, source.version),
    );
  const selected = applicable.filter(
    (source) => source.version === highest.get(source.ruleId),
  );
  const sourceIds = selected.map((source) => source.sourceId).sort();
  const signatures = new Map<string, string>();
  for (const source of selected) {
    if (
      source.effectiveFrom > source.effectiveTo ||
      source.sections.some(
        (section) => !['RULE', 'GUIDANCE'].includes(section.role),
      )
    )
      return {
        status: 'CONFLICTING' as const,
        requiresHumanReferral: true,
        sourceIds,
        sources: [],
      };
    const signature = JSON.stringify(
      source.sections.map((section) => [section.role, section.value]).sort(),
    );
    const previous = signatures.get(source.ruleId);
    if (previous && previous !== signature)
      return {
        status: 'CONFLICTING' as const,
        requiresHumanReferral: true,
        sourceIds,
        sources: [],
      };
    signatures.set(source.ruleId, signature);
  }
  if (
    selected.some(
      (source) =>
        source.sections.filter((section) => section.role === 'RULE').length >
          1 ||
        source.sections.filter((section) => section.role === 'GUIDANCE')
          .length > 1,
    )
  )
    return {
      status: 'CONFLICTING' as const,
      requiresHumanReferral: true,
      sourceIds,
      sources: [],
    };
  if (
    selected.some(
      (source) =>
        !source.sections.some((section) => section.role === 'RULE') ||
        !source.sections.some((section) => section.role === 'GUIDANCE'),
    )
  )
    return {
      status: 'MISSING' as const,
      requiresHumanReferral: true,
      sourceIds,
      sources: [],
    };
  const conditions = new Map<string, RuleSection['value']>();
  let guidance: RuleSection['value'] | undefined;
  for (const source of selected) {
    for (const section of source.sections) {
      if (section.role === 'GUIDANCE') {
        if (guidance && !equalFact(guidance, section.value))
          return {
            status: 'CONFLICTING' as const,
            requiresHumanReferral: true,
            sourceIds,
            sources: [],
          };
        guidance = section.value;
      } else if (
        section.value.kind === 'CHECK' &&
        typeof section.value.field === 'string'
      ) {
        const previous = conditions.get(section.value.field);
        if (previous && !equalFact(previous, section.value))
          return {
            status: 'CONFLICTING' as const,
            requiresHumanReferral: true,
            sourceIds,
            sources: [],
          };
        conditions.set(section.value.field, section.value);
      }
    }
  }
  return {
    status: 'AVAILABLE' as const,
    requiresHumanReferral: selected.some((source) =>
      source.sections.some(
        (section) =>
          section.role === 'RULE' && section.value.kind === 'REFERRAL',
      ),
    ),
    sourceIds,
    sources: selected,
  };
}

export interface RuleStore {
  selectedRuleProduct(
    policyId: string,
  ): Promise<{ product_id: string; product_count: number } | undefined>;
  ruleSources(
    productId: string,
    changeType: ChangeType,
    date: string,
  ): Promise<RuleSource[]>;
  rankedRuleSections(
    sourceIds: string[],
    vector: number[],
    limit: number,
  ): Promise<
    {
      source_id: string;
      section_id: string;
      role: 'RULE' | 'GUIDANCE';
      text: string;
      value: { kind: string };
    }[]
  >;
}

export async function retrieveRules(
  store: RuleStore,
  policyId: string,
  changeType: ChangeType,
  date: string,
) {
  const product = await store.selectedRuleProduct(policyId);
  if (!product)
    return {
      status: 'MISSING' as const,
      requiresHumanReferral: true,
      sourceIds: [],
      citations: [],
      sourceVersions: [],
    };
  if (product.product_count !== 1)
    return {
      status: 'CONFLICTING' as const,
      requiresHumanReferral: true,
      sourceIds: [],
      citations: [],
      sourceVersions: [],
    };
  const candidates = await store.ruleSources(
    product.product_id,
    changeType,
    date,
  );
  if (candidates.length > 64) throw new Error('Rule source overflow');
  if (
    candidates.some(
      (source) =>
        source.encoderVersion !== RULE_ENCODER_VERSION ||
        source.sections.some(
          (section) => section.encoderVersion !== RULE_ENCODER_VERSION,
        ),
    )
  )
    return {
      status: 'MISSING' as const,
      requiresHumanReferral: true,
      sourceIds: candidates.map((source) => source.sourceId).sort(),
      citations: [],
      sourceVersions: candidates.map(({ sourceId, ruleId, version }) => ({
        sourceId,
        ruleId,
        version,
      })),
    };
  const selection = selectRules(candidates, date);
  if (selection.status !== 'AVAILABLE')
    return {
      status: selection.status,
      requiresHumanReferral: true,
      sourceIds: selection.sourceIds,
      citations: [],
      sourceVersions: candidates
        .filter((source) => selection.sourceIds.includes(source.sourceId))
        .map(({ sourceId, ruleId, version }) => ({
          sourceId,
          ruleId,
          version,
        })),
    };
  const sourceIds = selection.sourceIds;
  const ruleVector = encodeRuleSection(changeType, 'RULE');
  const guidanceVector = encodeRuleSection(changeType, 'GUIDANCE');
  const vector = ruleVector.map(
    (value, index) => value + guidanceVector[index],
  );
  const ranked = await store.rankedRuleSections(sourceIds, vector, 9);
  if (ranked.length > 8) throw new Error('Rule section overflow');
  const citations = ranked.map((section) => {
    const source = selection.sources.find(
      (item) => item.sourceId === section.source_id,
    );
    if (!source) throw new Error('Rule source mismatch');
    return {
      sourceId: source.sourceId,
      ruleId: source.ruleId,
      version: source.version,
      productId: source.productId,
      changeType: source.changeType,
      effectiveFrom: source.effectiveFrom,
      effectiveTo: source.effectiveTo,
      sectionId: section.section_id,
      role: section.role,
      text: section.text,
      value: section.value,
    };
  });
  if (
    citations.length !==
    selection.sources.reduce(
      (count, source) => count + source.sections.length,
      0,
    )
  )
    throw new Error('Rule section mismatch');
  return {
    status: 'AVAILABLE' as const,
    requiresHumanReferral: selection.requiresHumanReferral,
    sourceIds,
    citations,
    sourceVersions: selection.sources.map(({ sourceId, ruleId, version }) => ({
      sourceId,
      ruleId,
      version,
    })),
  };
}
