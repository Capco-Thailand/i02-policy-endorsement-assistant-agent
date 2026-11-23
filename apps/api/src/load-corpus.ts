import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import type { Pool } from 'pg';
import { database } from './db.js';
import { encodeSource, ENCODER_VERSION } from '../../ai/retrieval.js';
import { equalFact } from './evidence.js';

const ConceptSchema = Type.Union([
  Type.Literal('status'),
  Type.Literal('dates'),
  Type.Literal('payment'),
  Type.Literal('beneficiaries'),
]);
const CorpusSchema = Type.Array(
  Type.Object({
    policyId: Type.String(),
    productId: Type.String(),
    documentId: Type.String(),
    version: Type.String(),
    title: Type.String(),
    sections: Type.Array(
      Type.Object({
        id: Type.String(),
        concept: ConceptSchema,
        excerpt: Type.String(),
        value: Type.Unknown(),
      }),
    ),
  }),
);
type Corpus = Static<typeof CorpusSchema>;

export async function loadCorpus(pool: Pool, corpus?: Corpus) {
  const input: unknown =
    corpus ??
    JSON.parse(
      await readFile(
        fileURLToPath(
          new URL('../../ai/corpus/policies.json', import.meta.url),
        ),
        'utf8',
      ),
    );
  if (!Value.Check(CorpusSchema, input)) throw new Error('Invalid corpus');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const document of input) {
      const snapshot = Object.fromEntries(
        document.sections.map((section) => [section.concept, section.value]),
      );
      await client.query(
        `INSERT INTO policy_documents(id,policy_id,product_id,version,title,encoder_version,facts_snapshot)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
        [
          document.documentId,
          document.policyId,
          document.productId,
          document.version,
          document.title,
          ENCODER_VERSION,
          JSON.stringify(snapshot),
        ],
      );
      const existing = await client.query(
        `SELECT policy_id,product_id,version,title,encoder_version,facts_snapshot
         FROM policy_documents WHERE id=$1`,
        [document.documentId],
      );
      const saved = existing.rows[0];
      if (
        saved.policy_id !== document.policyId ||
        saved.product_id !== document.productId ||
        saved.version !== document.version ||
        saved.title !== document.title ||
        saved.encoder_version !== ENCODER_VERSION ||
        !equalFact(saved.facts_snapshot, snapshot)
      )
        throw new Error('Immutable corpus version differs');
      for (const section of document.sections) {
        const vector = `[${encodeSource(section.excerpt, section.concept).join(',')}]`;
        await client.query(
          `INSERT INTO policy_sections(document_id,section_id,concept,excerpt,fact_value,embedding,encoder_version)
           VALUES ($1,$2,$3,$4,$5,$6::vector,$7) ON CONFLICT (document_id,section_id) DO NOTHING`,
          [
            document.documentId,
            section.id,
            section.concept,
            section.excerpt,
            JSON.stringify(section.value),
            vector,
            ENCODER_VERSION,
          ],
        );
        const check = await client.query(
          `SELECT concept,excerpt,fact_value,encoder_version,embedding <=> $3::vector AS distance
           FROM policy_sections WHERE document_id=$1 AND section_id=$2`,
          [document.documentId, section.id, vector],
        );
        const savedSection = check.rows[0];
        if (
          savedSection.concept !== section.concept ||
          savedSection.excerpt !== section.excerpt ||
          savedSection.encoder_version !== ENCODER_VERSION ||
          !equalFact(savedSection.fact_value, section.value) ||
          Number(savedSection.distance) > 0.000001
        )
          throw new Error('Immutable corpus version differs');
      }
      const count = await client.query(
        'SELECT count(*)::int AS count FROM policy_sections WHERE document_id=$1',
        [document.documentId],
      );
      if (count.rows[0].count !== document.sections.length)
        throw new Error('Immutable corpus version differs');
      await client.query(
        `INSERT INTO policy_document_selection(policy_id,document_id)
         VALUES ($1,$2) ON CONFLICT (policy_id) DO NOTHING`,
        [document.policyId, document.documentId],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = database();
  try {
    await loadCorpus(db.pool);
  } finally {
    await db.close();
  }
}
