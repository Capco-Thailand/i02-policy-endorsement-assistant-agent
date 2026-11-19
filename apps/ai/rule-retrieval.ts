import type { ChangeType, RuleSection } from '../api/src/rules.js';

export const RULE_ENCODER_VERSION = 'endorsement-rules-v1';
export const RULE_VECTOR_DIMENSIONS = 8;
const changes: ChangeType[] = [
  'BENEFICIARY',
  'ADDRESS',
  'PAYMENT_FREQUENCY',
  'ACCIDENTAL_DEATH_RIDER',
];

export function encodeRuleSection(
  changeType: ChangeType,
  role: RuleSection['role'],
): number[] {
  const vector = Array<number>(RULE_VECTOR_DIMENSIONS).fill(0);
  vector[changes.indexOf(changeType)] = 1;
  vector[role === 'RULE' ? 4 : 5] = 1;
  return vector;
}
