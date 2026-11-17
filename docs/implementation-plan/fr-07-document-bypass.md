---
title: FR-07 document bypass
type: feature
ticket: fr-07-bypass-document-verification-mock
created: 2026-11-17
status: in-progress
baseline_revision: 3e35e6d69684f9e8fd90bf60ac7cb007afebb586
route: full
route_source: pinned
risk: high
review: quick
review_source: auto
lenses_ran: []
review_loop_iteration: 0
context:
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - _bmad-output/initiative-customer-authentication/ux-mock-verification/DESIGN.md
  - _bmad-output/initiative-customer-authentication/ux-mock-verification/EXPERIENCE.md
---

## Intent
**Problem:** A customer cannot see the document check bypass for a recorded synthetic endorsement request.

**Approach:** Add an authenticated API action for an owned active policy and recorded request, persist its `BYPASSED_MOCK` audit event, and display the result after request creation.

## Boundaries & Constraints
**Always:** Session-derived actor, owner check, active policy check, explicit mock wording, durable audit before success.

**Never:** Accept a document, inspect a file, call an identity provider, alter policy coverage, or imply verification.

## I/O & Edge-Case Matrix
| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Authorized | Valid session, own active policy | `BYPASSED_MOCK` and disclosure | Audit failure returns server error |
| Session absent | No valid session | `401` | No result or successful audit |
| Policy hidden | Unknown or other owner's policy | `404` | Same response |
| Expired | Own expired policy | `409` | No result |
| Request hidden | Unknown or another actor's request ID | `404` | No result or successful audit |

## Code Map
- `apps/api/src/app.ts` — Fastify route and guards.
- `apps/api/src/db.ts` — verify request ownership within policy.
- `apps/web/src/lib/api.ts` and `queries.ts` — typed API client and mutation.
- `apps/web/src/endorsement/RequestForm.tsx` — customer result after request save.

## Tasks & Acceptance
**Execution:**
- [ ] Add API and UI tests for guards, durable audit, and disclosure.
- [ ] Add route schema, guard ordering, and audit call.
- [ ] Add client mutation and result state to request screen.
- [ ] Regenerate OpenAPI client types and update docs.

**Acceptance Criteria:**
- Given a valid customer session and owned active policy, when the bypass runs, then a durable `BYPASSED_MOCK` event is recorded and the UI says no document was checked.
- Given missing session, other owner, or expired policy, when the bypass runs, then it returns the respective non-disclosing rejection.
- Given audit failure, when the bypass runs, then it does not report success.

## Implementation Notes
The bypass is available after FR-02 request creation. FR-08 will consume this status later.

## Plan Change Log

## Review Triage Log
