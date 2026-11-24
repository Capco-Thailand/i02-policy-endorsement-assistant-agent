import Fastify from 'fastify';
import {
  QuoteInputSchema,
  QuoteSchema,
  type QuoteInputContract,
} from './contract.js';
import { calculate, CalculatorError } from './calculator.js';

export function buildCalculatorApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
    ajv: { customOptions: { removeAdditional: false } },
  });
  app.get('/health', async () => ({ status: 'ok' }));
  app.post<{ Body: QuoteInputContract }>(
    '/v1/quote',
    {
      schema: {
        body: QuoteInputSchema,
        response: {
          200: QuoteSchema,
          422: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (request, reply) => {
      try {
        return calculate(request.body);
      } catch (error) {
        if (error instanceof CalculatorError)
          return reply.code(422).send({ error: error.code });
        throw error;
      }
    },
  );
  return app;
}
