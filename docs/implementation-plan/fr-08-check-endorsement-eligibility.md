---
title: 'FR-08 check endorsement eligibility'
type: feature
ticket: 'fr-08-check-endorsement-eligibility'
created: '2026-11-20'
status: built
baseline_revision: 'd8b0b886b74d5a658e62e6234804a919f83519e0'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - 'docs/tickets/fr-08-check-endorsement-eligibility.md'
  - '_bmad-output/initiative-customer-authentication/ux-fr-08/DESIGN.md'
  - '_bmad-output/initiative-customer-authentication/ux-fr-08/EXPERIENCE.md'
  - 'design/page/check-endorsement-eligibility.html'
  - 'docs/CODING_STANDARDS.md'
  - 'docs/TESTING_STANDARD.md'
---

<frozen-after-approval reason="human-owned intent; do not modify unless human renegotiates">

## Intent

**Problem:** A recorded endorsement request currently has no server decision that combines its persisted values, owned policy, applicable cited rules, and same-request mock receipt. A false pass could allow a later invalid quote or proposal.

**Approach:** Add a deterministic, audited Fastify eligibility check and display its typed result beneath the mock upload on the recorded-request page. Treat missing or contradictory evidence and rider underwriting as referrals; never treat a receipt as document verification.

## Boundaries & Constraints

**Always:** Read the persisted request for the session actor and owned policy before rule or receipt access. Validate structured values and cited rule conditions at runtime. Require a durable `RECEIVED_MOCK` event for the same actor, policy, and request to return `ELIGIBLE`. Audit completed decisions before responding. Keep the result non-binding.

**Never:** Trust caller-supplied request replacements, retrieved prose, uploaded bytes, an old browser result, or FR-06 eKYC as eligibility evidence. Create a quote or proposal, collect medical data, modify a policy, or reveal cross-account records.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Allowed check | Owned active policy, valid saved address request, `AVAILABLE` cited `CHECK`, same-request receipt | `ELIGIBLE` with rule citation; audited | No side effect beyond audit |
| Failed check | Invalid saved fields, expired policy, or rule condition fails | `INELIGIBLE` with safe reason and any applicable citation | No quote or proposal |
| Missing receipt | Other checks pass; no matching durable event | `INELIGIBLE` with upload action | Another actor/request receipt cannot pass |
| Unresolved evidence | `MISSING`, `CONFLICTING`, `UNAVAILABLE`, unknown/incomplete rule, or rider `REFERRAL` | `REFERRED` with safe reason/source IDs and real-world rider caveat | No automatic progression |
| Access or storage failure | No session, unowned resource, receipt read failure, or audit write failure | `401`, non-disclosing `404`, or service failure | Never return apparent success |

</frozen-after-approval>

## Code Map

- `apps/api/src/app.ts`: reuse `actorFor`, policy ownership, Fastify TypeBox schemas, and FR-05 `retrieveRules`; add route/schema after upload. Keep authorization ahead of rule/receipt reads.
- `apps/api/src/db.ts`: `endorsement_requests.payload` stores the saved `RequestRecord`; `audit_events` stores FR-07 `document-upload` metadata. Add actor/policy/request-filtered request and receipt readers; reuse `audit` for completed decisions.
- `apps/api/src/endorsement/schema.ts`, `apps/api/src/rules.ts`: reuse date/allocation validation and FR-05 status/citations. Map the structured rule field `address` to saved `correspondenceAddress`; reject unknown value shapes rather than reading rule text.
- `apps/web/src/endorsement/RequestForm.tsx`: saved-request panel already renders `DocumentUpload`; add a focused `EligibilityCheck` after it. Keep UI decisions on the server.
- `apps/web/src/lib/api.ts`, `queries.ts`, generated `api-types.ts`: add typed credentialed mutation and regenerate client types from OpenAPI; do not hand edit generated types. Existing route helpers and session redirect pattern apply.
- `e2e/customer-flows.spec.ts`, `e2e/api-boundaries.spec.ts`: extend existing browser/API flows and screenshot attachments; use synthetic fixtures.
- `docs/API_DEVELOPMENT.md`: document the new request/response and safe failure contract.

## Tasks & Acceptance

**Execution:**
- [x] Add focused failing tests in `apps/api/src/endorsement/eligibility.test.ts` for all four change types, malformed persisted values, allowed/failed `CHECK`, unknown values, referral, and receipt precedence; run red, then implement pure decision code in `eligibility.ts` and run green. This seam proves deterministic outcomes, not persistence or authorization.
- [x] Add failing Fastify route tests in `apps/api/src/eligibility.test.ts` for `401`, equal `404`, access order, schema, audit/read failures, and no writes; run red, then add filtered DB readers, route, audit, and OpenAPI contract; run green. Add a PostgreSQL integration test for request → upload → check and cross-request isolation. These seams prove API and durable record behavior.
- [x] Add failing `EligibilityCheck.test.tsx` and API-client tests for idle, pending, three outcomes, retry, `401`, `404`, citation, and disclosure; run red, then add client type, hook, focused section, and `RequestForm` composition; run green. This seam proves presentation under controlled responses, not server decisions.
- [x] Extend browser scenarios for address success, payment without and with receipt, rider referral, service failure, session/cross-account boundaries, and desktop/narrow UI. Update `docs/API_DEVELOPMENT.md`, ticket-level scope only if changed, and criterion traceability in this plan.

