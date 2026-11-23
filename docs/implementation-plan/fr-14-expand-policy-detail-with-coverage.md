---
title: 'FR-14 Expand Policy Detail with Product and Coverage Information'
type: feature
ticket: 'fr-14-expand-policy-detail-with-coverage'
created: '2026-11-23'
status: built
baseline_revision: 'f0f06536dbfa5c4b5a30229d6d3fab0dd1f4a34d'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - _bmad-output/initiative-customer-authentication/ux-fr-14/DESIGN.md
  - _bmad-output/initiative-customer-authentication/ux-fr-14/EXPERIENCE.md
  - design/page/policy-detail-coverage.html
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Policy detail omits synthetic insurer, product version, coverage amounts, and key exclusions, so customers cannot inspect these terms beside their source wording.

**Approach:** Add the accepted FR-14 terms to the existing structured policies and policy-scoped `v1` wording, reconcile each displayed field against its versioned evidence after ownership checks, and render cited values or explicit unresolved states.

## Boundaries & Constraints

**Always:** Preserve existing policy facts, owner-only access, identical unknown/unowned `404`, expired-policy request gate, and synthetic non-binding disclosure. Use the exact accepted fixtures and section IDs in the ticket. Keep existing `v1` source identity; migrate existing synthetic databases additively and make repeated seed/load idempotent.

**Never:** Infer a missing term, show an unverified amount as confirmed, expose source details before authorization, add a rider to the two products without one, or create a request by reading detail.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Owned active | Narin's Family Protection policy | Cited product, two benefits, two exclusions; existing facts and request action | No error |
| Owned expired | Narin's Classic Life policy | Cited historical life amount and exclusion; no request action | No error |
| Unauthorized | Missing session, unknown ID, or Mali opening Narin's ID | `401` or identical non-disclosing `404` | No source or policy terms leak |
| Evidence gap | Missing section, stale document/encoder, or conflicting source/structured value | Affected term unresolved; confirmed unrelated terms remain | Explanation and relevant citation when available |

</frozen-after-approval>

## Code Map

