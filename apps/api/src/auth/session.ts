import { randomBytes } from 'node:crypto';
import type { Customer } from './data.js';

export const COOKIE_NAME = 'pea_session';
export const SESSION_LIFETIME_MS = 30 * 60 * 1000;

export class Sessions {
  private readonly entries = new Map<
    string,
    { customer: Customer; expiresAt: number }
  >();
  constructor(private readonly now: () => number = Date.now) {}

  create(customer: Customer) {
    const token = randomBytes(32).toString('hex');
    this.entries.set(token, {
      customer,
      expiresAt: this.now() + SESSION_LIFETIME_MS,
    });
    return token;
  }

  private getEntry(token?: string) {
    if (!token) return undefined;
    const entry = this.entries.get(token);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(token);
      return undefined;
    }
    return entry;
  }

  get(token?: string) {
    return this.getEntry(token)?.customer;
  }

  expiresAt(token?: string) {
    return this.getEntry(token)?.expiresAt;
  }

  delete(token?: string) {
    if (token) this.entries.delete(token);
  }
}
