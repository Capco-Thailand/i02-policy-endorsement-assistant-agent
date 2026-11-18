export type Topic = 'status' | 'dates' | 'payment' | 'beneficiaries';
export interface SourceSection {
  sectionId: string;
  topic: Topic;
  excerpt: string;
  fields: Record<string, unknown>;
}
export interface SourceDocument {
  documentId: string;
  version: string;
  title: string;
  productId: string;
  current: boolean;
  sections: SourceSection[];
}
const words: Record<Topic, string[]> = {
  status: ['status', 'active', 'expired'],
  dates: ['date', 'dates', 'effective', 'expiry', 'expire', 'start', 'end'],
  payment: ['payment', 'frequency', 'monthly', 'annual', 'premium'],
  beneficiaries: [
    'beneficiary',
    'beneficiaries',
    'allocation',
    'benefit',
    'who',
  ],
};
export function relevantSections(
  sections: SourceSection[],
  query: string,
): SourceSection[] {
  const terms = query.toLowerCase().match(/[a-z]+/g) ?? [];
  if (terms.length === 0) return sections.slice(0, 4);
  const scored = sections.map((section) => ({
    section,
    score: terms.reduce(
      (score, term) => score + Number(words[section.topic].includes(term)),
      0,
    ),
  }));
  const highest = Math.max(...scored.map((item) => item.score), 0);
  return highest === 0
    ? []
    : scored
        .filter((item) => item.score === highest)
        .slice(0, 3)
        .map((item) => item.section);
}
