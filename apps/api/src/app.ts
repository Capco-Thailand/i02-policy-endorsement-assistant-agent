import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { Type, type Static } from '@sinclair/typebox';
import Fastify from 'fastify';
import {
  AuthStore,
  SESSION_COOKIE,
  SESSION_LIFETIME_SECONDS,
} from './auth/store.js';
import {
  CustomerResponseSchema,
  ErrorResponseSchema,
  PoliciesResponseSchema,
  PolicyParamsSchema,
  PolicySchema,
  SignInBodySchema,
  SignInResponseSchema,
} from './contracts.js';
import { assignedPolicies, assignedPolicy } from './policies/service.js';

export type AppOptions = {
  auth?: AuthStore;
  now?: () => number;
  webOrigin?: string;
  secureCookies?: boolean;
  logStream?: { write(entry: string): void };
};

function sessionToken(cookieHeader: string | undefined): string | undefined {
  const cookie = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return cookie?.slice(SESSION_COOKIE.length + 1) || undefined;
}

export async function buildApp(options: AppOptions = {}) {
  const now = options.now ?? Date.now;
  const app = Fastify({
    logger: {
      redact: {
        paths: [
          'req.headers.cookie',
          'req.headers.authorization',
          'headers.cookie',
          'headers.authorization',
        ],
        censor: '[Redacted]',
      },
      stream: options.logStream,
    },
  });
  const auth = options.auth ?? new AuthStore(now);
  const secureCookies =
    options.secureCookies ?? process.env.NODE_ENV === 'production';
  const cookieFlags = `Path=/; HttpOnly; SameSite=Lax${secureCookies ? '; Secure' : ''}`;
  const configuredOrigins = options.webOrigin ?? process.env.WEB_ORIGIN;
  const allowedOrigins = configuredOrigins
    ? configuredOrigins.split(',').map((origin) => origin.trim())
    : ['http://localhost:3001'];

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  });
  await app.register(swagger, {
    openapi: {
      info: { title: 'Policy Endorsement Assistant API', version: '0.1.0' },
      components: {
        securitySchemes: {
          customerSession: {
            type: 'apiKey',
            in: 'cookie',
            name: SESSION_COOKIE,
          },
        },
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });
  app.addHook('onSend', async (request, reply, payload) => {
    if (
      request.url.startsWith('/auth/') ||
      request.url.startsWith('/policies')
    ) {
      reply.header('Cache-Control', 'no-store');
    }
    return payload;
  });

  app.get(
    '/health',
    {
      schema: {
        response: { 200: Type.Object({ status: Type.Literal('ok') }) },
      },
    },
    async () => ({ status: 'ok' as const }),
  );

  app.post<{ Body: Static<typeof SignInBodySchema> }>(
    '/auth/sign-in',
    {
      schema: {
        body: SignInBodySchema,
        response: {
          200: SignInResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const body = request.body;
      const result = await auth.signIn(body.accountId, body.password);
      if (!result)
        return reply.code(401).send({
          error: 'Sign-in failed. Check your account ID and password.',
        });
      reply.header(
        'Set-Cookie',
        `${SESSION_COOKIE}=${result.token}; Max-Age=${SESSION_LIFETIME_SECONDS}; ${cookieFlags}`,
      );
      return {
        customer: result.customer,
        expiresInSeconds: SESSION_LIFETIME_SECONDS,
      };
    },
  );

  app.get(
    '/auth/me',
    {
      schema: {
        security: [{ customerSession: [] }],
        response: { 200: CustomerResponseSchema, 401: ErrorResponseSchema },
      },
    },
    async (request, reply) => {
      const customer = auth.customer(sessionToken(request.headers.cookie));
      if (!customer)
        return reply.code(401).send({ error: 'Authentication required' });
      return { customer };
    },
  );

  app.post(
    '/auth/sign-out',
    { schema: { response: { 204: Type.Null() } } },
    async (request, reply) => {
      auth.signOut(sessionToken(request.headers.cookie));
      reply.header(
        'Set-Cookie',
        `${SESSION_COOKIE}=; Max-Age=0; ${cookieFlags}`,
      );
      return reply.code(204).send();
    },
  );

  app.get(
    '/policies',
    {
      schema: {
        security: [{ customerSession: [] }],
        response: {
          200: PoliciesResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const customer = auth.customer(sessionToken(request.headers.cookie));
      if (!customer)
        return reply.code(401).send({ error: 'Authentication required' });
      auth.record(customer.id, 'list_policies');
      return { policies: assignedPolicies(customer) };
    },
  );

  app.get<{ Params: Static<typeof PolicyParamsSchema> }>(
    '/policies/:id',
    {
      schema: {
        security: [{ customerSession: [] }],
        params: PolicyParamsSchema,
        response: {
          200: PolicySchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const customer = auth.customer(sessionToken(request.headers.cookie));
      if (!customer)
        return reply.code(401).send({ error: 'Authentication required' });
      const policy = assignedPolicy(customer, request.params.id);
      if (!policy) {
        auth.record(customer.id, 'policy_unavailable', request.params.id);
        return reply.code(404).send({ error: 'Policy unavailable' });
      }
      auth.record(customer.id, 'view_policy', request.params.id);
      return policy;
    },
  );

  return app;
}