- `apps/api/src/app.ts` — `PolicyDetailSchema` and GET detail already gate owner access; extend response only after `db.policy` and `ownsPolicy`.
- `apps/api/src/db.ts`, `apps/api/src/auth/data.ts`, `apps/api/sql/` — structured policy data, selected document read, and explicit migration list.
- `apps/ai/corpus/policies.json`, `apps/ai/retrieval.ts`, `apps/api/src/load-corpus.ts` — three `v1` documents; loader currently rejects additive sections and concept schema has four values.
- `apps/api/src/evidence.ts` — existing reconciliation of status, dates, payment, beneficiaries; preserve `/evidence` behavior while adding per-term FR-14 checks.
- `apps/web/src/policies/PolicyDetail.tsx`, `apps/web/src/lib/api-types.ts` — current detail and generated OpenAPI types; add focused product/coverage/exclusion section.
- `apps/api/src/evidence.integration.test.ts`, `apps/api/src/persistence.integration.test.ts`, `apps/web/src/policies/PolicyDetail.test.tsx`, `e2e/` — observable API, DB, UI, and browser seams.

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/src/*test.ts`, `apps/web/src/policies/PolicyDetail.test.tsx` — first write failing public API/UI cases for accepted values, owner boundary, unresolved evidence, expired state, and unchanged policy.
- [x] `apps/api/sql/`, `apps/api/src/db.ts`, `apps/api/src/auth/data.ts`, `apps/api/src/seed.ts` — add structured synthetic product and coverage values with an additive migration.
- [x] `apps/ai/corpus/policies.json`, `apps/ai/retrieval.ts`, `apps/api/src/load-corpus.ts` — add exact `v1` sections and make the one-time additive corpus upgrade repeatable without accepting unrelated drift.
- [x] `apps/api/src/evidence.ts`, `apps/api/src/app.ts` — reconcile FR-14 terms by section and return cited confirmed or unresolved fields after owner authorization.
- [x] `apps/web/src/policies/`, `apps/web/src/app/styles.css`, `apps/web/src/lib/api-types.ts` — render the reviewed UX at 320px, preserve existing facts/action/states, regenerate client types from OpenAPI.
- [x] `e2e/`, `docs/implementation-plan/fr-14-expand-policy-detail-with-coverage.md` — browser cases, screenshots, criterion coverage, report path, and residual gaps.

**Acceptance Criteria:**
- Given each seeded policy, when its owner opens detail, then exact accepted terms and citations appear with all existing facts.
- Given absent, stale, or contradictory source evidence, when the owner opens detail, then only affected terms are unresolved and no term is fabricated.
- Given no session or another owner's ID, when detail is requested, then the existing non-disclosing `401` or `404` boundary holds.
- Given an expired policy, when detail loads, then historical amounts remain readable and no request can start.

## Implementation Notes

- Added an additive policy-term migration, seed values for all three synthetic policies, and the accepted sections in their existing `v1` documents. The corpus loader accepts the one-time four-section legacy snapshot upgrade only when the saved legacy sections match; repeat loads remain idempotent.
- Detail reconciles each product, coverage, and exclusion term independently against the selected policy document after the owner check. Missing, stale, and conflicting terms return an unresolved state; other terms remain confirmed. The existing `/evidence` fact comparison continues to use its original four facts.
- The web detail renders product, coverage, and exclusion sections with visible citations and unresolved explanations; the existing facts, beneficiaries, and request gate remain.

## Plan Change Log

## Review Triage Log

## Verification

### Results

- API: `npm run test -w apps/api -- --testTimeout 180000 --hookTimeout 120000` passed 82/82 against the isolated Neon `fr14_test` schema. Remote latency required longer test and hook timeouts; the CI database is local. After review patches, focused `policy-terms.test.ts` passed 4/4 and `policy-terms.integration.test.ts` passed 2/2. FR-08 eligibility integration passed after snapshot reconciliation was corrected.
- Web: `npm run test -w apps/web` passed 40/40; root workflow tests passed 17/17. `npm run typecheck`, `npm run format:check`, and `npm run build` passed.
- Browser: `npm run test:e2e` passed 32/32 runnable Chromium tests, with four existing platform-specific visual tests skipped on Windows. FR-14's seven functional scenarios and two reviewed visual comparisons at 320px and 1280px passed. HTML report: `test-results/fr-14-expand-policy-detail-with-coverage/report-20261123163318/e2e-20261123163318.html` (Chromium, Asia/Bangkok, local branch before commit). Each FR-14 scenario attaches a rendered screenshot.
- Test-first evidence: the API missing-section test failed with `STALE_ENCODER` before the precedence fix, then passed. The UI test was written before implementation, but its initial red run was blocked by sandbox `esbuild spawn EPERM`; no clean UI red result is claimed.

### Criterion coverage

| Ticket criterion | Evidence | Result / limit |
| --- | --- | --- |
| 1. Insurer, type, product, version for each policy | `e2e/policy-detail-coverage.spec.ts` three seeded policies; `policy-terms.integration.test.ts` | Passed |
| 2. Accepted terms and source section consistency | `policy-terms.test.ts`, API integration, corpus loader idempotency in `evidence.integration.test.ts`, browser citations | Passed for all seeded fixtures; no real insurer data |
| 3. Named coverage, amounts, currency, exclusions and citations | Browser seeded-policy scenarios and screenshots; UI component test | Passed |
| 4. Owner boundary and non-disclosing errors | API integration and browser owner-boundary scenario | Passed: `401`, identical `404`, no source access before owner check |
| 5. Missing, stale and conflicting evidence | API integration mutates evidence document response; browser scenarios render each unresolved reason; unit tests check concept/identity drift | Passed at API and UI seams; browser injects simulated API responses for the three failure states |
| 6. Existing facts and active/expired request action | FR-03/FR-04/FR-08 regressions and browser active/expired scenarios | Passed |
| 7. 320px, keyboard and async states | Browser 320px no-overflow screenshot, reviewed 320/1280 visual baselines, existing focus and session tests, UI unresolved/loading/error tests | Passed on Windows Chromium; FR-14 visual baselines are platform-specific and skipped on Linux CI |
| 8. Synthetic and non-binding read | Versioned fixture review; API unchanged-policy assertion; browser before/after policy response | Passed; read still writes only the existing audit event |
| 9. API, UI, browser evidence and gaps recorded | This table and dated HTML report | Passed; no Linux FR-14 visual baseline yet |

### Review triage

- **Medium, patched:** Missing structured coverage/exclusion arrays produced empty lists. The UI now shows unresolved placeholders for the accepted policy-specific term IDs, with no guessed amount or exclusion text. Focused unit/API tests pass.
- **High, patched:** Reconciliation ignored section concept and source product/title. It now checks all three before confirming a term, and unit tests cover drift.
- **False after verification:** The review saw outdated plan text saying database and browser checks had not run. The API integration and browser suite ran after that draft; this section records their outcomes. The browser uses simulated responses for missing/stale/conflicting rendering while API integration verifies server reconciliation.

### Remaining limits

- The initial UI red test result was blocked by sandbox process permissions; the focused green test and browser paths passed.
- FR-14 pixel baselines were reviewed and passed on Windows Chromium. Linux CI still verifies FR-14 behavior and screenshots, but skips pixel comparison until a Linux baseline is reviewed.