import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { database } from './db.js';
import { buildApp } from './app.js';

const url = process.env.TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;
integration('PostgreSQL persistence', () => {
  const db = database(url ?? 'postgresql://localhost/unused');
  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    await db.migrate();
    await db.seed();
  });
  afterAll(async () => {
    await db.close();
  });
  it('keeps demo records unique and preserves activity across seed reruns', async () => {
    const marker = `seed-preserves-${Date.now()}`;
    await db.pool.query(
      'INSERT INTO audit_events(actor_id,action,at) VALUES ($1,$2,now())',
      ['CUS-001', marker],
    );
    await db.seed();
    await db.migrate();
    await db.seed();
    expect(
      (await db.pool.query('SELECT count(*)::int AS count FROM customers'))
        .rows[0].count,
    ).toBe(2);
    expect(
      (await db.pool.query('SELECT count(*)::int AS count FROM policies'))
        .rows[0].count,
    ).toBe(3);
    expect(
      (
        await db.pool.query(
          'SELECT count(*)::int AS count FROM audit_events WHERE action=$1',
          [marker],
        )
      ).rows[0].count,
    ).toBe(1);
  });
  it('rejects an orphan beneficiary through the database constraint', async () => {
    await expect(
      db.pool.query(
        'INSERT INTO beneficiaries(policy_id,position,name,allocation_percent) VALUES ($1,$2,$3,$4)',
        ['POL-UNKNOWN', 0, 'Synthetic Person', 100],
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });
  it('shares a digested session after restart and revokes it', async () => {
    const a = await buildApp();
    let cookie: string | undefined;
    try {
      const login = await a.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: { accountId: 'narin', password: 'NarinDemo123!' },
      });
      expect(login.statusCode).toBe(200);
      cookie = String(login.headers['set-cookie']);
    } finally {
      await a.close();
    }
    const b = await buildApp();
    try {
      expect(
        (
          await b.inject({
            method: 'GET',
            url: '/api/auth/session',
            headers: { cookie },
          })
        ).statusCode,
      ).toBe(200);
      const token = /pea_session=([^;]+)/.exec(String(cookie))?.[1];
      expect(
        (
          await db.pool.query(
            'SELECT count(*)::int AS count FROM sessions WHERE token_digest=$1',
            [token],
          )
        ).rows[0].count,
      ).toBe(0);
      expect(
        (
          await b.inject({
            method: 'POST',
            url: '/api/auth/sign-out',
            headers: { cookie },
          })
        ).statusCode,
      ).toBe(204);
    } finally {
      await b.close();
    }
    const c = await buildApp();
    try {
      expect(
        (
          await c.inject({
            method: 'GET',
            url: '/api/auth/session',
            headers: { cookie },
          })
        ).statusCode,
      ).toBe(401);
    } finally {
      await c.close();
    }
  });
  it('rejects a session expired by server time across instances', async () => {
    let time = 1000;
    const a = await buildApp({ now: () => time });
    const b = await buildApp({ now: () => time });
    try {
      const login = await a.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: { accountId: 'narin', password: 'NarinDemo123!' },
      });
      const cookie = login.headers['set-cookie'];
      expect(
        (
          await b.inject({
            method: 'GET',
            url: '/api/auth/session',
            headers: { cookie },
          })
        ).statusCode,
      ).toBe(200);
      time += 30 * 60 * 1000;
      expect(
        (
          await b.inject({
            method: 'GET',
            url: '/api/auth/session',
            headers: { cookie },
          })
        ).statusCode,
      ).toBe(401);
      expect(
        (
          await a.inject({
            method: 'GET',
            url: '/api/policies',
            headers: { cookie },
          })
        ).statusCode,
      ).toBe(401);
    } finally {
      await a.close();
      await b.close();
    }
  });
  it('keeps request and audit durable without changing policy facts', async () => {
    const requestTime = Date.now() + 10 * 365 * 24 * 60 * 60 * 1000;
    const before = await db.policy('CUS-001', 'POL-NARIN-001');
    const app = await buildApp({ now: () => requestTime });
    let requestId: string;
    let cookie: string;
    try {
      const login = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: { accountId: 'narin', password: 'NarinDemo123!' },
      });
      cookie = String(login.headers['set-cookie']);
      const response = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-NARIN-001/requests',
        headers: { cookie },
        payload: {
          changeType: 'ADDRESS',
          requestedEffectiveDate: '2027-01-01',
          correspondenceAddress: 'Synthetic address',
        },
      });
      expect(response.statusCode).toBe(200);
      requestId = response.json().request.id;
      expect(response.json().request.createdAt).toBe(
        new Date(requestTime).toISOString(),
      );
    } finally {
      await app.close();
    }
    const restarted = await buildApp();
    try {
      expect(
        (
          await restarted.inject({
            method: 'GET',
            url: '/api/policies/POL-NARIN-001',
            headers: { cookie },
          })
        ).statusCode,
      ).toBe(200);
      expect(
        (
          await restarted.inject({
            method: 'GET',
            url: '/api/policies/POL-MALI-001',
            headers: { cookie },
          })
        ).statusCode,
      ).toBe(404);
      expect(
        (
          await db.pool.query(
            'SELECT count(*)::int AS count FROM endorsement_requests WHERE id=$1',
            [requestId],
          )
        ).rows[0].count,
      ).toBe(1);
      expect(
        (
          await db.pool.query(
            "SELECT count(*)::int AS count FROM audit_events WHERE actor_id=$1 AND action='request-create' AND at=$2",
            ['CUS-001', new Date(requestTime)],
          )
        ).rows[0].count,
      ).toBe(1);
      expect(await db.policy('CUS-001', 'POL-NARIN-001')).toEqual(before);
    } finally {
      await restarted.close();
    }
  });
  it('rolls back request when audit insertion fails', async () => {
    const marker = `ROLLBACK-${Date.now()}`;
    const app = await buildApp();
    await db.pool.query(
      `CREATE OR REPLACE FUNCTION pea_test_reject_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'request-create' AND EXISTS (SELECT 1 FROM endorsement_requests WHERE payload->>'correspondenceAddress' = '${marker}') THEN RAISE EXCEPTION 'synthetic audit failure'; END IF; RETURN NEW; END $$`,
    );
    await db.pool.query(
      'CREATE TRIGGER pea_test_reject_audit BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION pea_test_reject_audit()',
    );
    try {
      const login = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: { accountId: 'narin', password: 'NarinDemo123!' },
      });
      const response = await app.inject({
        method: 'POST',
        url: '/api/policies/POL-NARIN-001/requests',
        headers: { cookie: login.headers['set-cookie'] },
        payload: {
          changeType: 'ADDRESS',
          requestedEffectiveDate: '2027-01-01',
          correspondenceAddress: marker,
        },
      });
      expect(response.statusCode).toBe(500);
      expect(
        (
          await db.pool.query(
            "SELECT count(*)::int AS count FROM endorsement_requests WHERE payload->>'correspondenceAddress'=$1",
            [marker],
          )
        ).rows[0].count,
      ).toBe(0);
    } finally {
      await db.pool.query('DROP TRIGGER pea_test_reject_audit ON audit_events');
      await db.pool.query('DROP FUNCTION pea_test_reject_audit()');
      await app.close();
    }
  });
  it('rolls back sign-in session when audit insertion fails', async () => {
    const signInTime = Date.now() + 15 * 365 * 24 * 60 * 60 * 1000;
    const app = await buildApp({ now: () => signInTime });
    await db.pool.query(
      `CREATE OR REPLACE FUNCTION pea_test_reject_sign_in() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'sign-in' AND NEW.at = '${new Date(signInTime).toISOString()}' THEN RAISE EXCEPTION 'synthetic sign-in audit failure'; END IF; RETURN NEW; END $$`,
    );
    await db.pool.query(
      'CREATE TRIGGER pea_test_reject_sign_in BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION pea_test_reject_sign_in()',
    );
    try {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: { accountId: 'narin', password: 'NarinDemo123!' },
      });
      expect(response.statusCode).toBe(500);
      expect(
        (
          await db.pool.query(
            'SELECT count(*)::int AS count FROM sessions WHERE customer_id=$1 AND expires_at=$2',
            ['CUS-001', new Date(signInTime + 30 * 60 * 1000)],
          )
        ).rows[0].count,
      ).toBe(0);
    } finally {
      await db.pool.query(
        'DROP TRIGGER pea_test_reject_sign_in ON audit_events',
      );
      await db.pool.query('DROP FUNCTION pea_test_reject_sign_in()');
      await app.close();
    }
  });
  it('keeps the session valid when sign-out audit insertion fails', async () => {
    const signOutTime = Date.now() + 20 * 365 * 24 * 60 * 60 * 1000;
    const app = await buildApp({ now: () => signOutTime });
    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in',
      payload: { accountId: 'narin', password: 'NarinDemo123!' },
    });
    const cookie = login.headers['set-cookie'];
    await db.pool.query(
      `CREATE OR REPLACE FUNCTION pea_test_reject_sign_out() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'sign-out' AND NEW.at = '${new Date(signOutTime).toISOString()}' THEN RAISE EXCEPTION 'synthetic sign-out audit failure'; END IF; RETURN NEW; END $$`,
    );
    await db.pool.query(
      'CREATE TRIGGER pea_test_reject_sign_out BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION pea_test_reject_sign_out()',
    );
    try {
      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/api/auth/sign-out',
            headers: { cookie },
          })
        ).statusCode,
      ).toBe(500);
      expect(
        (
          await app.inject({
            method: 'GET',
            url: '/api/auth/session',
            headers: { cookie },
          })
        ).statusCode,
      ).toBe(200);
    } finally {
      await db.pool.query(
        'DROP TRIGGER pea_test_reject_sign_out ON audit_events',
      );
      await db.pool.query('DROP FUNCTION pea_test_reject_sign_out()');
      await app.close();
    }
  });
});