**Acceptance Criteria:**
- Given an authorized saved request, when eligibility runs, then only structured policy/request values, applicable cited rule values, and its own mock receipt determine `ELIGIBLE`, `INELIGIBLE`, or `REFERRED` with stable safe reasons.
- Given missing/invalid access or failed storage/audit, when the route runs, then it returns `401`, equal `404`, or service failure without exposing data or claiming eligibility.
- Given a customer on the recorded-request page, when a check completes, then its result, reasons, citations, upload action or referral next step appear accessibly; no quote, proposal, policy write, or binding occurs.

## Implementation Notes

Linux CI captured the FR-08 desktop and 375px candidates. Both were inspected against the UX contracts and mockup, then checked in as `e2e/visual.spec.ts-snapshots/eligibility-1280-chromium-linux.png` and `eligibility-375-chromium-linux.png`. The PR check now enforces comparison with those baselines.

## Plan Change Log

## Review Triage Log

| Verdict | Route | Finding and evidence |
| --- | --- | --- |
| medium | patch | `app.ts` audits rule versions from result citations only; unknown structured values refer without citations, so a completed decision loses known selected rule IDs/versions. Audit must derive safe versions from retrieved rule citations. |
| medium | patch | `EligibilityCheck.tsx` gives missing receipt prose but no direct action to the upload section already above it. Add a same-page link for `MISSING_RECEIPT`. |
| medium | patch | New FR-08 browser scenarios capture screenshots but do not compare reviewed desktop/narrow baselines as `docs/TESTING_STANDARD.md` requires. Add visual comparisons and establish baselines from the isolated CI browser run. |

## Design Notes

The saved-request section owns the request context. `DocumentUpload` owns guidance and mock receipt UI; new `EligibilityCheck` owns only the check action and result, after upload. Use the reviewed spines for status labels, focus, live region, reason list, citation wrapping, and narrow layout.

The existing recorded-request panel appears immediately after request creation and is not restored on page reload. Keep FR-08 on that panel; a request history/navigation page belongs to later workflow work.

## Verification

**Commands:**
- `npm run ticket:preflight -- docs/tickets/fr-08-check-endorsement-eligibility.md`
- Red and green focused API and web test commands recorded during each slice; then `npm test`
- `npm run typecheck`, `npm run format`, `npm run format:check`, `npm run build`
- `npm run test:e2e` (Chromium; record dated HTML report, screenshots, criterion coverage, and gaps)

**Manual checks (if no CLI):**
- Inspect OpenAPI eligibility response and audit metadata for safe citations/reasons; confirm the synthetic policy row is unchanged.

**Red/green evidence:**
- Domain address check: `npm run test -w apps/api -- --run src/endorsement/eligibility.test.ts` failed because `eligibility.ts` was absent, then passed (1 test).
- Route access: `npm run test -w apps/api -- --run src/eligibility.test.ts` returned `404` instead of `401`, then passed (1 test).
- UI idle/check: `npm run test -w apps/web -- src/endorsement/EligibilityCheck.test.tsx` failed because the component was absent, then passed (1 test).
- Unknown structured value: domain test returned `ELIGIBLE` instead of `REFERRED`, then passed after strict value validation (2 tests).

**Latest local result:** Domain 6 passed; Fastify route 4 passed; UI component 7 passed; full web suite 46 passed. Root typecheck passed. The web production build passed with `--webpack`; default Turbopack could not resolve `next` because this worktree has no local `node_modules` and the shared install is above its detected workspace root. `npm run format:check` failed on 79 mostly untouched baseline files; `git show HEAD:package.json` also fails Prettier check. Focused FR-08 formatting check passed. Full API suite: 26 passed, 14 existing database-dependent tests failed for absent `DATABASE_URL`, and 33 were skipped. `TEST_DATABASE_URL` and `DATABASE_URL` are absent, and Docker is unavailable. The user directed skipping local database and browser setup; PostgreSQL integration and Playwright scenarios are present for CI but unrun locally.

**Criterion traceability:**

