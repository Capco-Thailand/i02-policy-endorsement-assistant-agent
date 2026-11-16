---
title: 'FR-02 Create Endorsement Request'
type: feature
ticket: fr-02-create-endorsement-request
created: '2026-11-16'
status: draft
baseline_revision: 'c8b769b375e3bd2f05fb54aa7b589f3566e610e8'
route: full
route_source: auto
risk: high
review: ''
review_source: ''
lenses_ran: []
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
- [ ] `apps/api/src/endorsement/*.test.ts` — write one focused failing `inject` case for active request capture; implement the minimal route/store; repeat red/green for each remaining type, validation, and access boundary.
- [ ] `apps/api/src/endorsement/`, `apps/api/src/app.ts` — implement session actor, ownership/status guards, strict selected-type validation, server ID/time, and one record per successful submission. Publish documented 200/400/401/404/expired responses; regenerate OpenAPI client types.
- [ ] `apps/web/src/endorsement/*.test.tsx` — write focused failing component cases for entry from active detail, conditional inputs, replacement beneficiaries/100% total, error retention, expired block, pending-checks confirmation, and accessibility.
- [ ] `apps/web/src/lib/`, `apps/web/src/policies/PolicyDetail.tsx`, `apps/web/src/app/policies/`, `apps/web/src/endorsement/`, `apps/web/src/app/styles.css` — build the typed mutation, form, focus/error behavior, confirmation, and narrow-width layout; run focused tests green after each slice.
- [ ] `docs/API_DEVELOPMENT.md`, `docs/implementation-plan/fr-02-create-endorsement-request.md` — document request/error contract and record per-criterion verification with red/green evidence. Update ticket/PRD only if requirements change, then sync Issue #52.

**Acceptance Criteria:**
- Given an owned active policy, when the customer opens request entry, then the policy ID/status remain visible and exactly four change choices reveal only their fields; beneficiary replacement totals exactly 100%.
- Given valid input for any supported type, when submitted once, then one request with server ID, session actor, policy, selected data, date and creation time is stored and the UI says recorded and pending checks.
- Given invalid or mixed fields, unsupported type, or malformed calendar date, when submitted, then a field/API error appears, browser entries remain, and no request is stored.
- Given an invalid session, foreign policy, or forged requester, when submitted, then no record or foreign facts are returned.
- Given an expired linked policy, when viewed or submitted directly, then no request action or record is possible and the UI explains the expired status.
- Given a successful request, when policy data is read, then it is unchanged, with no quote, draft, approval, or coverage binding. API and UI tests verify this.

## Implementation Notes

## Plan Change Log

## Review Triage Log

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
