---
title: FR-09 synthetic rating calculator
type: feature
ticket: fr-09-calculate-premium-impact-mock-quote
created: 2026-11-24
status: built
baseline_revision: 8761eba858681dc21765f9978877bd418bcfeb0e
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/fr-09-calculate-premium-impact-mock-quote.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - docs/ADR.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-08 can assess requests, but no versioned synthetic rating data or separate calculation service exists. Customers cannot review exact, traceable payment or rider impact.

**Approach:** Add a deterministic internal HTTP calculator with OIC-inspired, explicitly synthetic fixtures. Fastify performs owner and fresh assessment gates, reconciles structured policy facts, invokes the service only for affected eligible changes, validates its response, and returns an API quote for FR-10.

## Boundaries & Constraints

**Always:** Keep numerical rates synthetic, traceable to `synthetic-rating-v1`, and use exact arithmetic. Authorize before retrieval or service calls. Preserve FR-08 eligibility rules and existing policy data. Audit calls and failures without secrets.

**Never:** Treat OIC reference data as rates for fictional products; use vector similarity or AI for money; expose calculator directly to browser; write policy coverage or a proposal in FR-09.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Payment change | Narin monthly to annual, fresh CAN_PROCEED | THB 1,215 monthly to THB 13,500 annual; annualized THB 14,580 to THB 13,500; benefits unchanged | Service unavailable gives distinct failure |
| No-call | Eligible address or beneficiary | Explicit UNCHANGED premium/benefits; zero calculator calls | No fabricated amount |
| Rider and all schedules | Direct calculator contract | Add/remove and four frequencies produce exact repeatable values | Duplicate/missing fixture rejected |
| Blocked | Other owner, invalid/expired request, CANNOT_PROCEED or NEEDS_REVIEW | No quote and no calculator call | 401/404/409 or assessment response, as appropriate |
| Bad data | Missing/mismatched policy facts, invalid/stale response, timeout | No quote or proposal | Distinct calculation failure, auditable |

</frozen-after-approval>

## Code Map

