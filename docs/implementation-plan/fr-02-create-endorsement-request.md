---
title: 'FR-02 Create Endorsement Request'
type: feature
ticket: fr-02-create-endorsement-request
created: '2026-11-16'
status: built
baseline_revision: 'c8b769b375e3bd2f05fb54aa7b589f3566e610e8'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/fr-02-create-endorsement-request.md
  - _bmad-output/initiative-customer-authentication/ux-fr-02/DESIGN.md
  - _bmad-output/initiative-customer-authentication/ux-fr-02/EXPERIENCE.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent
**Problem:** Customers can inspect policies but cannot record a change request. Capture must not imply approval or change coverage.

**Approach:** Add an authorized endpoint and active-policy form for four change types. Validate fields and date, store a synthetic record, and show pending-checks confirmation.

## Boundaries & Constraints
**Always:** Derive requester from the session; check ownership and `ACTIVE` status before any write; reject unknown and unowned IDs identically; record only the selected change type's fields; preserve entered values on recoverable errors; keep request records separate from policies.

**Never:** Trust a requester/customer/role claim, accept `EXPIRED` policy submissions, mutate a policy, quote, draft, approve, bind coverage, or claim the request passed later checks.

## I/O & Edge-Case Matrix
| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Valid active request | Owned `ACTIVE` policy, valid date, one supported type with complete fields | One server-ID request with actor, policy, type, selected data, date/time; pending-checks confirmation | No policy write |
| Invalid fields | Missing/invalid date, incomplete or mixed type data, invalid allocation | No record; field errors; browser values retained | `400` validation response |
| Unauthenticated/unowned | Missing/expired session or unknown/foreign ID, including forged claims | No record or policy details | `401` or identical non-disclosing `404` |
| Expired policy | Owned `EXPIRED` ID | No form action or record | API rejects direct submission |
| Service failure | Request endpoint unavailable | No success claim; values remain for retry | Distinct retry feedback |

</frozen-after-approval>

## Code Map
- `apps/api/src/app.ts` — existing Fastify/TypeBox routes, session lookup, ownership check, and audit. Add the request route; authorize before validation/write and document responses.
- `apps/api/src/auth/data.ts`, `guards.ts` — existing synthetic policy status/ownership. Reuse without changing policy facts. Scope the synthetic request store per app instance.
- `apps/api/src/endorsement/*.ts`, `*.test.ts` — request types, validation, store, and `inject` tests for four types and rejection boundaries.
- `apps/api/src/export-openapi.ts`, `apps/web/src/lib/api-types.ts` — regenerate client types.
- `apps/web/src/lib/api.ts`, `queries.ts`, `routes.ts` — typed mutation and route helper; distinguish validation, expired, and service errors.
- `apps/web/src/app/policies/[policyId]/page.tsx`, `apps/web/src/policies/PolicyDetail.tsx` — add active-only request action.
- `apps/web/src/app/policies/[policyId]/request/page.tsx`, `apps/web/src/endorsement/` — form, type-specific fields, beneficiary rows, and confirmation; keep policy context visible.
- `apps/web/src/app/styles.css`, `apps/web/src/endorsement/*.test.tsx` — responsive styling and component tests for type/state behavior.

## Tasks & Acceptance
**Execution:**
- [x] `apps/api/src/endorsement/*.test.ts` — write one focused failing `inject` case for active request capture; implement the minimal route/store; repeat red/green for each remaining type, validation, and access boundary.
- [x] `apps/api/src/endorsement/`, `apps/api/src/app.ts` — implement session actor, ownership/status guards, strict selected-type validation, server ID/time, and one record per successful submission. Publish documented 200/400/401/404/expired responses; regenerate OpenAPI client types.
- [x] `apps/web/src/endorsement/*.test.tsx` — write focused failing component cases for entry from active detail, conditional inputs, replacement beneficiaries/100% total, error retention, expired block, pending-checks confirmation, and accessibility.
- [x] `apps/web/src/lib/`, `apps/web/src/policies/PolicyDetail.tsx`, `apps/web/src/app/policies/`, `apps/web/src/endorsement/`, `apps/web/src/app/styles.css` — build the typed mutation, form, focus/error behavior, confirmation, and narrow-width layout; run focused tests green after each slice.
- [x] `docs/API_DEVELOPMENT.md`, `docs/implementation-plan/fr-02-create-endorsement-request.md` — document request/error contract and record per-criterion verification with red/green evidence. Update ticket/PRD only if requirements change, then sync Issue #52.

**Acceptance Criteria:**
- Given an owned active policy, when the customer opens request entry, then the policy ID/status remain visible and exactly four change choices reveal only their fields; beneficiary replacement totals exactly 100%.
- Given valid input for any supported type, when submitted once, then one request with server ID, session actor, policy, selected data, date and creation time is stored and the UI says recorded and pending checks.
- Given invalid or mixed fields, unsupported type, or malformed calendar date, when submitted, then a field/API error appears, browser entries remain, and no request is stored.
- Given an invalid session, foreign policy, or forged requester, when submitted, then no record or foreign facts are returned.
- Given an expired linked policy, when viewed or submitted directly, then no request action or record is possible and the UI explains the expired status.
- Given a successful request, when policy data is read, then it is unchanged, with no quote, draft, approval, or coverage binding. API and UI tests verify this.

