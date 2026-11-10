import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { Type, type Static } from '@sinclair/typebox';
import { AuthStore, SESSION_COOKIE, SESSION_LIFETIME_MS } from './auth.js';
import { ErrorResponse, PoliciesResponse, Policy, PolicyParams, SignInBody, Staff } from './contracts.js';
import { assignedPolicies, assignedPolicy } from './policies.js';

export type AppOptions = {
  auth?: AuthStore;
  webOrigin?: string;
  secureCookies?: boolean;
};

export async function buildApp(options: AppOptions = {}) {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });
  const auth = options.auth ?? new AuthStore([
    { id: 'demo-alice', displayName: 'Alice Morgan', password: process.env.DEMO_ALICE_PASSWORD ?? 'alice-demo-password' },
    { id: 'demo-bob', displayName: 'Bob Chen', password: process.env.DEMO_BOB_PASSWORD ?? 'bob-demo-password' }
  ]);
  const secureCookies = options.secureCookies ?? process.env.NODE_ENV === 'production';
  const cookieFlags = `Path=/; HttpOnly; SameSite=Lax${secureCookies ? '; Secure' : ''}`;
  function sessionCookie(header: string | undefined): string | undefined {
    return header?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  }

  await app.register(cors, { origin: options.webOrigin ?? process.env.WEB_ORIGIN ?? 'http://localhost:3001', credentials: true });
  await app.register(swagger, {
    openapi: {
      info: { title: 'Policy Endorsement Assistant API', version: '0.1.0' },
      components: { securitySchemes: { staffSession: { type: 'apiKey', in: 'cookie', name: SESSION_COOKIE } } }
    }
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  app.get('/health', { schema: { response: { 200: Type.Object({ status: Type.Literal('ok') }) } } }, async () => ({ status: 'ok' as const }));

  app.post<{ Body: Static<typeof SignInBody> }>('/auth/sign-in', {
    schema: {
      body: SignInBody,
      response: {
        200: Type.Object({ actor: Staff, expiresInSeconds: Type.Integer() }),
        401: ErrorResponse
      }
    }
  }, async (request, reply) => {
    const result = auth.signIn(request.body.accountId, request.body.password);
    if (!result) return reply.code(401).send({ error: 'Invalid credentials' });
    reply.header('Set-Cookie', `${SESSION_COOKIE}=${result.token}; Max-Age=${SESSION_LIFETIME_MS / 1000}; ${cookieFlags}`);
    return { actor: result.actor, expiresInSeconds: SESSION_LIFETIME_MS / 1000 };
  });

  app.post('/auth/sign-out', {
    schema: { response: { 204: Type.Null() } }
  }, async (request, reply) => {
    auth.signOut(sessionCookie(request.headers.cookie));
    reply.header('Set-Cookie', `${SESSION_COOKIE}=; Max-Age=0; ${cookieFlags}`);
    return reply.code(204).send(null);
  });

  await app.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', async (request, reply) => {
      if (!auth.actor(sessionCookie(request.headers.cookie))) {
        return reply.code(401).send({ error: 'Authentication required' });
      }
    });

    protectedRoutes.get('/auth/me', {
      schema: { security: [{ staffSession: [] }], response: { 200: Type.Object({ actor: Staff }), 401: ErrorResponse } }
    }, async (request, reply) => {
      const actor = auth.actor(sessionCookie(request.headers.cookie));
      if (!actor) return reply.code(401).send({ error: 'Authentication required' });
      return { actor };
    });

    protectedRoutes.get('/policies', {
      schema: { security: [{ staffSession: [] }], response: { 200: PoliciesResponse, 401: ErrorResponse } }
    }, async (request, reply) => {
      const actor = auth.actor(sessionCookie(request.headers.cookie));
      if (!actor) return reply.code(401).send({ error: 'Authentication required' });
      auth.record(actor.id, 'list_policies');
      return { policies: assignedPolicies(actor) };
    });

    protectedRoutes.get<{ Params: Static<typeof PolicyParams> }>('/policies/:id', {
      schema: {
        security: [{ staffSession: [] }],
        params: PolicyParams,
        response: { 200: Policy, 401: ErrorResponse, 404: ErrorResponse }
      }
    }, async (request, reply) => {
      const actor = auth.actor(sessionCookie(request.headers.cookie));
      if (!actor) return reply.code(401).send({ error: 'Authentication required' });
      const policy = assignedPolicy(actor, request.params.id);
      if (!policy) {
        auth.record(actor.id, 'policy_unavailable');
        return reply.code(404).send({ error: 'Policy unavailable' });
      }
      auth.record(actor.id, 'view_policy');
      return policy;
    });
  });

  return app;
}