- `apps/api/src/app.ts:655` — eligibility route has the required owner, request, evidence, rules, decision, and audit gates. Reuse its workflow; do not fork the decision logic.
- `apps/api/src/db.ts:273,382,395` — owner-scoped policy/request and JSON audit; structured `productTerms`/`coverageTerms` map into `Policy` in `auth/data.ts`.
- `apps/api/src/endorsement/eligibility.ts:126` — FR-08 decision stays authoritative. Current rules allow only monthly/annual frequency and refer rider requests; direct calculator tests cover otherwise unreachable scenarios.
- `apps/api/src/eligibility.integration.test.ts` — Fastify inject + isolated PostgreSQL test pattern; extend for quote gates.
- `playwright.config.ts`, `scripts/run-e2e.mjs`, `e2e/api-boundaries.spec.ts` — launch calculator with API/web and test public API in browser runner; no FR-09 UI screenshots required.
- `apps/ai/corpus/policies.json`, `apps/api/src/load-corpus.ts` — synthetic product and coverage baselines to reconcile; do not use their embeddings for amounts.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/calculator/src/calculator.test.ts` then `apps/calculator/src/calculator.ts` — red/green deterministic fixture selection and arithmetic; test four schedules, add/remove, rounding, exact Narin example, invalid and repeated inputs.
- [ ] `apps/calculator/src/server.test.ts` then `apps/calculator/src/server.ts` and workspace files — red/green versioned HTTP request/response validation, health, errors; run as internal service.
- [ ] `apps/api/src/quote.integration.test.ts` then `apps/api/src/app.ts`/`endorsement/quote.ts` — red/green owner/request/assessment gate, no-call result, structured reconciliation, calculator client timeout/schema validation, audit.
- [ ] `playwright.config.ts` and `e2e/quote.spec.ts` — launch service and verify public quote, no-call, unauthorized, and referred scenarios through the API; retain existing web flows.
- [ ] `docs/API_DEVELOPMENT.md`, `README.md`, `docs/implementation-plan/fr-09-calculate-premium-impact-mock-quote.md` — document local start, contract, OIC-derived data shape, synthetic rates, criterion coverage and dated E2E report.

**Acceptance Criteria:**
- Given the same validated fixture and request, when calculated twice, then every amount and rating version is identical.
- Given an authorized request with a fresh positive assessment, when quote is requested, then only affected values are calculated and returned with exact before/after values.
- Given any failed gate or calculator failure, when quote is requested, then no successful quote or proposal is returned and no policy data changes.

## Implementation Notes

- Added `@pea/calculator` with exact `synthetic-rating-v1` fixture lookup, integer-satang arithmetic, HTTP `POST /v1/quote`, and loopback-only local listener. OIC sources inform data shape; all rates are invented for the demo.
- Added owner-scoped `POST /api/policies/:policyId/requests/:requestId/quote`. It reruns FR-08 assessment, returns `UNCHANGED` for address/beneficiary, and calls the calculator only for a positive payment/rider change. Existing FR-08 rules currently refer rider and disallow quarterly/semi-annual through the customer API.
- Fastify validates contract shape, version, current structured values, schedule and differences, then passes calculator monetary amounts unchanged. The calculator remains the sole rating authority. It records `quote-blocked`, `quote-unchanged`, `quote-calculated`, or `quote-failed` audit metadata without a policy or proposal write.
- Red/green: `calculator.test.ts` failed before implementation and passed after the calculator was added; `quote.contract.test.ts` failed before the route and passed after. Review added whole-file fixture validation, true cross-owner E2E, structured mismatch/failure tests, and a real client timeout test.

## Plan Change Log

## Review Triage Log

- Quick review, pass 1: 0 high, 3 medium, 0 low, 1 false.
- `false` — `calculator-client.ts` does not independently recalculate fixture premiums. The ticket makes the separate calculator the monetary authority and requires Fastify to pass returned amounts unchanged. Fastify checks schema, version, current values, schedule and signed differences; calculator unit and HTTP tests assert exact fixture amounts. Recomputing in Fastify would create a second pricing engine.
- `medium / patch` — `e2e/quote.spec.ts` used an unknown request for the foreign-owner check. Replace it with an existing Narin request so 404 proves the ownership boundary.
- `medium / patch` — `calculator.ts` validated only the selected fixture. Validate the entire loaded fixture file, including duplicate policy/product/version keys and malformed entries.
- `medium / patch` — FR-09 criterion mapping, test evidence and dated E2E report were absent from the plan. Record verified and uncovered portions after final tests.

## Verification

**Commands:**
- `npm test` — all workspace tests pass; record focused red/green cycles.
- `npm run typecheck` — API, calculator and web types pass.
- `npm run format:check` — changed code formatted.
- `npm run build` — web build passes.
- `E2E_TICKET_ID=fr-09-calculate-premium-impact-mock-quote npm run test:e2e` — browser runner tests all existing flows plus FR-09 API scenarios and produces dated HTML report.

**Results (2026-11-24, isolated Neon `fr09_test`, Chromium on Windows):**

- Calculator: 10/10 passed; quote API integration: 6/6 passed; calculator-client tests: 2/2 passed. Existing API test files completed individually against the isolated schema. A combined remote-Neon API run stalled after earlier files passed; CI's local PostgreSQL run remains the final complete-suite gate.
- Web: 40/40 passed; root ticket workflow: 17/17 passed. Typecheck, format check, and production web build passed after review fixes.
- Full browser E2E: 34 passed, 4 platform-specific visual tests skipped. Report: `test-results/fr-09-calculate-premium-impact-mock-quote/report-20261124103820/e2e-20261124103820.html`.
- Focused browser E2E after owner-boundary fix: 2/2 passed. Report: `test-results/fr-09-calculate-premium-impact-mock-quote/report-20261124104631/e2e-20261124104631.html`.

| Ticket criterion | Evidence and layer | Status / limit |
|---|---|---|
| Owner and fresh FR-08 gate | `quote.integration.test.ts`: eligible owner, signed-out/foreign, expired, `CANNOT_PROCEED`, `NEEDS_REVIEW`; `e2e/quote.spec.ts` actual foreign request | Passed; repeated requests use fresh assessment |
| No-call changes and affected values | API integration for address and beneficiary; E2E address; calculator unit for payment and rider | Passed; rider remains referred by current FR-08 rules |
| Versioned fixtures and exact lookup | `calculator.test.ts`: all fixture paths, unknown/stale/mismatch, malformed/unselected/duplicate entries; API structured mismatch | Passed; fixture is synthetic, OIC-inspired only |
| Internal HTTP contract and validated pass-through | `server.test.ts`, `calculator-client.test.ts`, `quote.contract.test.ts`, API integration and E2E | Passed; calculator is trusted monetary authority, API checks consistency without repricing |
| Exact values, schedules, repeatability | `calculator.test.ts` exact Narin example, four frequencies, rider add/remove, rounding and same inputs | Passed; quarterly/semi-annual and rider exercised directly because FR-08 currently gates them |
| Failure, no proposal or policy write | API integration mismatch/invalid/failing calculator, client timeout test, policy before/after assertion; E2E referred and foreign boundaries | Passed; FR-10 proposal does not exist yet, so its creation gate is an FR-10 integration check |