## Implementation Notes

FR-02 acceptance traceability (AC1–AC6 follow the acceptance bullets above):

| Criterion | Evidence and layer | Expected and latest result | Uncovered check |
| --- | --- | --- | --- |
| AC1 — active entry and fields | `PolicyDetail.test.tsx`, `RequestForm.test.tsx` (component) | Active-only entry, four choices, selected fields, total allocation; passed. | Browser flow and narrow viewport. |
| AC2 — valid capture | `request.test.ts` (API), `RequestForm.test.tsx` (component) | Four types save selected data with server ID/time/actor; pending-checks copy; passed. | Integrated browser submission. |
| AC3 — invalid input | `request.test.ts` (API), `RequestForm.test.tsx` (component) | Blank/mixed/unsupported data, invalid dates and allocations create no record; values remain on retry; passed. | Browser error focus and keyboard. |
| AC4 — access and spoofing | `request.test.ts` (API) | Missing/expired session yields `401`; unknown/foreign IDs yield identical `404`; forged identity cannot change actor; passed. | Browser session failure during submission. |
| AC5 — expired policy | `request.test.ts` (API), `RequestForm.test.tsx` (component) | Direct API rejects with no write; initial and mid-form expiry remove request action; passed. | Browser direct URL. |
| AC6 — no policy/coverage write | `request.test.ts` (API), route and UI inspection | Policy detail unchanged after capture; only request store/audit written; no quote, draft, approval, or binding route exists; passed. | Browser confirmation view and downstream integration. |

Browser follow-up, 2026-11-16: `npm run test:e2e` passed 17/17 Chromium scenarios twice; latest local HTML: `test-results/report-20261116135708/e2e-20261116135708.html`. `e2e/customer-flows.spec.ts` covers active entry, all four submissions, pending confirmation, invalid allocation retained for correction, and expired direct URL. `e2e/api-boundaries.spec.ts` covers session and ownership rejections, malformed date, forged requester, unchanged policy facts, and server-recorded actor/ID/time. `e2e/visual.spec.ts` compares desktop and 375px request entry to reviewed macOS Chromium baselines. The CI artifact preserves each implementation PR run. Remaining: browser focus/keyboard error handling, session loss during submission, and downstream quote/draft checks when those features exist. These remain unverified.

## Plan Change Log

## Review Triage Log

Quick review: 3 findings verified and patched; none deferred.
- **medium / patch** — Submit enabled with missing date or selected-type fields. Derived readiness now disables it until required data is complete; focused component tests cover transitions.
- **medium / patch** — Allocation tolerance admitted 99.9999999999. API and UI now require a total exactly equal to 100; boundary test fails before and passes after.
- **medium / patch** — Removable beneficiary rows used index keys. Stable row IDs preserve each row's DOM and input identity after removal; interaction test passes.

## Design Notes
Use focused type-specific sections and beneficiary rows. Keep confirmation on the same route; reuse the policy detail and session gate.

## Verification
**Commands:**
- `npm run test -w apps/api` — red/green API slices and all request/access cases pass.
- `npm run test -w apps/web` — red/green component slices and auth/policy regressions pass.
- `npm run typecheck` — schemas and generated client usage align.
- `npm run format:check` — scoped code formatted.
- `npm test` — repository suite passes.
- `npm run build` — Next.js production build passes.
- `npm run ticket:preflight -- docs/tickets/fr-02-create-endorsement-request.md` — Issue and handoff valid before implementation PR.

**Manual checks (if no CLI):**
- Compare active, expired, and recorded states at desktop and 320px; verify keyboard, labels, errors, and non-binding copy. Record unavailable browser checks.

### Implementation verification (2026-11-16)
- Red/green: API address capture failed `404` before route, then passed; blank address failed `200` before validation, then passed; unsupported `toString` type failed `500`, then passed with `400`. UI active-detail entry failed on missing link, then passed; form test failed on missing component, then passed.
- Active entry, four options, conditional fields, beneficiary total, expired block, retry value retention, single in-flight submission, field focus, and pending-checks confirmation: `apps/web/src/policies/PolicyDetail.test.tsx` and `apps/web/src/endorsement/RequestForm.test.tsx` pass.
- Four successful request types, selected data, server ID/time/session actor, malformed date, mixed/unsupported fields, ownership/session/expired boundaries, and unchanged policy facts: `apps/api/src/endorsement/request.test.ts` passes. No quote, draft, approval, or coverage-write route was added. A mid-form `POLICY_EXPIRED` rejection failed once and passed after the form began switching to an expired state.
- Review fixes: readiness and stable-row tests were red before correction; allocation boundary returned `200` before exact validation. After correction, focused and full runs passed. Gates: API 16 tests, web 22 tests, `npm run typecheck`, `npm run format:check`, `npm test`, `npm run build`, and FR-02 ticket preflight passed. Browser viewport and keyboard walkthroughs were unavailable in this implementation run.
