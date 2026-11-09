---
title: 'Issue #3: Policy list, detail, access, and eligibility API'
type: feature
ticket: ''
created: '2026-11-09'
status: built
baseline_revision: '2c0d670a38d71dfd10601145305e0f44f13052a7'
route: full
route_source: pinned
risk: high
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
context:
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The API has no way for a synthetic policyholder to list or inspect owned policies or to check endorsement initiation eligibility. A caller must not learn another user's policy or beneficiary data.

**Approach:** Add deterministic synthetic policies, server-resolved mock user context, read-only list and detail routes, and a separate server-side initiation check. Keep the data store and contracts small enough to replace later.

## Boundaries & Constraints

**Always:** Read the user identity from an opaque demo token mapped to a user on the server. Check ownership before returning any policy data. Use stored `ACTIVE` or `EXPIRED` status as the only eligibility authority. Return monetary decimals as strings to preserve their exact synthetic values. Document schemas and error responses in OpenAPI.

**Never:** Trust a client-supplied owner ID, infer status from dates, create an endorsement draft, write a policy, or connect to a live insurer system.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Own policies | Valid demo token | `GET /policies` returns only owned policy summaries | Empty ownership returns `200 []` |
| Own detail | Owned policy ID | `GET /policies/:policyId` returns required fields and beneficiaries | Unknown or foreign ID returns `404` without data |
| Active initiation | Owned policy stored as `ACTIVE` | `POST /policies/:policyId/endorsements/initiate` returns `204` and creates nothing | Foreign ID returns `404` |
| Expired initiation | Owned policy stored as `EXPIRED` | Initiation is rejected | `409` and no draft |
| No session | Missing or invalid demo token | No policy data | `401` |
| Conflicting dates | Stored status differs from expiry date | Stored status controls eligibility | No date-based override |

</frozen-after-approval>

## Code Map

- `apps/api/src/app.ts` — registers Fastify, Swagger, health route, and common error handling; register policy routes here.
- `apps/api/src/app.test.ts` — existing health/OpenAPI smoke test; preserve it.
- `apps/api/src/server.ts` — process startup; no policy logic belongs here.
- `docs/tickets/PEA-001-policy-list-and-detail.md` — parent contract and synthetic-data boundary; frontend work remains outside this plan.

## Tasks & Acceptance

**Execution:**

- [x] `apps/api/src/policies/routes.test.ts` — add inject tests for authorization, fixtures, status decisions, response fields, and OpenAPI schemas.
- [x] `apps/api/src/policies/data.ts` — define deterministic synthetic users, opaque tokens, policies, beneficiaries, and owner associations in an in-memory repository.
- [x] `apps/api/src/policies/routes.ts` — implement token resolution, ownership checks, typed routes, schemas, and `401`/`404`/`409` results.
- [x] `apps/api/src/app.ts` — register policy routes after Swagger and preserve health behavior.
- [x] `apps/api/package.json` — include policy route tests in the API test script.
- [x] `docs/API_DEVELOPMENT.md` — document demo tokens, fixtures, route contracts, exact monetary values, and non-persistent initiation.

**Acceptance Criteria:**

- Given a valid demo session, when a policyholder lists policies, then only their owned records appear; an owner with none gets an empty array.
- Given an owned policy, when its detail is requested, then all required policy and beneficiary fields appear with stored status and exact monetary values.
- Given a foreign policy or missing session, when detail or initiation is requested, then the response discloses no policy or beneficiary fields.
- Given an owned active policy, when initiation is checked, then it succeeds without creating a draft; an expired policy is rejected even when its expiry date appears current.
- Given the running API, when OpenAPI JSON is requested, then all new routes and success/error schemas are present.

## Implementation Notes

- Used server-mapped demo bearer tokens and deterministic in-memory records; no policy or draft mutation is implemented.
- API route tests pass (5 tests). Strict API TypeScript build and full monorepo build pass.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**

- `npm run test:api` — all policy route and existing health tests pass.
- `npm run build --workspace @pea/api` — strict TypeScript build passes.
- `npm run build` — monorepo build remains green.

**Manual checks:**

- Inspect the API docs for the three routes and verify that the response examples contain synthetic data only.

## Code Review

### 2026-11-09

Review of `feat/gh-3-policy-api` against `main`: 7 files changed, 292 additions, 1 deletion. Five patch findings remain; one false finding was rejected.

- [x] [Review][Patch] Verify all policy detail fields, beneficiary fields, and the OpenAPI 200 schema [apps/api/src/policies/routes.test.ts:20]
- [x] [Review][Patch] Match the Bearer authentication scheme case-insensitively [apps/api/src/policies/data.ts:60]
- [x] [Review][Patch] Document bearer authentication in OpenAPI [apps/api/src/app.ts:8]
- [x] [Review][Patch] Cover rejection of an unknown demo token [apps/api/src/policies/routes.test.ts:7]
- [x] [Review][Patch] Verify foreign initiation returns the generic 404 body [apps/api/src/policies/routes.test.ts:35]

Rejected: The OpenAPI 204 response suggestion was false; generated output contains only a description and no response content schema.