| Ticket criterion | Evidence | Latest result and gap |
| --- | --- | --- |
| Session, policy, request access | `apps/api/src/eligibility.test.ts`; `e2e/api-boundaries.spec.ts` | Fastify and CI browser passed |
| Persisted values, dates, active policy, four changes | `apps/api/src/endorsement/eligibility.test.ts` | Domain and CI API suite passed |
| Cited checks, unresolved rules, referral | Domain, Fastify, and rider browser tests | Passed; missing/conflicting browser fixtures remain outside current browser scenarios |
| Same-request mock receipt and precedence | Domain tests; `apps/api/src/eligibility.integration.test.ts` | Domain and isolated PostgreSQL integration passed |
| UI results, citation, retry, disclosure | `apps/web/src/endorsement/EligibilityCheck.test.tsx`; `e2e/customer-flows.spec.ts` | Component and CI browser passed; visual comparison enforced by reviewed baselines |
| No quote, proposal, policy mutation, or binding | Fastify route tests; integration unchanged-policy assertion | Route and PostgreSQL passed; FR-09/10 recheck is future work |
| Durable decision audit and storage failures | Fastify route tests; PostgreSQL audit assertion | Fastify and PostgreSQL passed |

**Follow-up verification (supersedes earlier counts):** A referred result with no citation omitted its safe source ID; `EligibilityCheck.test.tsx` failed, then passed after rendering `sourceIds`. A `401` redirect test and saved-request composition test also passed. The Fastify route test now asserts audited `ruleVersions`. The mocked `503` browser service-failure scenario is added but remains unrun locally. Full web suite: 48/48 passed. Focused web tests: 15/15 passed. Fastify route tests: 4/4 passed. Root typecheck and focused Prettier check passed. Root `npm run format:check` still fails on 74 unrelated baseline files. The styled result panel has a flat border, status-specific left rule, and narrow citation wrapping; browser screenshot comparison remains unrun without the isolated database.

**Isolated CI evidence:** Run 44706022890 on 2026-11-20 Asia/Bangkok passed database migration/seed, API tests (74/74, including FR-08 PostgreSQL integration), web tests (49/49), typecheck, formatting, and production build. Chromium passed 26 functional browser scenarios; its only two failures were the intentionally absent FR-08 visual baselines. Dated HTML report: `test-results/fr-08-check-endorsement-eligibility/report-20261120155427/e2e-20261120155427.html` in the CI artifact. The reviewed baselines above were added afterward; their comparison is the remaining PR check.

## 2026-11-23 requirement reconciliation

The previous frozen plan and evidence above describe the retired upload-dependent contract. The current implementation checks required fields and active status before retrieval, reconciles the selected FR-04 policy document with owned structured facts, retrieves bounded policy passages and FR-05 rules, and returns `CAN_PROCEED`, `CANNOT_PROCEED`, or `NEEDS_REVIEW`. Policy and rule citations are separate typed variants. Audit records both source versions. A receipt has no role.

| Current criterion | Evidence | Local result and gap |
| --- | --- | --- |
| Session, ownership, request, active status before retrieval | `apps/api/src/eligibility.test.ts` | Focused API passed; invalid/inactive requests return `409` without retrieval, assessment, or audit; PostgreSQL/browser pending |
| Both cited sources and structured reconciliation | `apps/api/src/endorsement/policy-evidence.ts`; `eligibility.test.ts` | Positive, missing, stale, conflicting, unavailable fixtures passed; PostgreSQL pending |
| Three outcomes, reasons, citations | `endorsement/eligibility.test.ts`; `EligibilityCheck.test.tsx` | Domain and UI passed |
| Fresh server gate, no upload, no policy mutation | Eligibility route and `eligibility.integration.test.ts` | No calculation/proposal routes exist yet; PostgreSQL unchanged-policy check pending |
| UI states and rider caveat | `EligibilityCheck.test.tsx`; `e2e/customer-flows.spec.ts` | Component passed; browser and revised visual baselines pending |
| Untrusted source text and audit failure | Domain and route tests | Focused API passed; browser pending |
| Durable audit with policy/rule versions | `eligibility.test.ts`; `eligibility.integration.test.ts` | Mocked audit assertions passed; PostgreSQL durability pending |

Focused API tests: 22 passed; web suite: 39 passed. API and web typechecks, `npm run format:check`, and the production web build passed. Full API suite cannot pass locally without `DATABASE_URL`; `TEST_DATABASE_URL` is also unset, so PostgreSQL and browser E2E remain unrun for this revision. Previous CI results above do not verify the revised contract.

**Merged verification:** [CI run 45135833676](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/actions/runs/45135833676) on 2026-11-23 passed 77 API tests with PostgreSQL, 39 web tests, typecheck, formatting, build, and Chromium E2E: 25 passed, two macOS-only visuals skipped on Linux. The revised 1280px and 375px Linux FR-08 visual baselines passed. The dated HTML report and screenshots are in the run artifact under `test-results/fr-08-check-endorsement-eligibility/report-20261123150643/`. FR-09/FR-10 do not exist yet; verify their fresh server `CAN_PROCEED` gate when each is implemented. This criterion remains open.
