import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import { Type, type Static } from '@sinclair/typebox';
import { authenticate, policies } from './auth/data.js';
import { ownsPolicy } from './auth/guards.js';
import { COOKIE_NAME, SESSION_LIFETIME_MS, Sessions } from './auth/session.js';

const ErrorSchema = Type.Object({ error: Type.String() });
const ActorSchema = Type.Object({
  id: Type.String(),
  accountId: Type.String(),
  name: Type.String(),
});
const PolicySchema = Type.Object({ id: Type.String(), label: Type.String() });
const SignInBody = Type.Object(
  {
    accountId: Type.String({ minLength: 1 }),
    password: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);
const PolicyParams = Type.Object({ policyId: Type.String() });
type Credentials = Static<typeof SignInBody>;
type Params = Static<typeof PolicyParams>;

export interface AuditRecord {
  actorId: string;
  action: string;
  at: number;
}
export interface AppOptions {
  now?: () => number;
  audit?: AuditRecord[];
}
export async function buildApp(options: AppOptions = {}) {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });
  const now = options.now ?? Date.now;
  const sessions = new Sessions(now);
  const audit = options.audit ?? [];
  await app.register(cookie);
  await app.register(cors, {
    origin: 'http://localhost:3001',
    credentials: true,
  });
  await app.register(swagger, {
    openapi: {
      info: { title: 'Policy Endorsement Assistant API', version: '0.1.0' },
    },
  });
  const unauthorized = { error: 'UNAUTHORIZED' };
  const actorFor = (request: { cookies: Record<string, string | undefined> }) =>
    sessions.get(request.cookies[COOKIE_NAME]);
  const record = (actorId: string, action: string) => {
    const event = { actorId, action, at: now() };
    audit.push(event);
    app.log.info(event, 'audit');
  };
  const cookieOptions = {
    path: '/api',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };

  app.post<{ Body: Credentials }>(
    '/api/auth/sign-in',
    {
      schema: {
        body: SignInBody,
        response: {
          200: Type.Object({ actor: ActorSchema, expiresAt: Type.Number() }),
          401: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const customer = authenticate(
        request.body.accountId,
        request.body.password,
      );
      if (!customer) return reply.code(401).send(unauthorized);
      const token = sessions.create(customer);
      reply.setCookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: SESSION_LIFETIME_MS / 1000,
      });
      record(customer.id, 'sign-in');
      return {
        actor: {
          id: customer.id,
          accountId: customer.accountId,
          name: customer.name,
        },
        expiresAt: sessions.expiresAt(token),
      };
    },
  );
  app.get(
    '/api/auth/session',
    {
      schema: {
        response: {
          200: Type.Object({ actor: ActorSchema, expiresAt: Type.Number() }),
          401: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const actor = actorFor(request);
      if (!actor) return reply.code(401).send(unauthorized);
      record(actor.id, 'session-read');
      return {
        actor: { id: actor.id, accountId: actor.accountId, name: actor.name },
        expiresAt: sessions.expiresAt(request.cookies[COOKIE_NAME]),
      };
    },
  );
  app.post(
    '/api/auth/sign-out',
    { schema: { response: { 204: Type.Null(), 401: ErrorSchema } } },
    async (request, reply) => {
      const actor = actorFor(request);
      if (!actor) return reply.code(401).send(unauthorized);
      sessions.delete(request.cookies[COOKIE_NAME]);
      reply.clearCookie(COOKIE_NAME, cookieOptions);
      record(actor.id, 'sign-out');
      return reply.code(204).send();
    },
  );
  app.get(
    '/api/policies',
    {
      schema: {
        response: {
          200: Type.Object({ policies: Type.Array(PolicySchema) }),
          401: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const actor = actorFor(request);
      if (!actor) return reply.code(401).send(unauthorized);
      record(actor.id, 'policies-list');
      return {
        policies: policies
          .filter((policy) => ownsPolicy(actor, policy))
          .map(({ id, label }) => ({ id, label })),
      };
    },
  );
  app.get<{ Params: Params }>(
    '/api/policies/:policyId',
    {
      schema: {
        params: PolicyParams,
        response: {
          200: Type.Object({ policy: PolicySchema }),
          401: ErrorSchema,
          404: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const actor = actorFor(request);
      if (!actor) return reply.code(401).send(unauthorized);
      const policy = policies.find(
        (item) => item.id === request.params.policyId,
      );
      if (!ownsPolicy(actor, policy))
        return reply.code(404).send({ error: 'NOT_FOUND' });
      record(actor.id, 'policy-read');
      return { policy: { id: policy.id, label: policy.label } };
    },
  );
  app.get('/openapi.json', { schema: { hide: true } }, async () =>
    app.swagger(),
  );
  await app.ready();
  return app;
}
