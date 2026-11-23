import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import {
  RequestBody,
  RequestRecordSchema,
  validAllocation,
  validDate,
  type RequestInput,
  type RequestRecord,
} from './endorsement/schema.js';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import { Type, type Static } from '@sinclair/typebox';
import { database } from './db.js';
import { ownsPolicy } from './auth/guards.js';
import { COOKIE_NAME, SESSION_LIFETIME_MS } from './auth/session.js';
import { encodeQuery, ENCODER_VERSION } from '../../ai/retrieval.js';
import { retrieveRules, type RuleStore } from './rules.js';
import {
  decideEligibility,
  validateEligibilityRequest,
} from './endorsement/eligibility.js';
import { retrievePolicyEvidence } from './endorsement/policy-evidence.js';
import { Value } from '@sinclair/typebox/value';
import {
  equalFact,
  policyFacts,
  reconcileEvidence,
  type UnresolvedReason,
} from './evidence.js';

const ErrorSchema = Type.Object({ error: Type.String() });
const ActorSchema = Type.Object({
  id: Type.String(),
  accountId: Type.String(),
  name: Type.String(),
});
const PolicySchema = Type.Object({
  id: Type.String(),
  label: Type.String(),
  status: Type.Union([Type.Literal('ACTIVE'), Type.Literal('EXPIRED')]),
});
const PolicyDetailSchema = Type.Object({
  ...PolicySchema.properties,
  effectiveDate: Type.String({ format: 'date' }),
  expiryDate: Type.String({ format: 'date' }),
  paymentFrequency: Type.Union([
    Type.Literal('MONTHLY'),
    Type.Literal('ANNUAL'),
  ]),
  beneficiaries: Type.Array(
    Type.Object({ name: Type.String(), allocationPercent: Type.Number() }),
  ),
});
const SignInBody = Type.Object(
  {
    accountId: Type.String({ minLength: 1 }),
    password: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);
const PolicyParams = Type.Object({ policyId: Type.String() });
const EligibilityParams = Type.Object({
  policyId: Type.String(),
  requestId: Type.String(),
});
const EligibilityResultSchema = Type.Object({
  outcome: Type.Union([
    Type.Literal('CAN_PROCEED'),
    Type.Literal('CANNOT_PROCEED'),
    Type.Literal('NEEDS_REVIEW'),
  ]),
  reasonCodes: Type.Array(Type.String()),
  reasons: Type.Array(Type.String()),
  nextStep: Type.String(),
  sourceIds: Type.Array(Type.String()),
  citations: Type.Array(
    Type.Union([
      Type.Object({
        kind: Type.Literal('POLICY'),
        sourceId: Type.String(),
        version: Type.String(),
        sectionId: Type.String(),
        excerpt: Type.String(),
      }),
      Type.Object({
        kind: Type.Literal('RULE'),
        sourceId: Type.String(),
        ruleId: Type.String(),
        version: Type.Integer(),
        sectionId: Type.String(),
      }),
    ]),
  ),
});
const EvidenceQuery = Type.Object({
  query: Type.String({ minLength: 1, maxLength: 200 }),
});
const RuleChange = Type.Union([
  Type.Literal('BENEFICIARY'),
  Type.Literal('ADDRESS'),
  Type.Literal('PAYMENT_FREQUENCY'),
  Type.Literal('ACCIDENTAL_DEATH_RIDER'),
]);
const RulesQuery = Type.Object(
  {
    changeType: RuleChange,
    requestedEffectiveDate: Type.String({ format: 'date' }),
  },
  { additionalProperties: false },
);
const RuleCitationBase = {
  sourceId: Type.String(),
  ruleId: Type.String(),
  version: Type.Integer(),
  productId: Type.String(),
  changeType: RuleChange,
  effectiveFrom: Type.String(),
  effectiveTo: Type.String(),
  sectionId: Type.String(),
  text: Type.String(),
};
const RuleValue = Type.Union([
  Type.Object({
    kind: Type.Literal('CHECK'),
    field: Type.Literal('beneficiaries'),
    requirement: Type.String(),
  }),
  Type.Object({
    kind: Type.Literal('CHECK'),
    field: Type.Literal('address'),
    requirement: Type.String(),
  }),
  Type.Object({
    kind: Type.Literal('CHECK'),
    field: Type.Literal('paymentFrequency'),
    allowedValues: Type.Array(
      Type.Union([Type.Literal('MONTHLY'), Type.Literal('ANNUAL')]),
    ),
  }),
  Type.Object({ kind: Type.Literal('REFERRAL'), reason: Type.String() }),
]);
const GuidanceValue = Type.Union([
  Type.Object({ kind: Type.Literal('NONE') }),
  Type.Object({
    kind: Type.Literal('DOCUMENT'),
    documentType: Type.String(),
    handling: Type.Union([
      Type.Literal('mock receipt only'),
      Type.Literal('real-world follow-up only'),
    ]),
  }),
]);
const RuleCitation = Type.Union([
  Type.Object({
    ...RuleCitationBase,
    role: Type.Literal('RULE'),
    value: RuleValue,
  }),
  Type.Object({
    ...RuleCitationBase,
    role: Type.Literal('GUIDANCE'),
    value: GuidanceValue,
  }),
]);
const RulesResult = Type.Object({
  status: Type.Union([
    Type.Literal('AVAILABLE'),
    Type.Literal('MISSING'),
    Type.Literal('CONFLICTING'),
  ]),
  requiresHumanReferral: Type.Boolean(),
  sourceIds: Type.Array(Type.String()),
  citations: Type.Array(RuleCitation),
});
const RuleUnavailable = Type.Object({
  status: Type.Literal('UNAVAILABLE'),
  requiresHumanReferral: Type.Literal(true),
  sourceIds: Type.Array(Type.String(), { maxItems: 0 }),
  citations: Type.Array(RuleCitation, { maxItems: 0 }),
});
const EvidenceCitation = Type.Object({
  sourceId: Type.String(),
  title: Type.String(),
  version: Type.String(),
  sectionId: Type.String(),
  excerpt: Type.String(),
});
const EvidenceResult = Type.Union([
  Type.Object({
    status: Type.Literal('available'),
    match: Type.Literal('Matches policy facts'),
    citations: Type.Array(EvidenceCitation),
  }),
  Type.Object({
    status: Type.Literal('unresolved'),
    reason: Type.Union([
      Type.Literal('UNKNOWN_QUERY'),
      Type.Literal('MISSING_DOCUMENT'),
      Type.Literal('MISSING_SECTION'),
      Type.Literal('STALE_DOCUMENT'),
      Type.Literal('STALE_ENCODER'),
      Type.Literal('CONFLICTING_EVIDENCE'),
    ]),
    citations: Type.Array(EvidenceCitation, { maxItems: 0 }),
  }),
]);
type Credentials = Static<typeof SignInBody>;
type Params = Static<typeof PolicyParams>;
type EvidenceQueryInput = Static<typeof EvidenceQuery>;
type RulesQueryInput = Static<typeof RulesQuery>;
export interface AuditRecord {
  actorId: string;
  action: string;
  at: number;
}
export interface AppOptions {
  now?: () => number;
  schemaOnly?: boolean;
  evidenceStore?: Pick<
    ReturnType<typeof database>,
    'evidenceDocument' | 'rankedEvidence'
  >;
  ruleStore?: RuleStore;
}
export async function buildApp(options: AppOptions = {}) {
  if (!options.schemaOnly && !process.env.DATABASE_URL)
    throw new Error('DATABASE_URL is required');
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });
  const now = options.now ?? Date.now;
  const db = database(
    options.schemaOnly ? 'postgresql://localhost/schema-only' : undefined,
  );
  const evidenceStore = options.evidenceStore ?? db;
  const ruleStore = options.ruleStore ?? db;
  try {
    if (!options.schemaOnly) await db.ready();
  } catch (error) {
    await db.close();
    throw new Error('Database connection failed', { cause: error });
  }
  app.addHook('onClose', async () => {
    await db.close();
  });
  await app.register(cookie);
  await app.register(cors, {
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3001',
    credentials: true,
  });
  await app.register(swagger, {
    openapi: {
      info: { title: 'Policy Endorsement Assistant API', version: '0.1.0' },
    },
  });
  const unauthorized = { error: 'UNAUTHORIZED' };
  const actorFor = (request: { cookies: Record<string, string | undefined> }) =>
    db.session(request.cookies[COOKIE_NAME], now());
  const record = async (actorId: string, action: string) => {
    await db.audit(actorId, action, now());
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
      const customer = await db.authenticate(
        request.body.accountId,
        request.body.password,
      );
      if (!customer) return reply.code(401).send(unauthorized);
      const { token, expiresAt } = await db.createSession(customer, now());
      reply.setCookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: SESSION_LIFETIME_MS / 1000,
      });
      return {
        actor: {
          id: customer.id,
          accountId: customer.accountId,
          name: customer.name,
        },
        expiresAt,
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
      const session = await actorFor(request);
      if (!session) return reply.code(401).send(unauthorized);
      const actor = session.actor;
      await record(actor.id, 'session-read');
      return {
        actor: { id: actor.id, accountId: actor.accountId, name: actor.name },
        expiresAt: session.expiresAt,
      };
    },
  );
  app.post(
    '/api/auth/sign-out',
    { schema: { response: { 204: Type.Null(), 401: ErrorSchema } } },
    async (request, reply) => {
      const session = await actorFor(request);
      const actor = session?.actor;
      const token = request.cookies[COOKIE_NAME];
      if (!actor || !token) return reply.code(401).send(unauthorized);
      await db.revoke(token, actor.id, now());
      reply.clearCookie(COOKIE_NAME, cookieOptions);
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
      const session = await actorFor(request);
      const actor = session?.actor;
      if (!actor) return reply.code(401).send(unauthorized);
      await record(actor.id, 'policies-list');
      return {
        policies: (await db.policies(actor.id)).map(
          ({ id, label, status }) => ({ id, label, status }),
        ),
      };
    },
  );
  app.get<{ Params: Params }>(
    '/api/policies/:policyId',
    {
      schema: {
        params: PolicyParams,
        response: {
          200: Type.Object({ policy: PolicyDetailSchema }),
          401: ErrorSchema,
          404: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await actorFor(request);
      const actor = session?.actor;
      if (!actor) return reply.code(401).send(unauthorized);
      const policy = await db.policy(actor.id, request.params.policyId);
      if (!ownsPolicy(actor, policy))
        return reply.code(404).send({ error: 'NOT_FOUND' });
      await record(actor.id, 'policy-read');
      return {
        policy: {
          id: policy.id,
          label: policy.label,
          status: policy.status,
          effectiveDate: policy.effectiveDate,
          expiryDate: policy.expiryDate,
          paymentFrequency: policy.paymentFrequency,
          beneficiaries: policy.beneficiaries,
        },
      };
    },
  );
  app.get<{ Params: Params; Querystring: EvidenceQueryInput }>(
    '/api/policies/:policyId/evidence',
    {
      schema: {
        params: PolicyParams,
        querystring: EvidenceQuery,
        response: {
          200: EvidenceResult,
          400: ErrorSchema,
          401: ErrorSchema,
          404: ErrorSchema,
          503: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const actor = (await actorFor(request))?.actor;
      if (!actor) return reply.code(401).send(unauthorized);
      const policy = await db.policy(actor.id, request.params.policyId);
      if (!ownsPolicy(actor, policy))
        return reply.code(404).send({ error: 'NOT_FOUND' });
      const unresolved = (reason: UnresolvedReason) => ({
        status: 'unresolved' as const,
        reason,
        citations: [],
      });
      const embedding = encodeQuery(request.query.query);
      if (!embedding) return unresolved('UNKNOWN_QUERY');
      try {
        const document = await evidenceStore.evidenceDocument(policy.id);
        if (!document) return unresolved('MISSING_DOCUMENT');
        if (
          document.encoder_version !== ENCODER_VERSION ||
          document.sections.some(
            (section) => section.encoderVersion !== ENCODER_VERSION,
          )
        )
          return unresolved('STALE_ENCODER');
        if (!equalFact(document.facts_snapshot, policyFacts(policy)))
          return unresolved('STALE_DOCUMENT');
        const reason = reconcileEvidence(policy, document.sections);
        if (reason) return unresolved(reason);
        const ranked = await evidenceStore.rankedEvidence(
          policy.id,
          document.id,
          embedding,
          1,
        );
        if (ranked.length === 0) return unresolved('STALE_DOCUMENT');
        return {
          status: 'available',
          match: 'Matches policy facts',
          citations: ranked.map((section) => ({
            sourceId: section.document_id,
            title: section.title,
            version: section.version,
            sectionId: section.section_id,
            excerpt: section.excerpt,
          })),
        };
      } catch (error) {
        app.log.error({ err: error }, 'Evidence storage failed');
        return reply.code(503).send({ error: 'EVIDENCE_UNAVAILABLE' });
      }
    },
  );
  app.get<{ Params: Params; Querystring: RulesQueryInput }>(
    '/api/policies/:policyId/rules',
    {
      schema: {
        params: PolicyParams,
        querystring: RulesQuery,
        response: {
          200: RulesResult,
          400: ErrorSchema,
          401: ErrorSchema,
          404: ErrorSchema,
          503: RuleUnavailable,
        },
      },
    },
    async (request, reply) => {
      const actor = (await actorFor(request))?.actor;
      if (!actor) return reply.code(401).send(unauthorized);
      const policy = await db.policy(actor.id, request.params.policyId);
      if (!ownsPolicy(actor, policy))
        return reply.code(404).send({ error: 'NOT_FOUND' });
      if (!validDate(request.query.requestedEffectiveDate))
        return reply.code(400).send({ error: 'BAD_REQUEST' });
      try {
        return await retrieveRules(
          ruleStore,
          policy.id,
          request.query.changeType,
          request.query.requestedEffectiveDate,
        );
      } catch (error) {
        app.log.error({ err: error }, 'Rule retrieval failed');
        return reply.code(503).send({
          status: 'UNAVAILABLE',
          requiresHumanReferral: true,
          sourceIds: [],
          citations: [],
        });
      }
    },
  );
  app.post<{ Params: Params; Body: RequestInput }>(
    '/api/policies/:policyId/requests',
    {
      schema: {
        params: PolicyParams,
        body: RequestBody,
        response: {
          200: Type.Object({ request: RequestRecordSchema }),
          400: ErrorSchema,
          401: ErrorSchema,
          404: ErrorSchema,
          409: ErrorSchema,
        },
      },
      preValidation: async (request, reply) => {
        const session = await actorFor(request);
        const actor = session?.actor;
        if (!actor) {
          reply.code(401).send(unauthorized);
          return;
        }
        const policy = await db.policy(actor.id, request.params.policyId);
        if (!ownsPolicy(actor, policy)) {
          reply.code(404).send({ error: 'NOT_FOUND' });
          return;
        }
        if (policy.status !== 'ACTIVE') {
          reply.code(409).send({ error: 'POLICY_EXPIRED' });
          return;
        }
        const body = request.body;
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          reply.code(400).send({ error: 'INVALID_REQUEST' });
          return;
        }
        const allowed: Record<string, string[]> = {
          BENEFICIARY: [
            'changeType',
            'requestedEffectiveDate',
            'beneficiaries',
          ],
          ADDRESS: [
            'changeType',
            'requestedEffectiveDate',
            'correspondenceAddress',
          ],
          PAYMENT_FREQUENCY: [
            'changeType',
            'requestedEffectiveDate',
            'paymentFrequency',
          ],
          ACCIDENTAL_DEATH_RIDER: [
            'changeType',
            'requestedEffectiveDate',
            'riderAction',
          ],
        };
        const selected =
          typeof body.changeType === 'string' &&
          Object.hasOwn(allowed, body.changeType)
            ? allowed[body.changeType]
            : undefined;
        if (
          !selected ||
          Object.keys(body).some((key) => !selected.includes(key))
        ) {
          reply.code(400).send({ error: 'INVALID_REQUEST_FIELDS' });
          return;
        }
        return;
      },
    },
    async (request, reply) => {
      const body = request.body;
      if (body.changeType === 'ADDRESS' && !body.correspondenceAddress.trim())
        return reply
          .code(400)
          .send({ error: 'INVALID_CORRESPONDENCE_ADDRESS' });
      if (
        body.changeType === 'BENEFICIARY' &&
        body.beneficiaries.some((item) => !item.name.trim())
      )
        return reply.code(400).send({ error: 'INVALID_BENEFICIARIES' });
      if (!validDate(body.requestedEffectiveDate))
        return reply
          .code(400)
          .send({ error: 'INVALID_REQUESTED_EFFECTIVE_DATE' });
      if (!validAllocation(body))
        return reply.code(400).send({ error: 'INVALID_ALLOCATION' });
      const session = await actorFor(request);
      const actor = session?.actor;
      if (!actor) return reply.code(401).send(unauthorized);
      const saved: RequestRecord = {
        ...body,
        id: randomUUID(),
        requesterId: actor.id,
        policyId: request.params.policyId,
        createdAt: new Date(now()).toISOString(),
      };
      await db.saveRequest(saved, now());
      return { request: saved };
    },
  );
  app.post<{ Params: Static<typeof EligibilityParams> }>(
    '/api/policies/:policyId/requests/:requestId/eligibility',
    {
      schema: {
        params: EligibilityParams,
        response: {
          200: EligibilityResultSchema,
          401: ErrorSchema,
          404: ErrorSchema,
          409: ErrorSchema,
          503: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const actor = (await actorFor(request))?.actor;
      if (!actor) return reply.code(401).send(unauthorized);
      try {
        const policy = await db.policy(actor.id, request.params.policyId);
        if (!ownsPolicy(actor, policy))
          return reply.code(404).send({ error: 'NOT_FOUND' });
        const saved = await db.requestFor(
          actor.id,
          policy.id,
          request.params.requestId,
        );
        if (!saved) return reply.code(404).send({ error: 'NOT_FOUND' });
        const checked = Value.Check(RequestRecordSchema, saved)
          ? (saved as RequestRecord)
          : undefined;
        const rejected = validateEligibilityRequest(policy, saved);
        if (rejected || !checked)
          return reply.code(409).send({
            error: rejected?.reasonCodes.includes('POLICY_EXPIRED')
              ? 'POLICY_EXPIRED'
              : 'INVALID_REQUEST',
          });
        const [policyResult, ruleResult] = await Promise.allSettled([
          retrievePolicyEvidence(evidenceStore, policy, checked.changeType),
          retrieveRules(
            ruleStore,
            policy.id,
            checked.changeType,
            checked.requestedEffectiveDate,
          ),
        ]);
        if (policyResult?.status === 'rejected')
          app.log.error(
            { err: policyResult.reason },
            'Policy evidence retrieval failed',
          );
        if (ruleResult?.status === 'rejected')
          app.log.error({ err: ruleResult.reason }, 'Rule retrieval failed');
        const policyEvidence =
          policyResult?.status === 'fulfilled'
            ? policyResult.value
            : { status: 'UNAVAILABLE' as const, citations: [] };
        const rules =
          ruleResult?.status === 'fulfilled'
            ? ruleResult.value
            : { status: 'UNAVAILABLE' as const, sourceIds: [], citations: [] };
        const decision = decideEligibility(
          policy,
          saved,
          rules,
          policyEvidence,
        );
        const sourceVersions =
          'sourceVersions' in rules ? rules.sourceVersions : [];
        const ruleVersions = sourceVersions.map(({ ruleId, version }) => ({
          ruleId,
          version,
        }));
        await db.audit(actor.id, 'eligibility-check', now(), {
          policyId: policy.id,
          requestId: request.params.requestId,
          outcome: decision.outcome,
          reasonCodes: decision.reasonCodes,
          policySources: policyEvidence.source ? [policyEvidence.source] : [],
          ruleSources: sourceVersions,
          ruleVersions,
        });
        return decision;
      } catch (error) {
        app.log.error({ err: error }, 'Eligibility storage failed');
        return reply.code(503).send({ error: 'ELIGIBILITY_UNAVAILABLE' });
      }
    },
  );
  app.get('/openapi.json', { schema: { hide: true } }, async () =>
    app.swagger(),
  );
  await app.ready();
  return app;
}
