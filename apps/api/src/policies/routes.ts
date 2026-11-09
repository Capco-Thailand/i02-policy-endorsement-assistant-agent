import type { FastifyInstance } from 'fastify';
import { findOwnedPolicy, listPolicies, resolveDemoUser } from './data.js';

const policySummary = {
  type: 'object',
  required: ['policy_id', 'policy_number', 'product_name', 'policy_status', 'effective_date', 'expiry_date'],
  properties: {
    policy_id: { type: 'string' }, policy_number: { type: 'string' }, product_name: { type: 'string' },
    policy_status: { type: 'string', enum: ['ACTIVE', 'EXPIRED'] },
    effective_date: { type: 'string', format: 'date' }, expiry_date: { type: ['string', 'null'], format: 'date' },
  },
} as const;

const problem = {
  type: 'object', required: ['error'], properties: { error: { type: 'string' } },
} as const;

export async function registerPolicyRoutes(app: FastifyInstance): Promise<void> {
  app.get('/policies', {
    schema: { description: 'List policies available to the authenticated demo user', security: [{ bearerAuth: [] }], response: { 200: { type: 'array', items: policySummary }, 401: problem } },
  }, async (request, reply) => {
    const userId = resolveDemoUser(request.headers.authorization);
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
    return listPolicies(userId).map(({ beneficiaries: _beneficiaries, ...summary }) => summary);
  });

  app.get<{ Params: { policyId: string } }>('/policies/:policyId', {
    schema: {
      description: 'Get an owned synthetic policy and its beneficiaries',
      security: [{ bearerAuth: [] }],
      params: { type: 'object', required: ['policyId'], properties: { policyId: { type: 'string' } } },
      response: { 200: { ...policySummary, required: [...policySummary.required, 'policyholder_name', 'sum_assured', 'annual_premium', 'beneficiaries'], properties: { ...policySummary.properties, policyholder_name: { type: 'string' }, sum_assured: { type: 'string' }, annual_premium: { type: 'string' }, beneficiaries: { type: 'array', items: { type: 'object', required: ['beneficiary_id', 'full_name', 'relationship', 'allocation_percentage'], properties: { beneficiary_id: { type: 'string' }, full_name: { type: 'string' }, relationship: { type: 'string' }, allocation_percentage: { type: 'number' } } } } } }, 401: problem, 404: problem },
    },
  }, async (request, reply) => {
    const userId = resolveDemoUser(request.headers.authorization);
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
    const policy = findOwnedPolicy(userId, request.params.policyId);
    if (!policy) return reply.code(404).send({ error: 'Not Found' });
    return policy;
  });

  app.post<{ Params: { policyId: string } }>('/policies/:policyId/endorsements/initiate', {
    schema: {
      description: 'Check whether an owned active policy may enter endorsement intake; creates no draft',
      security: [{ bearerAuth: [] }],
      params: { type: 'object', required: ['policyId'], properties: { policyId: { type: 'string' } } },
      response: { 204: { type: 'null' }, 401: problem, 404: problem, 409: problem },
    },
  }, async (request, reply) => {
    const userId = resolveDemoUser(request.headers.authorization);
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
    const policy = findOwnedPolicy(userId, request.params.policyId);
    if (!policy) return reply.code(404).send({ error: 'Not Found' });
    if (policy.policy_status !== 'ACTIVE') return reply.code(409).send({ error: 'Policy is not eligible' });
    return reply.code(204).send();
  });
}
