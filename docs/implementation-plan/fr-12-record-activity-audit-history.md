---
title: FR-12 customer change history and audit
type: feature
ticket: fr-12-record-activity-audit-history
created: 2026-11-24
status: built
baseline_revision: 2343ba58f9d6634ed2e8dde6a88755eb9849f437
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/fr-12-record-activity-audit-history.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - docs/DESIGN_STANDARD.md
  - docs/VISUAL_UX_CONSTRAINTS.md
  - _bmad-output/initiative-customer-authentication/ux-fr-09-12/DESIGN.md
  - _bmad-output/initiative-customer-authentication/ux-fr-09-12/EXPERIENCE.md
  - design/page/change-history.html
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-11 persists final proposal decisions, but customers cannot see approved changes in one history page. Existing audit events also need enough identifiers and source versions to explain the endorsement path.

**Approach:** Read approved proposal snapshots through a session-scoped API, present them in the existing UX pattern, and complete relevant audit metadata without changing proposal decisions or policy facts.

## Boundaries & Constraints

**Always:** Only the authenticated owner sees approved records, newest first with stable ties. Detail links retain the recorded proposal snapshot. Failed reads are errors, never empty success. Audit uses synthetic data and excludes secrets.

**Never:** Derive history from current policy facts, list rejected or pending proposals, recalculate quote, update coverage, or bind a policy.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Approved history | Narin has two approved proposals | Both appear newest first with policy, change, decision time and detail links | None |
| Hidden records | Rejected, pending and Mali proposals exist | Narin receives none of those | Cross-owner detail is 404 |
| No records | Owner has no approvals | Empty list and useful UI state | No false error |
| Session or storage failure | Signed out or database unavailable | No history leak | 401 or 503; retry UI for 503 |
| Audit | Access, assessment, quote, proposal and decision flow | Actor/action/time and relevant IDs, outcome, citations or rating version recorded | No secrets or fabricated calculation |

</frozen-after-approval>

## Code Map

