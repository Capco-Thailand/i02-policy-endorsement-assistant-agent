import { readFile } from 'node:fs/promises';
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
  randomUUID,
} from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { Value } from '@sinclair/typebox/value';
import type { Customer, Policy } from './auth/data.js';
import {
  RequestRecordSchema,
  type RequestRecord,
} from './endorsement/schema.js';
import { SESSION_LIFETIME_MS } from './auth/session.js';
import { ENCODER_VERSION } from '../../ai/retrieval.js';
import { RULE_ENCODER_VERSION } from '../../ai/rule-retrieval.js';
import type { ChangeType, RuleSource } from './rules.js';

const digest = (token: string) =>
  createHash('sha256').update(token).digest('hex');
export function database(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('DATABASE_URL is required');
  const pool = new Pool({ connectionString: url });
  return {
    pool,
    async ready() {
      await pool.query('SELECT 1');
    },
    async close() {
      await pool.end();
    },
    async migrate() {
      for (const filename of [
        '001_initial.sql',
        '002_policy_corpus.sql',
        '003_endorsement_rules.sql',
        '004_policy_terms.sql',
        '005_proposals.sql',
        '006_proposal_decisions.sql',
      ]) {
        const sql = await readFile(
          fileURLToPath(new URL(`../sql/${filename}`, import.meta.url)),
          'utf8',
        );
        await pool.query(sql);
      }
    },
    async seed() {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const [id, accountId, name, password] of [
          ['CUS-001', 'narin', 'Narin', 'NarinDemo123!'],
          ['CUS-002', 'mali', 'Mali', 'MaliDemo123!'],
        ]) {
          const salt = randomBytes(16);
          await client.query(
            'INSERT INTO customers VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING',
            [id, accountId, name, scryptSync(password, salt, 64), salt],
          );
        }
        const fixed = [
          [
            'POL-NARIN-001',
            'CUS-001',
            'Family Protection Plan',
            'ACTIVE',
            '2025-01-01',
            '2035-12-31',
            'MONTHLY',
            [
              ['Arisa K.', 60],
              ['Decha K.', 40],
            ],
          ],
          [
            'POL-MALI-001',
            'CUS-002',
            'Secure Future Plan',
            'ACTIVE',
            '2024-06-01',
            '2034-05-31',
            'ANNUAL',
            [['Pim S.', 100]],
          ],
          [
            'POL-NARIN-002',
            'CUS-001',
            'Classic Life Plan',
            'EXPIRED',
            '2015-01-01',
            '2025-01-01',
            'ANNUAL',
            [['Arisa K.', 100]],
          ],
        ] as const;
        for (const [
          id,
          cid,
          label,
          status,
          start,
          end,
          frequency,
          beneficiaries,
        ] of fixed) {
          await client.query(
            'INSERT INTO policies(id,customer_id,label,status,effective_date,expiry_date,payment_frequency) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING',
            [id, cid, label, status, start, end, frequency],
          );
          for (const [position, [name, allocation]] of beneficiaries.entries())
            await client.query(
              'INSERT INTO beneficiaries VALUES ($1,$2,$3,$4) ON CONFLICT (policy_id,position) DO NOTHING',
              [id, position, name, allocation],
            );
          const product = {
            insurer: 'Example Mutual (Synthetic)',
            type: 'Life',
            name: label,
            version: 'v1',
          };
          const amount =
            id === 'POL-NARIN-001'
              ? 1000000
              : id === 'POL-MALI-001'
                ? 750000
                : 500000;
          const coverages = [
            {
              id: 'coverage.life',
              name: 'Life benefit',
              amount,
              currency: 'THB',
            },
            ...(id === 'POL-NARIN-001'
              ? [
                  {
                    id: 'coverage.accidental-death',
                    name: 'Accidental death benefit',
                    amount: 250000,
                    currency: 'THB',
                  },
                ]
              : []),
          ];
          const exclusions = [
            {
              id: 'exclusions.life',
              text: 'The life benefit does not cover death caused by intentional self-injury.',
            },
            ...(id === 'POL-NARIN-001'
              ? [
                  {
                    id: 'exclusions.accidental-death',
                    text: 'The accidental death benefit does not cover death caused solely by illness, without an accident.',
                  },
                ]
              : []),
          ];
          await client.query(
            'UPDATE policies SET product_terms=$2,coverage_terms=$3,exclusion_terms=$4 WHERE id=$1 AND product_terms IS NULL AND coverage_terms IS NULL AND exclusion_terms IS NULL',
            [
              id,
              JSON.stringify(product),
              JSON.stringify(coverages),
              JSON.stringify(exclusions),
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
    },
    async authenticate(
      accountId: string,
      password: string,
    ): Promise<Customer | undefined> {
      const result = await pool.query(
        'SELECT * FROM customers WHERE account_id=$1',
        [accountId],
      );
      const row = result.rows[0];
      const fallback =
        row ??
        (await pool.query('SELECT * FROM customers ORDER BY id LIMIT 1'))
          .rows[0];
      if (!fallback) return undefined;
      const equal = timingSafeEqual(
        scryptSync(password, fallback.salt, 64),
        fallback.password_hash,
      );
      return equal && row
        ? {
            id: row.id,
            accountId: row.account_id,
            name: row.name,
            salt: row.salt,
            passwordHash: row.password_hash,
          }
        : undefined;
    },
    async createSession(customer: Customer, now: number) {
      const token = randomBytes(32).toString('hex');
      const expiresAt = now + SESSION_LIFETIME_MS;
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('INSERT INTO sessions VALUES ($1,$2,$3)', [
          digest(token),
          customer.id,
          new Date(expiresAt),
        ]);
        await client.query(
          'INSERT INTO audit_events(actor_id,action,at) VALUES ($1,$2,$3)',
          [customer.id, 'sign-in', new Date(now)],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      return { token, expiresAt };
    },
    async session(token: string | undefined, now: number) {
      if (!token) return undefined;
      const result = await pool.query(
        'SELECT c.*,s.expires_at FROM sessions s JOIN customers c ON c.id=s.customer_id WHERE s.token_digest=$1 AND s.expires_at > $2',
        [digest(token), new Date(now)],
      );
      const row = result.rows[0];
      return row
        ? {
            actor: {
              id: row.id,
              accountId: row.account_id,
              name: row.name,
              salt: row.salt,
              passwordHash: row.password_hash,
            } as Customer,
            expiresAt: new Date(row.expires_at).valueOf(),
          }
        : undefined;
    },
    async revoke(token: string, actorId: string, now: number) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM sessions WHERE token_digest=$1', [
          digest(token),
        ]);
        await client.query(
          'INSERT INTO audit_events(actor_id,action,at) VALUES ($1,$2,$3)',
          [actorId, 'sign-out', new Date(now)],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async policies(customerId: string): Promise<Policy[]> {
      const result = await pool.query(
        `SELECT p.*, to_char(p.effective_date, 'YYYY-MM-DD') AS effective_date_text, to_char(p.expiry_date, 'YYYY-MM-DD') AS expiry_date_text, COALESCE(json_agg(json_build_object('name',b.name,'allocationPercent',b.allocation_percent) ORDER BY b.position) FILTER (WHERE b.name IS NOT NULL),'[]') AS beneficiaries FROM policies p LEFT JOIN beneficiaries b ON b.policy_id=p.id WHERE p.customer_id=$1 GROUP BY p.id ORDER BY p.id`,
        [customerId],
      );
      return result.rows.map(toPolicy);
    },
    async policy(
      customerId: string,
      policyId: string,
    ): Promise<Policy | undefined> {
      return (await this.policies(customerId)).find((p) => p.id === policyId);
    },
    async evidenceDocument(policyId: string) {
      const result = await pool.query(
        `SELECT d.id, d.product_id, d.version, d.title, d.encoder_version, d.facts_snapshot,
          COALESCE(json_agg(json_build_object('sectionId',s.section_id,'concept',s.concept,'value',s.fact_value,'excerpt',s.excerpt,'encoderVersion',s.encoder_version) ORDER BY s.section_id)
          FILTER (WHERE s.section_id IS NOT NULL),'[]') AS sections
         FROM policy_document_selection x
         JOIN policy_documents d ON d.id=x.document_id AND d.policy_id=x.policy_id
         LEFT JOIN policy_sections s ON s.document_id=d.id
         WHERE x.policy_id=$1 GROUP BY d.id`,
        [policyId],
      );
      return result.rows[0] as
        | {
            id: string;
            product_id: string;
            version: string;
            title: string;
            encoder_version: string;
            facts_snapshot: unknown;
            sections: {
              sectionId: string;
              concept: string;
              value: unknown;
              excerpt: string;
              encoderVersion: string;
            }[];
          }
        | undefined;
    },
    async rankedEvidence(
      policyId: string,
      documentId: string,
      embedding: number[],
      limit = 4,
    ) {
      const vector = `[${embedding.join(',')}]`;
      const result = await pool.query(
        `SELECT d.id AS document_id,d.version,d.title,s.section_id,s.excerpt,
          s.concept,s.fact_value
         FROM policy_document_selection x
         JOIN policy_documents d ON d.id=x.document_id AND d.policy_id=x.policy_id
         JOIN policy_sections s ON s.document_id=d.id
         WHERE x.policy_id=$1 AND x.document_id=$2 AND d.id=$2
           AND d.encoder_version=$3 AND s.encoder_version=$3
         ORDER BY s.embedding <=> $4::vector, s.section_id LIMIT $5`,
        [policyId, documentId, ENCODER_VERSION, vector, limit],
      );
      return result.rows as {
        document_id: string;
        version: string;
        title: string;
        section_id: string;
        excerpt: string;
        concept: string;
        fact_value: unknown;
      }[];
    },
    async selectedRuleProduct(policyId: string) {
      const result = await pool.query(
        `SELECT d.product_id, (SELECT count(DISTINCT product_id)::int FROM policy_documents WHERE policy_id=$1) AS product_count
        FROM policy_document_selection x JOIN policy_documents d ON d.id=x.document_id AND d.policy_id=x.policy_id
        WHERE x.policy_id=$1`,
        [policyId],
      );
      return result.rows[0] as
        | { product_id: string; product_count: number }
        | undefined;
    },
    async ruleSources(productId: string, changeType: ChangeType, date: string) {
      const result = await pool.query(
        `SELECT s.id AS "sourceId",s.rule_id AS "ruleId",s.version,s.product_id AS "productId",s.change_type AS "changeType",s.effective_from::text AS "effectiveFrom",s.effective_to::text AS "effectiveTo",s.encoder_version AS "encoderVersion",
        COALESCE(json_agg(json_build_object('sectionId',x.section_id,'role',x.role,'text',x.text,'value',x.value,'encoderVersion',x.encoder_version) ORDER BY x.section_id) FILTER (WHERE x.section_id IS NOT NULL),'[]') AS sections
        FROM endorsement_rule_sources s LEFT JOIN endorsement_rule_sections x ON x.source_id=s.id
        WHERE s.product_id=$1 AND s.change_type=$2 AND s.effective_from <= $3::date AND s.effective_to >= $3::date
        GROUP BY s.id ORDER BY s.rule_id,s.version DESC,s.id LIMIT 65`,
        [productId, changeType, date],
      );
      return result.rows as RuleSource[];
    },
    async rankedRuleSections(
      sourceIds: string[],
      vector: number[],
      limit: number,
    ) {
      const result = await pool.query(
        `SELECT source_id,section_id,role,text,value FROM endorsement_rule_sections
        WHERE source_id = ANY($1::text[]) AND encoder_version=$2
        ORDER BY embedding <=> $3::vector, source_id, CASE role WHEN 'RULE' THEN 0 ELSE 1 END, section_id LIMIT $4`,
        [sourceIds, RULE_ENCODER_VERSION, `[${vector.join(',')}]`, limit],
      );
      return result.rows as {
        source_id: string;
        section_id: string;
        role: 'RULE' | 'GUIDANCE';
        text: string;
        value: { kind: string };
      }[];
    },
    async ownsRequest(customerId: string, policyId: string, requestId: string) {
      const result = await pool.query(
        'SELECT 1 FROM endorsement_requests WHERE id=$1 AND requester_id=$2 AND policy_id=$3',
        [requestId, customerId, policyId],
      );
      return result.rowCount === 1;
    },
    async requestFor(
      customerId: string,
      policyId: string,
      requestId: string,
    ): Promise<unknown | undefined> {
      const result = await pool.query(
        'SELECT payload FROM endorsement_requests WHERE id=$1 AND requester_id=$2 AND policy_id=$3',
        [requestId, customerId, policyId],
      );
      return result.rows[0]?.payload;
    },
    async proposalForRequest(
      customerId: string,
      policyId: string,
      requestId: string,
    ): Promise<unknown | undefined> {
      const result = await pool.query(
        'SELECT payload FROM endorsement_proposals WHERE requester_id=$1 AND policy_id=$2 AND request_id=$3',
        [customerId, policyId, requestId],
      );
      return result.rows[0]?.payload;
    },
    async proposalFor(
      customerId: string,
      policyId: string,
      proposalId: string,
    ): Promise<unknown | undefined> {
      const result = await pool.query(
        'SELECT payload FROM endorsement_proposals WHERE requester_id=$1 AND policy_id=$2 AND id=$3',
        [customerId, policyId, proposalId],
      );
      return result.rows[0]?.payload;
    },
    async approvedHistory(customerId: string) {
      const result = await pool.query(
        `SELECT p.id AS proposal_id, p.policy_id, p.request_id, p.decided_at, p.payload,
                pol.label AS policy_label, req.payload AS request_payload
         FROM endorsement_proposals p
         JOIN policies pol ON pol.id=p.policy_id AND pol.customer_id=p.requester_id
         LEFT JOIN endorsement_requests req ON req.id=p.request_id
           AND req.requester_id=p.requester_id AND req.policy_id=p.policy_id
         WHERE p.requester_id=$1 AND p.status='APPROVED'
         ORDER BY p.decided_at DESC, p.id DESC`,
        [customerId],
      );
      return result.rows.map((row) => {
        const snapshot = row.payload.requestedChange;
        const requestedChange = Value.Check(RequestRecordSchema, snapshot)
          ? snapshot
          : row.request_payload;
        return {
          proposalId: row.proposal_id as string,
          policyId: row.policy_id as string,
          requestId: row.request_id as string,
          decidedAt: new Date(row.decided_at).toISOString(),
          requestedChange: Value.Check(RequestRecordSchema, requestedChange)
            ? requestedChange
            : undefined,
          policyLabel: (row.payload.current?.label ??
            row.policy_label ??
            `Policy ${row.policy_id}`) as string,
          status: 'APPROVED' as const,
        };
      });
    },
    async saveProposal(
      proposal: {
        id: string;
        requestId: string;
        requesterId: string;
        policyId: string;
        status: string;
        createdAt: string;
        [key: string]: unknown;
      },
      now: number,
    ) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const inserted = await client.query(
          'INSERT INTO endorsement_proposals(id,request_id,requester_id,policy_id,status,payload,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (request_id) DO NOTHING RETURNING payload',
          [
            proposal.id,
            proposal.requestId,
            proposal.requesterId,
            proposal.policyId,
            proposal.status,
            JSON.stringify(proposal),
            proposal.createdAt,
          ],
        );
        if (inserted.rowCount)
          await client.query(
            'INSERT INTO audit_events(actor_id,action,at,metadata) VALUES ($1,$2,$3,$4)',
            [
              proposal.requesterId,
              'proposal-create',
              new Date(now),
              JSON.stringify({
                requestId: proposal.requestId,
                policyId: proposal.policyId,
                proposalId: proposal.id,
                outcome: 'CAN_PROCEED',
                citations: proposal.citations,
                calculationStatus: (proposal.impact as { status: string })
                  .status,
                ratingVersion: (
                  proposal.impact as { quote?: { ratingVersion?: string } }
                ).quote?.ratingVersion,
                status: proposal.status,
              }),
            ],
          );
        const result = inserted.rowCount
          ? inserted
          : await client.query(
              'SELECT payload FROM endorsement_proposals WHERE request_id=$1',
              [proposal.requestId],
            );
        await client.query('COMMIT');
        return result.rows[0].payload as unknown;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async presentProposal(
      customerId: string,
      policyId: string,
      proposalId: string,
      now: number,
    ): Promise<unknown | undefined> {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await client.query(
          "UPDATE endorsement_proposals SET status='PENDING_APPROVAL', payload=jsonb_set(payload,'{status}','\"PENDING_APPROVAL\"') WHERE requester_id=$1 AND policy_id=$2 AND id=$3 AND status='DRAFT' RETURNING payload",
          [customerId, policyId, proposalId],
        );
        if (result.rowCount)
          await client.query(
            'INSERT INTO audit_events(actor_id,action,at,metadata) VALUES ($1,$2,$3,$4)',
            [
              customerId,
              'proposal-present',
              new Date(now),
              JSON.stringify({
                requestId: result.rows[0].payload.requestId,
                policyId,
                proposalId,
                status: 'PENDING_APPROVAL',
                citations: result.rows[0].payload.citations,
                calculationStatus: result.rows[0].payload.impact.status,
                ratingVersion:
                  result.rows[0].payload.impact.quote?.ratingVersion,
              }),
            ],
          );
        const selected = result.rowCount
          ? result
          : await client.query(
              'SELECT payload FROM endorsement_proposals WHERE requester_id=$1 AND policy_id=$2 AND id=$3',
              [customerId, policyId, proposalId],
            );
        await client.query('COMMIT');
        return selected.rows[0]?.payload;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async decideProposal(
      customerId: string,
      policyId: string,
      proposalId: string,
      decision: 'APPROVED' | 'REJECTED',
      now: number,
    ) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const selected = await client.query(
          'SELECT status, payload FROM endorsement_proposals WHERE requester_id=$1 AND policy_id=$2 AND id=$3 FOR UPDATE',
          [customerId, policyId, proposalId],
        );
        const row = selected.rows[0];
        if (!row) {
          await client.query('COMMIT');
          return { kind: 'not-found' as const };
        }
        if (row.status === 'DRAFT') {
          await client.query('COMMIT');
          return { kind: 'not-presented' as const };
        }
        if (row.status === 'APPROVED' || row.status === 'REJECTED') {
          await client.query('COMMIT');
          return row.status === decision
            ? { kind: 'decided' as const, proposal: row.payload as unknown }
            : { kind: 'conflict' as const };
        }
        const decidedAt = new Date(now).toISOString();
        const updated = await client.query(
          "UPDATE endorsement_proposals SET status=$4, decided_at=$5, payload=jsonb_set(jsonb_set(payload,'{status}',to_jsonb($4::text)),'{decidedAt}',to_jsonb($6::text)) WHERE requester_id=$1 AND policy_id=$2 AND id=$3 AND status='PENDING_APPROVAL' RETURNING payload",
          [customerId, policyId, proposalId, decision, decidedAt, decidedAt],
        );
        if (!updated.rowCount) throw new Error('DECISION_UPDATE_FAILED');
        await client.query(
          'INSERT INTO audit_events(actor_id,action,at,metadata) VALUES ($1,$2,$3,$4)',
          [
            customerId,
            'proposal-decision',
            decidedAt,
            JSON.stringify({
              proposalId,
              requestId: row.payload.requestId,
              policyId,
              decision,
              decidedAt,
            }),
          ],
        );
        await client.query('COMMIT');
        return {
          kind: 'decided' as const,
          proposal: updated.rows[0].payload as unknown,
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async audit(
      actorId: string,
      action: string,
      now: number,
      metadata: Record<string, unknown> = {},
    ) {
      await pool.query(
        'INSERT INTO audit_events(actor_id,action,at,metadata) VALUES ($1,$2,$3,$4)',
        [actorId, action, new Date(now), JSON.stringify(metadata)],
      );
    },
    async saveRequest(record: RequestRecord, now: number) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          'INSERT INTO endorsement_requests VALUES ($1,$2,$3,$4,$5,$6)',
          [
            record.id,
            record.requesterId,
            record.policyId,
            record.createdAt,
            record.changeType,
            JSON.stringify(record),
          ],
        );
        await client.query(
          'INSERT INTO audit_events(actor_id,action,at,metadata) VALUES ($1,$2,$3,$4)',
          [
            record.requesterId,
            'request-create',
            new Date(now),
            JSON.stringify({
              requestId: record.id,
              policyId: record.policyId,
              changeType: record.changeType,
            }),
          ],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
interface PolicyRow {
  id: string;
  customer_id: string;
  label: string;
  status: Policy['status'];
  effective_date_text: string;
  expiry_date_text: string;
  payment_frequency: Policy['paymentFrequency'];
  beneficiaries: { name: string; allocationPercent: number | string }[];
  product_terms: Policy['productTerms'];
  coverage_terms: Policy['coverageTerms'];
  exclusion_terms: Policy['exclusionTerms'];
}
function toPolicy(row: PolicyRow): Policy {
  return {
    id: row.id,
    customerId: row.customer_id,
    label: row.label,
    status: row.status,
    effectiveDate: row.effective_date_text,
    expiryDate: row.expiry_date_text,
    paymentFrequency: row.payment_frequency,
    beneficiaries: row.beneficiaries.map((b) => ({
      name: b.name,
      allocationPercent: Number(b.allocationPercent),
    })),
    productTerms: row.product_terms,
    coverageTerms: row.coverage_terms,
    exclusionTerms: row.exclusion_terms,
  };
}
