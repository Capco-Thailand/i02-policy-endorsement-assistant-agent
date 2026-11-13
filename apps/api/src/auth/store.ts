import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

export const SESSION_COOKIE = 'pea_session';
export const SESSION_LIFETIME_SECONDS = 30 * 60;
const SESSION_LIFETIME_MS = SESSION_LIFETIME_SECONDS * 1000;
const scryptAsync = promisify(scrypt);

type SeededCustomer = {
  id: string;
  displayName: string;
  salt: Buffer;
  passwordHash: Buffer;
};
type Session = { customerId: string; expiresAt: number };
export type AuditEvent = { actorId: string | null; action: string; at: number };
export type AuditAction =
  | 'sign_in'
  | 'sign_in_failed'
  | 'session_expired'
  | 'sign_out'
  | 'list_policies'
  | 'view_policy'
  | 'policy_unavailable';

const customers: readonly SeededCustomer[] = [
  {
    id: 'demo-alice',
    displayName: 'Alice Morgan',
    salt: Buffer.from('cGVhLWRlbW8tYWxpY2Utc2FsdC12MQ==', 'base64'),
    passwordHash: Buffer.from(
      'agTvJ8U5Ywc7AlQcgAFlTqw/vYQUktT2jRrWtEWmG3qXSWLvwLUf2+pyml8nM/Jhw00ByJ5VT9U/c5kK4qmG2A==',
      'base64',
    ),
  },
  {
    id: 'demo-bob',
    displayName: 'Bob Chen',
    salt: Buffer.from('cGVhLWRlbW8tYm9iLXNhbHQtdjE=', 'base64'),
    passwordHash: Buffer.from(
      'qbzdmhQSGoGx6Ha6d+WPTpFjq6LRvwGXziKLB7LtIUONaIpQsO6jKk3S3CsNW+0OQCQ9w1G9a3e4tVRe+yAkPA==',
      'base64',
    ),
  },
];

export class AuthStore {
  private readonly sessions = new Map<string, Session>();
  readonly audit: AuditEvent[] = [];

  constructor(private readonly now: () => number = Date.now) {}

  async signIn(
    id: string,
    password: string,
  ): Promise<{
    token: string;
    customer: { id: string; displayName: string };
  } | null> {
    const account = customers.find((entry) => entry.id === id);
    const salt = account?.salt ?? Buffer.alloc(16);
    const expected = account?.passwordHash ?? Buffer.alloc(64);
    const actual = await scryptAsync(password, salt, 64);
    if (!Buffer.isBuffer(actual))
      throw new Error('Password verification failed');
    if (!account || !timingSafeEqual(expected, actual)) {
      this.record(null, 'sign_in_failed');
      return null;
    }

    const token = randomBytes(32).toString('base64url');
    this.sessions.set(this.digest(token), {
      customerId: account.id,
      expiresAt: this.now() + SESSION_LIFETIME_MS,
    });
    this.record(account.id, 'sign_in');
    return {
      token,
      customer: { id: account.id, displayName: account.displayName },
    };
  }

  customer(
    token: string | undefined,
  ): { id: string; displayName: string } | null {
    if (!token) return null;
    const key = this.digest(token);
    const session = this.sessions.get(key);
    if (!session) return null;
    if (session.expiresAt <= this.now()) {
      this.sessions.delete(key);
      this.record(session.customerId, 'session_expired');
      return null;
    }
    const account = customers.find((entry) => entry.id === session.customerId);
    return account
      ? { id: account.id, displayName: account.displayName }
      : null;
  }

  signOut(token: string | undefined): void {
    if (!token) return;
    const key = this.digest(token);
    const session = this.sessions.get(key);
    if (!session) return;
    this.sessions.delete(key);
    this.record(session.customerId, 'sign_out');
  }

  record(actorId: string | null, action: AuditAction, policyId?: string): void {
    this.audit.push({
      actorId,
      action,
      at: this.now(),
      ...(policyId ? { policyId } : {}),
    });
    if (this.audit.length > 10_000) this.audit.shift();
  }

  private digest(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