- `apps/api/src/db.ts` — reuse FR-10/11 proposal rows and transactional audit; add approved-history read scoped by requester.
- `apps/api/src/app.ts` — session-guarded history schema/route; enrich policy-read metadata; preserve proposal guards.
- `apps/api/src/*integration.test.ts` — real database contract, owner isolation, order, errors and audit assertions.
- `apps/web/src/lib/{api.ts,api-types.ts,queries.ts,routes.ts}` — typed history read, query key and route map.
- `apps/web/src/endorsement/` and `apps/web/src/app/` — focused history component/page and policy navigation.
- `e2e/` — browser owner, empty/error, detail, and non-binding checks; screenshots and visual baselines where applicable.
- `docs/API_DEVELOPMENT.md` — history endpoint and audit behavior.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/api/src/history.integration.test.ts` — write failing owner/approved/order/error/audit tests first.
- [ ] `apps/api/src/db.ts`, `apps/api/src/app.ts` — add scoped history read and audit metadata to make API tests pass.
- [ ] `apps/web/src/endorsement/ChangeHistory.test.tsx` — write failing loaded/empty/error/accessibility tests.
- [ ] `apps/web/src/lib/`, `apps/web/src/endorsement/`, `apps/web/src/app/` — implement typed hook, page, navigation and styles.
- [ ] `e2e/history.spec.ts` — prove UI/API boundary and attach screenshots; compare reviewed desktop/narrow visuals.
- [ ] `docs/API_DEVELOPMENT.md` — document endpoint, ordering, data source and non-binding boundary.

**Acceptance Criteria:**
- Given a signed-in owner with approved proposals, when history opens, then only their approved snapshots appear in stable newest-first order and links open their recorded details.
- Given no approvals or a failed read, when history opens, then empty and retry states differ and disclose no foreign data.
- Given a complete flow, when audit is inspected, then events retain the required identifiers and evidence without secrets or fictitious quote calls.
- Given approval, when history is read, then underlying policy facts and coverage remain unchanged.

## Implementation Notes

- Reused FR-10/11 persisted proposal snapshots for approved history; no schema migration or policy mutation. Scoped the query by session actor and `APPROVED`, sorted by decision time and proposal ID. A malformed stored snapshot fails as unavailable rather than becoming an apparent empty history.
- Added typed history client, query invalidation after decisions, page navigation, value-bearing change summaries, empty/error states and non-binding notice. Completed policy/request/assessment/quote/proposal audit metadata without recording credentials or request address in audit.
- Red/green: missing `approvedHistory` method, missing OpenAPI route, missing calculation audit, and missing history component each failed first and passed after implementation. Review patches added 503 for session storage failure, distinct values for same-type approvals, and public-route owner/order checks.
- Reviewed the desktop and 375px history screenshots against the existing history mockup and UX spines. Windows Chromium baselines live beside `e2e/history.spec.ts`; each visual test attaches the baseline and current image to its report.
- CI pass 1 exposed a pre-existing FR-11 integration fixture left in the shared database with an intentionally incomplete approved payload. The history API correctly returned `HISTORY_UNAVAILABLE`; the FR-11 test now deletes only the rows and audit events it creates in `afterAll`. Focused FR-11/FR-12 integration tests passed 7/7 after that fix.

## Plan Change Log

## Review Triage Log

- Quick review, pass 1: 0 high, 3 medium, 0 low, 1 false.
- **medium / patch** `apps/api/src/app.ts`: session lookup for `/api/history` is outside the storage-error catch; a database outage can return 500 instead of documented 503. Move lookup inside the protected block while preserving 401 for a valid missing session.
- **medium / patch** `apps/web/src/endorsement/ChangeHistory.tsx`: rows show only the change type; two approvals of the same type cannot be distinguished. Show a concise proposed action/value from the persisted request.
- **false** `apps/api/src/db.ts`: proposal-create and proposal-present already store `proposal.citations` with policy/rule source IDs and versions. The ticket requires cited source versions, not every uncited retrieval candidate; adding a second source list would duplicate evidence.
- **medium / patch** `e2e/history.spec.ts`: browser tests do not assert foreign approved rows or stable ordering, and the direct repository integration test does not prove HTTP authorization. Add focused API/browser checks for these boundaries.

## Verification

**Commands:**
- `npm run test -w apps/api` — API/integration green against isolated PostgreSQL.
- `npm run test -w apps/web` — history component states green.
- `npm run typecheck` — all workspaces typecheck.
- `npm run format:check` — Prettier clean.
- `npm run build` — web production build.
- `npm run test:e2e` — browser history, owner and detail scenarios; dated HTML report.

**Results (2026-11-24, Asia/Bangkok):**
- API: focused history integration 5/5 passed. Full remote-Neon run passed 113/114; the pre-existing FR-05 80-case evaluation exceeded the local 20-second timeout. Its focused rerun with 180-second timeout passed 2/2 (80/80 applicable cases and 20/20 safety cases). CI PostgreSQL remains the full-suite gate.
- Web: 14 files, 51/51 passed. Typecheck, format check, and production build passed.
- Browser: full Chromium run 45 passed, 6 platform-specific visuals skipped. Report: `test-results/fr-12-record-activity-audit-history/report-20261124164429/e2e-20261124164429.html`. FR-12 desktop and 375px visual baselines passed locally on Windows; history scenarios include approved order, distinct changes, foreign history/detail denial, empty state, failure state, and unchanged policy.
- CI pass 1: tests/typecheck/format/build passed, browser E2E failed because the FR-11 test leaked an invalid approved fixture. Fixture cleanup was added; CI rerun is the final gate.

| Ticket criterion | Evidence | Result |
|---|---|---|
| Approved owner history, stable order, persistence | `history.integration.test.ts`, `history.spec.ts` owner flow | Passed across a newly built app instance and browser reload; process restart not run locally |
| Session, owner isolation, empty and storage failure | `history.integration.test.ts` public routes, `history.spec.ts` foreign/empty/failure | Passed |
| Accessible page, narrow layout, non-binding detail | `ChangeHistory.test.tsx`, `history.spec.ts`, Windows visual baselines | Passed |
| Audit actor/action/time, IDs, evidence, conditional calculation, no secrets | `history.integration.test.ts`, `proposal.test.ts`, existing FR-08/09/10/11 integration tests | Passed; CI full-suite gate pending |
| Owner-scoped reads and unchanged policy | `history.integration.test.ts`, `history.spec.ts` | Passed |
