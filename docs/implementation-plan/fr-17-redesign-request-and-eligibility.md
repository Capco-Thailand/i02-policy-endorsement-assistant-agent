---
title: FR-17 Request and Eligibility Redesign
type: feature
ticket: fr-17-redesign-request-and-eligibility
created: 2026-11-25
status: built
baseline_revision: 1fb6bcf1e6772bdf67746bfe3b74b214b7518782
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/fr-17-redesign-request-and-eligibility.md
  - _bmad-output/initiative-customer-ui-redesign/ux-fr-17/DESIGN.md
  - _bmad-output/initiative-customer-ui-redesign/ux-fr-17/EXPERIENCE.md
---

## Intent

**Problem:** The request form does not show authorized current values beside proposed values, and the recorded request and eligibility result lack the accepted hierarchy. Customers could mistake recording for an approved change.

**Approach:** Apply the accepted request and eligibility layouts using existing owner-authorized policy detail fields and server decisions. Keep unknown values and unresolved evidence explicit.

## Boundaries & Constraints

**Always:** Use synthetic data; preserve owner/session checks and server eligibility; show exact beneficiary totals and the non-binding boundary; keep semantic, keyboard, and 320px behavior.

**Never:** Infer current address or rider on/off state, derive eligibility in the browser, change proposal review, or create a new policy detail API.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Four change types | Authorized active policy | Current context and requested fields; unavailable address/rider state explicit | No invented values |
| Beneficiaries | Replacement rows below, above, or at 100% | Exact numeric total and textual under/over/exact state | Disable record until valid; focus invalid field |
| Recorded request | Valid submit | ID and pending checks, then separate eligibility action | No coverage-change claim |
| Eligibility | All three server outcomes | Reason, next action, citations/unresolved source | No client decision or proposal when ineligible |
| Boundary failure | Expired, ended, loading, API error | Existing safe handling and retry where applicable | No unauthorized details or write |

## Code Map

- `apps/web/src/endorsement/RequestForm.tsx` — request controls and recorded state.
- `apps/web/src/endorsement/EligibilityCheck.tsx` — server outcome presentation.
- `apps/web/src/app/styles.css` — responsive request/eligibility styles.
- `apps/web/src/endorsement/*.test.tsx` — focused component tests.
- `e2e/customer-flows.spec.ts`, `e2e/visual.spec.ts` — browser behavior and visual checks.

## Tasks & Acceptance

**Execution:**
- [x] `RequestForm.tsx` — show authorized current context, exact allocation feedback, requested-value hierarchy, and distinct recorded state.
- [x] `EligibilityCheck.tsx` — present server reasons, next action, unresolved sources and available citations with clear outcome labels.
- [x] `styles.css` — match accepted responsive layout at 1280px and 320px.
- [x] Component and browser tests — cover matrix scenarios and server/owner boundary.
- [x] Documentation — update affected behavior only if contracts change; record browser E2E report.

**Acceptance Criteria:** The ticket's seven acceptance criteria pass with the accepted request and eligibility layouts.

## Implementation Notes

## Plan Change Log

## Review Triage Log

- Quick review, 2026-11-25: **medium / patch** — FR-17 screenshots had Windows baselines only, so Linux CI would fail. Kept behavior and screenshot attachments on Linux and limited pixel comparison to the reviewed Windows baselines, following the repository's platform-specific visual pattern.
- Quick review, 2026-11-25: **false / reject** — Invalid totals disable recording as the accepted form requires and announce the exact under/over total; focus-to-error applies when a submitted field fails validation. A disabled action cannot be activated to request focus, and changing that interaction would conflict with the accepted disabled state.
- Quick review, 2026-11-25: **medium / patch** — FR-17-only grep omitted pre-existing API boundary scenarios. Labeled the owner/session and unchanged-policy scenarios for FR-17 and asserted eligibility checking does not call proposal preparation.
- Visual inspection, 2026-11-25: **medium / patch** — An eligible server result can have no reason strings, leaving a blank Reason heading. Added an explicit no-blocking-reasons message, with a failing then passing component test.
- Browser rerun, 2026-11-25: **medium / patch** — A random request ID changed the 320px paragraph height and screenshot position. Put the ID on its own fixed-width line; the subsequent visual comparison passed against the regenerated baseline.
- Contract inspection, 2026-11-25: **low / patch** — Request capture accepts any valid calendar date and eligibility checks term constraints. Corrected date help to describe that server sequence and gave beneficiary fieldsets usable padding.

## Verification

**Commands:**
- `npm run test -w apps/web` — request and eligibility component tests pass.
- `npm run typecheck` and `npm run format:check` — contracts and formatting pass.
- `npm run test:e2e -- --grep FR-17` — browser scenarios pass against synthetic data.
- `npm run build` — Next.js build passes.

## Verification Results

- 2026-11-25 Asia/Bangkok: `npm run test` passed with the supplied synthetic Neon connection: 17 workflow, 65 API, 10 calculator, and 60 web tests. API's 49 opt-in integration cases remained skipped by their existing configuration.
- `npm run typecheck`, `npm run format:check`, `npm run build`, and `git diff --check` passed. Quick review findings were resolved or refuted in the triage log; nothing was deferred.
- Chromium FR-17: 9/9 passed at 1280px and 320px. [HTML report](../../test-results/fr-17-redesign-request-and-eligibility/report-20261125202444/e2e-20261125202444.html) includes application screenshots and the accepted mockup references. Windows pixel baselines compare request and eligibility at both widths; Linux runs the behavior and screenshot attachments without Windows pixel comparison.
- Related FR-02/FR-08 browser regression: 13/13 passed; four platform-specific historical visual checks skipped on Windows. [HTML report](../../test-results/fr-17-redesign-request-and-eligibility/report-20261125200310/e2e-20261125200310.html).

| Ticket criterion | Evidence | Result |
|---|---|---|
| Four types, current/requested values, source access | FR-17 current/requested browser scenarios at both widths; `RequestForm.test.tsx` | Passed; address/rider state unavailable |
| Exact allocation and textual state | FR-17 under/over/exact browser scenarios; `RequestForm.test.tsx` | Passed |
| Recorded request separate from eligibility | FR-17 recorded/eligibility browser scenarios; `RequestForm.test.tsx` | Passed; no proposal call before preparation |
| Three outcomes, reasons, next action, unresolved citations | FR-17 real proceed/referral and simulated cannot-proceed browser scenarios; `EligibilityCheck.test.tsx`; API eligibility tests | Passed; server owns decision |
| Invalid, expired, ended, loading, API error, keyboard, 320px | FR-17 keyboard/error and width scenarios; FR-02/FR-08 regressions; request/eligibility component tests | Passed |
| Accepted UX references | Ticket and `design/page/index.html`; browser report attachments | Passed |
| Synthetic browser and server boundaries | FR-17 9/9, FR-02/FR-08 13/13, API owner and unchanged-policy browser scenarios | Passed |

Uncovered FR-17 criteria: none. The local HTML reports are ignored run artifacts; the committed tests and baselines reproduce them.
