export const ENCODER_VERSION = 'policy-concepts-v1';
export const VECTOR_DIMENSIONS = 8;
export type Concept =
  | 'status'
  | 'dates'
  | 'payment'
  | 'beneficiaries'
  | 'product'
  | 'coverage'
  | 'exclusions';
type QueryConcept = 'status' | 'dates' | 'payment' | 'beneficiaries';

const patterns: Record<QueryConcept, RegExp> = {
  status: /\b(status|active|expired|in force|valid|lapsed)\b/i,
  dates:
    /\b(date\w*|start\w*|begin\w*|began|commenc\w*|effective|expir(?:y|e|es|ing|ation)|end(?:s|ed|ing)?|protection begin|coverage begin)\b/i,
  payment:
    /\b(pay(?:ment|ments|ing|s)?|paid|premium\w*|monthly|annual\w*|frequency|billing|instalment)\b/i,
  beneficiaries: /\b(beneficiar\w*|receiv\w*|recipient\w*)\b/i,
};

const vectors: Record<Concept, number[]> = {
  status: [1, 0, 0, 0, 0.2, 0, 0, 0],
  dates: [0, 1, 0, 0, 0.2, 0.2, 0, 0],
  payment: [0, 0, 1, 0, 0.2, 0, 0.2, 0],
  beneficiaries: [0, 0, 0, 1, 0.2, 0, 0, 0.2],
  product: [0, 0, 0, 0, 0.2, 1, 0, 0],
  coverage: [0, 0, 0, 0, 0.2, 0, 1, 0],
  exclusions: [0, 0, 0, 0, 0.2, 0, 0, 1],
};

function normalize(vector: number[]): number[] {
  const length = Math.hypot(...vector);
  return vector.map((value) => value / length);
}

export function encodeSection(concept: Concept): number[] {
  return normalize(vectors[concept]);
}

function conceptsIn(text: string): QueryConcept[] {
  return (Object.keys(patterns) as QueryConcept[]).filter((concept) =>
    patterns[concept].test(text),
  );
}

export function encodeSource(text: string, concept: Concept): number[] {
  if (
    concept === 'product' ||
    concept === 'coverage' ||
    concept === 'exclusions'
  ) {
    if (
      !(
        concept === 'product'
          ? /\bproduct\b/i
          : concept === 'coverage'
            ? /\bbenefit\b/i
            : /\bdoes not cover\b/i
      ).test(text)
    )
      throw new Error(`Source concept mismatch: expected ${concept}`);
    return encodeSection(concept);
  }
  const found = conceptsIn(text);
  if (found.length !== 1 || found[0] !== concept)
    throw new Error(
      `Source concept mismatch: expected ${concept}, found ${found.join(',')}`,
    );
  return encodeSection(concept);
}

export function encodeQuery(query: string): number[] | undefined {
  if (
    /\b(how much|amount|price|cost|eligib\w*|bind|claim\w*|quote\w*)\b/i.test(
      query,
    )
  )
    return undefined;
  const found = conceptsIn(query);
  if (found.length === 0) return undefined;
  return normalize(
    vectors.status.map((_, index) =>
      found.reduce((sum, concept) => sum + vectors[concept][index], 0),
    ),
  );
}
