import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import type { Pool } from 'pg';
import { database } from './db.js';
import { equalFact } from './evidence.js';
import {
  encodeRuleSection,
  RULE_ENCODER_VERSION,
} from '../../ai/rule-retrieval.js';

const Change = Type.Union([
  Type.Literal('BENEFICIARY'),
  Type.Literal('ADDRESS'),
  Type.Literal('PAYMENT_FREQUENCY'),
  Type.Literal('ACCIDENTAL_DEATH_RIDER'),
]);
const RuleValue = Type.Union([
  Type.Object(
    {
      kind: Type.Literal('CHECK'),
      field: Type.Literal('beneficiaries'),
      requirement: Type.String(),
    },
    { additionalProperties: false },
  ),
  Type.Object(
    {
      kind: Type.Literal('CHECK'),
      field: Type.Literal('address'),
      requirement: Type.String(),
    },
    { additionalProperties: false },
  ),
  Type.Object(
    {
      kind: Type.Literal('CHECK'),
      field: Type.Literal('paymentFrequency'),
      allowedValues: Type.Array(
        Type.Union([Type.Literal('MONTHLY'), Type.Literal('ANNUAL')]),
        { minItems: 1 },
      ),
    },
    { additionalProperties: false },
  ),
  Type.Object(
    { kind: Type.Literal('REFERRAL'), reason: Type.String() },
    { additionalProperties: false },
  ),
]);
const GuidanceValue = Type.Union([
  Type.Object({ kind: Type.Literal('NONE') }, { additionalProperties: false }),
  Type.Object(
    {
      kind: Type.Literal('DOCUMENT'),
      documentType: Type.String(),
      handling: Type.Union([
        Type.Literal('mock receipt only'),
        Type.Literal('real-world follow-up only'),
      ]),
    },
    { additionalProperties: false },
  ),
]);
const Section = Type.Union([
  Type.Object({
    sectionId: Type.String(),
    role: Type.Literal('RULE'),
    text: Type.String(),
    value: RuleValue,
  }),
  Type.Object({
    sectionId: Type.String(),
    role: Type.Literal('GUIDANCE'),
    text: Type.String(),
    value: GuidanceValue,
  }),
]);
const Corpus = Type.Array(
  Type.Object({
    sourceId: Type.String(),
    ruleId: Type.String(),
    version: Type.Integer({ minimum: 1 }),
    productId: Type.String(),
    changeType: Change,
    effectiveFrom: Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
    effectiveTo: Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
    title: Type.String(),
    sections: Type.Array(Section, { minItems: 2 }),
  }),
);
export async function loadRules(pool: Pool, corpus?: unknown) {
  const input: unknown =
    corpus ??
    (
      await Promise.all(
        ['endorsement-rules.json', 'endorsement-rules-v2.json'].map(
          async (name) =>
            JSON.parse(
              await readFile(
                fileURLToPath(
                  new URL(`../../ai/corpus/${name}`, import.meta.url),
                ),
                'utf8',
              ),
            ),
        ),
      )
    ).flat();
  if (!Value.Check(Corpus, input)) throw new Error('Invalid rules corpus');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const source of input) {
      if (
        source.effectiveFrom > source.effectiveTo ||
        new Set(source.sections.map((section) => section.role)).size !== 2
      )
        throw new Error('Invalid rules corpus');
      const inserted = await client.query(
        `INSERT INTO endorsement_rule_sources(id,rule_id,version,product_id,change_type,effective_from,effective_to,title,encoder_version) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING RETURNING id`,
        [
          source.sourceId,
          source.ruleId,
          source.version,
          source.productId,
          source.changeType,
          source.effectiveFrom,
          source.effectiveTo,
          source.title,
          RULE_ENCODER_VERSION,
        ],
      );
      if (inserted.rowCount === 0) {
        const savedCount = (
          await client.query(
            'SELECT count(*)::int AS count FROM endorsement_rule_sections WHERE source_id=$1',
            [source.sourceId],
          )
        ).rows[0].count;
        if (savedCount !== source.sections.length)
          throw new Error('Immutable rules corpus version differs');
      }
      const existing = (
        await client.query(
          `SELECT rule_id,version,product_id,change_type,effective_from::text,effective_to::text,title,encoder_version FROM endorsement_rule_sources WHERE id=$1`,
          [source.sourceId],
        )
      ).rows[0];
      if (
        !equalFact(existing, {
          rule_id: source.ruleId,
          version: source.version,
          product_id: source.productId,
          change_type: source.changeType,
          effective_from: source.effectiveFrom,
          effective_to: source.effectiveTo,
          title: source.title,
          encoder_version: RULE_ENCODER_VERSION,
        })
      )
        throw new Error('Immutable rules corpus version differs');
      for (const section of source.sections) {
        const vector = `[${encodeRuleSection(source.changeType, section.role).join(',')}]`;
        await client.query(
          `INSERT INTO endorsement_rule_sections(source_id,section_id,role,text,value,embedding,encoder_version) VALUES ($1,$2,$3,$4,$5,$6::vector,$7) ON CONFLICT (source_id,section_id) DO NOTHING`,
          [
            source.sourceId,
            section.sectionId,
            section.role,
            section.text,
            JSON.stringify(section.value),
            vector,
            RULE_ENCODER_VERSION,
          ],
        );
        const saved = (
          await client.query(
            `SELECT role,text,value,embedding::text,encoder_version FROM endorsement_rule_sections WHERE source_id=$1 AND section_id=$2`,
            [source.sourceId, section.sectionId],
          )
        ).rows[0];
        if (
          !equalFact(saved, {
            role: section.role,
            text: section.text,
            value: section.value,
            embedding: vector,
            encoder_version: RULE_ENCODER_VERSION,
          })
        )
          throw new Error('Immutable rules corpus version differs');
      }
      const count = (
        await client.query(
          `SELECT count(*)::int AS count FROM endorsement_rule_sections WHERE source_id=$1`,
          [source.sourceId],
        )
      ).rows[0].count;
      if (count !== source.sections.length)
        throw new Error('Immutable rules corpus version differs');
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const db = database();
  try {
    await db.ready();
    await loadRules(db.pool);
  } finally {
    await db.close();
  }
}
