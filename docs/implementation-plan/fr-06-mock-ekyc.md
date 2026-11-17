---
title: FR-06 simulated identity check
type: feature
ticket: fr-06-verify-customer-identity-mock-ekyc
created: 2026-11-17
status: in-review
baseline_revision: 3e35e6d
route: full
risk: high
review: thorough
context:
  - docs/tickets/fr-06-verify-customer-identity-mock-ekyc.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - _bmad-output/initiative-customer-authentication/ux-mock-verification/DESIGN.md
  - _bmad-output/initiative-customer-authentication/ux-mock-verification/EXPERIENCE.md
---

## Intent
**Problem:** The endorsement flow has no mock identity result to present or audit.

**Approach:** Add a deterministic synthetic scenario evaluator behind an authenticated policy route, persist a small audit metadata record, and expose the result in the customer request flow.

## Boundaries & Constraints
**Always:** Authorize session and policy before evaluation; use synthetic scenarios; identify the result as simulated.

**Never:** Accept documents or biometric data, establish a session, create a quote/draft, or change a policy.

## I/O & Edge-Case Matrix
| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Pass | Owned active policy; all-pass fixture | VERIFIED with reason and mock disclosure; audit | N/A |
| Fail/review | Mismatch, expiry, failed or inconclusive liveness | FAILED or REVIEW_REQUIRED; audit | No downstream pass |
| Guard | Missing session, unowned or expired policy | 401, 404, or 409 | No successful audit |
| Write failure | Audit insert fails | No successful result | Error response |

## Code Map
- `apps/api/src/app.ts` — authenticated route and schema.
- `apps/api/src/db.ts`, `apps/api/sql/001_initial.sql` — durable audit metadata.
- `apps/web/src/endorsement/RequestForm.tsx` — visible mock outcome in customer flow.

## Tasks & Acceptance
**Execution:**
- [ ] Add public API test cases for fixture outcomes, authorization, and audit before route code.
- [ ] Add synthetic evaluator and route schema with audit metadata persistence.
- [ ] Add API client, query hook, and a focused request-page section with accessible outcome states.
- [ ] Add component/browser coverage and run checks.

**Acceptance Criteria:**
- Given an owned active policy, when a synthetic scenario runs, then the expected outcome, reason, mock disclosure, and audit entry are present.
- Given invalid access or policy, when a check is requested, then no successful result is returned.
- Given a customer on the request page, when a check completes, then the result is shown as simulated.

## Implementation Notes
Audit metadata is a JSON object limited to policy ID, outcome, and reason. FR-07 will reuse the optional audit metadata argument.

## Verification
- API scenario unit test: 6 passed; initial run could not start because dependencies were absent. After `npm ci`, focused test passed.
- Web component/request tests: 7 passed. Initial run exposed nested `role=status`; fixed the ARIA region and reran green.
- Targeted Prettier check, root typecheck, and production build passed.
- Database integration and browser E2E require a PostgreSQL test database. CI will run them; local environment has neither `TEST_DATABASE_URL` nor Docker. The new browser scenario covers the customer-facing result.

## Plan Change Log
## Review Triage Log
