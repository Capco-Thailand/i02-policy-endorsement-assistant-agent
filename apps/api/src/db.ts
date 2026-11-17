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
import type { Customer, Policy } from './auth/data.js';
import type { RequestRecord } from './endorsement/schema.js';
import { SESSION_LIFETIME_MS } from './auth/session.js';

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
      const sql = await readFile(
        fileURLToPath(new URL('../sql/001_initial.sql', import.meta.url)),
        'utf8',
      );
      await pool.query(sql);
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
            'INSERT INTO policies VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING',
            [id, cid, label, status, start, end, frequency],
          );
          for (const [position, [name, allocation]] of beneficiaries.entries())
            await client.query(
              'INSERT INTO beneficiaries VALUES ($1,$2,$3,$4) ON CONFLICT (policy_id,position) DO NOTHING',
              [id, position, name, allocation],
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
    async audit(
      actorId: string,
      action: string,
      now: number,
      metadata: Record<string, string> = {},
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
          'INSERT INTO audit_events(actor_id,action,at) VALUES ($1,$2,$3)',
          [record.requesterId, 'request-create', new Date(now)],
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
  };
}
