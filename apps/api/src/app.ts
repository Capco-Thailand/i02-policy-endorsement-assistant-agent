import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { registerPolicyRoutes } from './policies/routes.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(swagger, {
    openapi: {
      info: { title: 'Policy Endorsement Assistant API', version: '0.1.0' },
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  app.get('/health', {
    schema: {
      description: 'Check whether the API is running',
      response: {
        200: {
          type: 'object',
          required: ['status'],
          properties: { status: { type: 'string', enum: ['ok'] } },
        },
      },
    },
  }, async () => ({ status: 'ok' as const }));

  await registerPolicyRoutes(app);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof Error && 'validation' in error && error.validation) {
      return reply.code(400).send({ error: 'Bad Request', message: error.message });
    }
    app.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  });

  app.setNotFoundHandler((_request, reply) => {
    return reply.code(404).send({ error: 'Not Found' });
  });

  return app;
}
