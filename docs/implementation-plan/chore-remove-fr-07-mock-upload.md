---
title: 'Remove FR-07 mock upload'
type: chore
ticket: chore-remove-fr-07-mock-upload
created: '2026-11-23'
status: in-review
baseline_revision: d30f0db0a2d1b7f2e5d83ac7dd3c01326e60baf4
route: full
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran: []
review_loop_iteration: 0
context:
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-07 upload UI and API remain after PRD 1.7 removed upload from the endorsement MVP. The old receipt also gates eligibility.

**Approach:** Remove the upload capability and its receipt dependency while preserving request authorization, rule retrieval, assessment audit, and historical audit rows.

## Boundaries & Constraints

**Always:** Keep synthetic policy data and existing ownership checks. Leave FR-08's broader new assessment contract to its own ticket. Preserve historical audit data.

**Never:** Delete audit rows, weaken access checks, or reintroduce an upload step through another screen.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Request recorded | Any supported change, no file | Assessment UI shown without upload control | No missing-receipt reason |
| Eligibility | Valid owned request, no receipt | Outcome depends on policy and rule checks only | Unresolved rules still do not pass |
| Former endpoint | Upload route request | Route absent from API/OpenAPI | No receipt audit written |
| Existing audit | Historical upload event | Existing row remains | No data migration |

</frozen-after-approval>

## Code Map

- `apps/web/src/endorsement/RequestForm.tsx`, `EligibilityCheck.tsx` — upload section and receipt wording/link.
- `apps/web/src/endorsement/DocumentUpload.tsx`, `apps/web/src/lib/api.ts`, `queries.ts`, `api-types.ts` — remove upload-only UI and typed client contract; regenerate API types.
- `apps/api/src/app.ts` — upload schema, route, OpenAPI customization, and receipt lookup in eligibility handler.
- `apps/api/src/db.ts`, `endorsement/eligibility.ts` — remove receipt lookup and decision gate; retain all other checks.
- `apps/api/src/*eligibility*.test.ts`, `apps/web/src/endorsement/*.test.tsx`, `e2e/*.spec.ts` — update observable request and assessment cases; remove upload-only coverage.

## Tasks & Acceptance

**Execution:**
- [ ] Update API and web tests first for no upload route, no receipt gate, and no upload UI; record red results.
- [ ] Remove upload-only route, schema, database lookup, UI component, client hook/method, and OpenAPI type; keep assessment checks and audit.
- [ ] Update browser scenarios to submit and assess without upload; preserve authorization and rule failure scenarios.
- [ ] Update FR-07 ticket and affected implementation notes to mark retirement; sync Issue #87 if requirements change.

**Acceptance Criteria:**
- Given an owned active-policy request without a receipt, when eligibility is checked, then the result depends on the existing policy and rule checks and never returns `MISSING_RECEIPT`.
- Given a customer records any supported change, when the request screen renders, then no upload control, upload guidance, receipt message, or upload link appears.
- Given a request to the former upload endpoint, when it reaches Fastify, then no upload route or OpenAPI operation exists and no new upload audit event is written.
- Given historical upload audit rows, when cleanup is applied, then those rows remain untouched.

## Implementation Notes

## Plan Change Log

## Review Triage Log

- 2026-11-23: Medium, patched — FR-08 design preview linked to retired upload and described a receipt gate; updated preview and index links.
- 2026-11-23: Medium, deferred — rule corpus still contains mock-receipt guidance. FR-05 evidence changes are outside this approved cleanup plan and need separate contract review.
- 2026-11-23: Low, deferred — `docs/TESTING_STANDARD.md` and `docs/backlog/README.md` still describe FR-07 as existing. The user explicitly excluded both files from this documentation change.
- 2026-11-23: Medium, patched — Windows `spawn EINVAL` prevented E2E; the runner now starts installed JavaScript CLIs through Node. Supplied Neon connection, system CA trust, synthetic rule load, and Chromium installation enabled the full run.

## Verification

**Commands:**
- `npm run test --workspaces --if-present` — affected API and web tests pass.
- `npm run typecheck` — TypeScript contracts pass.
- `npm run format:check` — formatting passes.
- `npm run test:e2e` — request and assessment browser scenarios pass without upload; record dated report and criterion coverage.

**Results (2026-11-23):** Focused API tests 12/12 and web tests 19/19 passed. With supplied `DATABASE_URL`, `npm test` passed: script tests 17/17, API 37/37 (32 isolated integration cases skipped without a separate `TEST_DATABASE_URL`), web 37/37. `npm run typecheck` passed. Full Chromium E2E: 23 passed, 4 platform-specific visual baselines skipped; [dated HTML report](../../test-results/chore-remove-fr-07-mock-upload/report-20261123120757/e2e-20261123120757.html). Changed source files pass Prettier; root `format:check` still reports 69 unrelated pre-existing files.

**Criterion coverage:** No upload UI and four change types: `e2e/customer-flows.spec.ts` request and FR-08 cases, passed. No receipt gate and historical receipt: `apps/api/src/endorsement/eligibility.test.ts` and `apps/api/src/eligibility.integration.test.ts` (integration skipped without isolated DB); browser address and payment outcomes passed without receipt. Former endpoint absent: `apps/api/src/document-upload.test.ts`, passed. Historical audit rows untouched: code review confirms no migration or delete; integration assertion remains unrun. Authorization: `e2e/api-boundaries.spec.ts`, passed.
