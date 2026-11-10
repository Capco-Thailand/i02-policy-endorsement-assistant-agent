import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { StaffDto } from './contracts.js';

export const SESSION_COOKIE = 'pea_session';
export const SESSION_LIFETIME_MS = 30 * 60 * 1000;

type Account = StaffDto & { salt: Buffer; passwordHash: Buffer };
type Session = { actorId: string; expiresAt: number };
export type AuditEvent = { actorId: string | null; action: string; at: number };

export class AuthStore {
  private readonly accounts: Account[];
  private readonly sessions = new Map<string, Session>();
  readonly audit: AuditEvent[] = [];

  constructor(
    credentials: ReadonlyArray<{ id: string; displayName: string; password: string }>,
    private readonly now: () => number = Date.now
  ) {
    this.accounts = credentials.map(({ id, displayName, password }) => {
      const salt = randomBytes(16);
      return { id, displayName, salt, passwordHash: scryptSync(password, salt, 64) };
    });
  }

  signIn(id: string, password: string): { token: string; actor: StaffDto } | null {
    const account = this.accounts.find((item) => item.id === id);
    // Do equal work for unknown account IDs and avoid account-specific errors.
    const salt = account?.salt ?? Buffer.alloc(16);
    const expected = account?.passwordHash ?? Buffer.alloc(64);
    const actual = scryptSync(password, salt, 64);
    if (!account || !timingSafeEqual(expected, actual)) {
      this.record(null, 'sign_in_failed');
      return null;
    }
    const token = randomBytes(32).toString('base64url');
    this.sessions.set(this.digest(token), { actorId: account.id, expiresAt: this.now() + SESSION_LIFETIME_MS });
    this.record(account.id, 'sign_in');
    return { token, actor: { id: account.id, displayName: account.displayName } };
  }

  actor(token: string | undefined): StaffDto | null {
    if (!token) return null;
    const key = this.digest(token);
    const session = this.sessions.get(key);
    if (!session) return null;
    if (session.expiresAt <= this.now()) {
      this.sessions.delete(key);
      this.record(session.actorId, 'session_expired');
      return null;
    }
    const account = this.accounts.find((item) => item.id === session.actorId);
    return account ? { id: account.id, displayName: account.displayName } : null;
  }

  signOut(token: string | undefined): void {
    if (!token) return;
    const key = this.digest(token);
    const session = this.sessions.get(key);
    if (session) {
      this.sessions.delete(key);
      this.record(session.actorId, 'sign_out');
    }
  }

  record(actorId: string | null, action: string): void {
    this.audit.push({ actorId, action, at: this.now() });
  }

  private digest(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
