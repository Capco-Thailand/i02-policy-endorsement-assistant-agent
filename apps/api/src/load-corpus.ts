import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { database } from './db.js';

import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

const SectionSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  topic: Type.Union(
    ['status', 'dates', 'payment', 'beneficiaries'].map((topic) =>
      Type.Literal(topic),
    ),
  ),
  text: Type.String({ minLength: 1, maxLength: 1000 }),
  fields: Type.Record(Type.String(), Type.Unknown()),
});
const CorpusSchema = Type.Array(
  Type.Object({
    policyId: Type.String({ minLength: 1 }),
    productId: Type.String({ minLength: 1 }),
    documentId: Type.String({ minLength: 1 }),
    version: Type.String({ minLength: 1 }),
    title: Type.String({ minLength: 1 }),
    sections: Type.Array(SectionSchema, { minItems: 1 }),
  }),
  { minItems: 1 },
);
const parsed: unknown = JSON.parse(
  await readFile(
    fileURLToPath(new URL('../../ai/corpus/policies.json', import.meta.url)),
    'utf8',
  ),
);
if (!Value.Check(CorpusSchema, parsed))
  throw new Error('Synthetic corpus is invalid');
const documents = parsed;
const db = database();
try {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    for (const document of documents) {
      const existing = await client.query(
        'SELECT policy_id,product_id,title FROM policy_documents WHERE document_id=$1 AND version=$2 FOR UPDATE',
        [document.documentId, document.version],
      );
      if (existing.rowCount) {
        const source = existing.rows[0];
        const sections = await client.query(
          'SELECT section_id,topic,excerpt,fields FROM policy_sections WHERE document_id=$1 AND version=$2 ORDER BY section_id',
          [document.documentId, document.version],
        );
        const expected = document.sections
          .map((section) => ({
            section_id: section.id,
            topic: section.topic,
            excerpt: section.text,
            fields: section.fields,
          }))
          .sort((left, right) =>
            left.section_id.localeCompare(right.section_id),
          );
        if (
          source.policy_id !== document.policyId ||
          source.product_id !== document.productId ||
          source.title !== document.title ||
          !isDeepStrictEqual(sections.rows, expected)
        ) {
          throw new Error(
            `Document ${document.documentId} version ${document.version} changed; issue a new version`,
          );
        }
      }
      await client.query(
        'UPDATE policy_documents SET is_current=false WHERE policy_id=$1 AND is_current=true AND (document_id,version) <> ($2,$3)',
        [document.policyId, document.documentId, document.version],
      );
      if (existing.rowCount) {
        await client.query(
          'UPDATE policy_documents SET is_current=true WHERE document_id=$1 AND version=$2',
          [document.documentId, document.version],
        );
        continue;
      }
      await client.query(
        'INSERT INTO policy_documents(document_id,version,policy_id,product_id,title,is_current) VALUES ($1,$2,$3,$4,$5,true)',
        [
          document.documentId,
          document.version,
          document.policyId,
          document.productId,
          document.title,
        ],
      );
      for (const section of document.sections)
        await client.query(
          'INSERT INTO policy_sections(document_id,version,section_id,topic,excerpt,fields) VALUES ($1,$2,$3,$4,$5,$6)',
          [
            document.documentId,
            document.version,
            section.id,
            section.topic,
            section.text,
            JSON.stringify(section.fields),
          ],
        );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
} finally {
  await db.close();
}
