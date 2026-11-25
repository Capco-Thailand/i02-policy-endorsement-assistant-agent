---
title: 'FR-15 Redesign Policy Detail and Proposal Review'
type: feature
ticket: 'fr-15-redesign-policy-detail-and-proposal-review'
created: '2026-11-25'
status: built
baseline_revision: 'f784505defca2bbafbc029ce88434e6efba016e1'
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
  - docs/DESIGN_STANDARD.md
  - docs/VISUAL_UX_CONSTRAINTS.md
  - _bmad-output/initiative-customer-ui-redesign/ux-fr-15/DESIGN.md
  - _bmad-output/initiative-customer-ui-redesign/ux-fr-15/EXPERIENCE.md
  - design/page/fr-15-policy-detail.html
  - design/page/fr-15-proposal-review.html
---

<frozen-after-approval reason="human-owned intent â€” do not modify unless human renegotiates">

## Intent

**Problem:** Policy facts are separated from full sources, and proposal values sit in distant columns. Customers cannot quickly tell what is known, what changes, or what approval means.

**Approach:** Implement the accepted policy snapshot and field-by-field proposal comparison using authorized API values, shadcn/ui tokens, and the existing decision flow at desktop and 320px.

## Boundaries & Constraints

**Always:** Keep synthetic data, owner-only access, non-disclosing errors, exact server values and units, citations and unresolved reasons, active/expired gating, a pre-decision non-binding notice, and existing decision/focus behavior.

**Never:** Calculate eligibility, premiums, benefits, or differences in the browser; infer missing facts; imply issued coverage; change policy records, API rules, or FR-16â€“FR-18 screens.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Owned policy | Active, expired, or unresolved | Ordered facts, citations, active-only request | Unknown values stay unresolved; no read-side write |
| Quote | Changed, unchanged, or absent | Exact per-field values and text state; absent quote has no decision | No invented amount or difference |
| Proposal | Pending, approved, rejected | Distinct labels; pending-only decision after notice | No repeat decision |
| Unauthorized | No session or unowned ID | Sign-in or non-disclosing unavailable state | No data leakage |

</frozen-after-approval>

## Code Map

- `apps/web/src/policies/PolicyDetail.tsx` â€” reorder sections; turn `Citation` into full source anchors and keep unresolved entries.
- `apps/web/src/policies/EvidenceSection.tsx` â€” separate authorized evidence query; preserve its async states while coordinating anchors.
- `apps/web/src/endorsement/ProposalReview.tsx` â€” replace distant columns with per-field comparisons, exact quote values, text status, and early notice.
- `apps/web/src/endorsement/ProposalPage.tsx`, `ProposalDecision.tsx` â€” loading/error, pending-only actions, confirmation, focus; suppress actions for missing quote.
- `apps/web/src/lib/api-types.ts` â€” generated types already carry citation and quote fields; do not hand-edit.
- `apps/web/src/app/styles.css` â€” semantic rose/Public Sans system; add scoped desktop/320px rules.
- `apps/web/src/policies/*.test.tsx`, `apps/web/src/endorsement/*.test.tsx`, `e2e/` â€” component/browser seams and visual baselines.

## Tasks & Acceptance

**Execution:**
- [x] `PolicyDetail.test.tsx`, `ProposalReview.test.tsx`, `ProposalPage.test.tsx` â€” test source links, order, values, states, absent quote first; record red/green.
- [x] `PolicyDetail.tsx`, `EvidenceSection.tsx` â€” compose snapshot, cited/unresolved facts, request gate, and source anchors.
- [x] `ProposalReview.tsx`, `ProposalPage.tsx` â€” compose summary, comparisons, status, notice, and unavailable state; preserve decision behavior.
- [x] `apps/web/src/app/styles.css` â€” use scoped atomic roles/tokens at both widths; keep one DOM order.
- [x] `e2e/` â€” cover values, evidence gaps, states, owner boundary, non-binding approval, keyboard, 320px overflow, and screenshots.
- [x] This plan and `docs/UX_REDESIGN_HANDOFF.md` â€” record criterion coverage, dated HTML report, limits; sync Issue #153 only if requirements change.

**Acceptance Criteria:**
- Given an owned active or expired policy, when detail loads, then the accepted order, accurate source references, unresolved explanations, and correct request availability appear without a policy write.
- Given a valid changed or unchanged server impact, when proposal review loads, then each field pairs current/proposed values with units and text change state, with no invented amount or cross-benefit scale.
- Given a pending or decided proposal, when the customer reviews it, then the non-binding meaning precedes pending-only controls or the recorded decision, and underlying coverage stays unchanged.
- Given a 320px viewport or keyboard navigation, when either screen is used, then labels, sources, actions, and focus remain reachable without horizontal overflow.

## Implementation Notes

The policy page now orders identity, term and product, coverage, beneficiaries, limitations, active-only request, then full source wording. Term citations link to full title, source ID, version, section, and excerpt. Unresolved facts keep their reason and any available citation. EvidenceSection retains its separate authorized query and async states. The proposal puts the non-binding notice and exact server quote summary before field groups and decision controls. Missing quote shows no amount or decision control. No API contract, policy record, or rule changed.

### Red/green component evidence

| Slice | Red evidence | Green evidence |
| --- | --- | --- |
| Source anchor and order | Focused PolicyDetail test: 1 failed, no source link | 5 passed |
| Grouped quote and early notice | Focused ProposalReview test: 1 failed, no field group | 3 passed |
| Missing quote gate | Focused ProposalPage test: 1 failed, quote access threw | 5 passed |
| Quote summary | Focused ProposalReview test: 1 failed, no summary region | 3 passed |
| Missing source explanation | Focused PolicyDetail test: 1 failed, no gap text | 6 passed |

Each focused run used `npm run test -w apps/web -- --run src/<feature>/<test>.test.tsx`. The subsequent compact citation and section order changes passed the full web suite: 54/54.

## Plan Change Log

## Review Triage Log

| Finding | Verdict | Evidence and route |
| --- | --- | --- |
| `ProposalReview.tsx:47` calls an equal requested payment frequency “Changed” | medium | The request schema and eligibility rules allow the current frequency to be requested, while the UI uses a fixed label. Resolved: the label compares the two server values; the focused ProposalReview test passed. |
| `docs/UX_REDESIGN_HANDOFF.md:3,40` says the ticket PR and Issue are pending | medium | PR #152 merged and Issue #153 exists; the stale tracking row can send an agent through the wrong workflow. Resolved: handoff names merged PR #152, active Issue #153, and implementation review. |
| Handoff and plan link ignored `test-results/` files | medium | `.gitignore` excludes reports, so PR reviewers cannot open those Markdown links. Resolved: documentation links committed tests, lists local report paths, and names CI artifacts for shareable reports. |

## Verification

### Review correction and final rerun, 2026-11-25

The quick review found three issues; all three were patched and none deferred. An equal payment-frequency request now says “Unchanged”; its focused component tests passed 3/3. The handoff names merged PR #152 and Issue #153, and verification links point to committed tests. After the patches, web tests passed 54/54, typecheck, format check, and production build passed. The focused browser run passed 21 cases, skipped six platform-specific cases, and exposed one existing evidence retry test locator/count that matched the new fact-source queries. After scoping that test to the original evidence question, its browser rerun passed 1/1 in local report `test-results/fr-15-redesign-policy-detail-and-proposal-review/report-20261125151410/e2e-20261125151410.html`. Fresh CI data remains the full-suite gate.

Committed verification sources: [policy detail browser scenarios](../../e2e/policy-detail-coverage.spec.ts), [proposal browser scenarios](../../e2e/proposal.spec.ts), [policy evidence scenarios](../../e2e/policy-evidence.spec.ts), [visual checks](../../e2e/visual.spec.ts), and [proposal component assertions](../../apps/web/src/endorsement/ProposalReview.test.tsx). `test-results/` paths below are local, ignored outputs; the CI test artifact supplies shareable full-suite evidence.

### Source-link correction, 2026-11-25

Status, effective and expiry dates, payment frequency, and beneficiaries now query the existing owner-authorized evidence endpoint with fixed domain questions. Only citations whose section ID matches the displayed fact become source links. Missing, unresolved, mismatched, or failed evidence displays a reason and no broken link; policy record values stay unchanged. The new PolicyDetail source-link component test failed before implementation (missing status link), then passed; the final web suite passed 54/54 tests. `npm run typecheck`, `npm run format:check`, and `npm run build` passed.

The `test-results/fr-15-redesign-policy-detail-and-proposal-review/report-20261125145740/e2e-20261125145740.html` passed 2/2 scenarios with keyboard focus and full citation targets for all four concepts. The `test-results/fr-15-redesign-policy-detail-and-proposal-review/report-20261125145347/e2e-20261125145347.html` passed 1/1, showing the preserved Monthly fact, an explicit source gap, and no payment link. The `test-results/fr-15-redesign-policy-detail-and-proposal-review/report-20261125145440/e2e-20261125145440.html` passed both Windows desktop and 320px baselines. The 17/19 focused run before locator updates was caused by duplicate text in the newly visible sources; both affected scenarios then passed in the 2/2 run. No API contract or rule changed.

### Criterion coverage, 2026-11-25

| Criterion | Evidence | Result and limit |
| --- | --- | --- |
| Owned active/expired policy, order, sources, unresolved facts, request gate, no read-side write | `PolicyDetail.test.tsx`, `e2e/policy-detail-coverage.spec.ts`, `e2e/policy-evidence.spec.ts` | Passed in `test-results/fr-15-redesign-policy-detail-and-proposal-review/report-20261125144052/e2e-20261125144052.html`. The 320px test compares policy API payload before and after reading. |
| Changed/unchanged quote, exact values and units, text state, absent quote | `ProposalReview.test.tsx`, `ProposalPage.test.tsx`, `e2e/proposal.spec.ts` | Passed in focused report. Amounts come from the server quote. Missing quote uses an intercepted API response to test the UI guard. |
| Pending/decided proposal, early notice, recorded decision, unchanged policy | `ProposalReview.test.tsx`, `ProposalPage.test.tsx`, `e2e/proposal.spec.ts` | Passed in focused report. The existing server decision flow records a non-binding event; no policy mutation was introduced. |
| 320px and keyboard reachability, no horizontal overflow | `e2e/policy-detail-coverage.spec.ts`, `e2e/proposal.spec.ts`, `e2e/visual.spec.ts` | Passed in focused report. Policy source receives keyboard focus. Desktop and 320px current/reference captures are attached. Windows policy screenshots match updated baselines reviewed against accepted mockups; automated proposal pixel baselines remain macOS-only and skip on Windows. |

Full unfiltered `npm run test:e2e -- --workers=2`: 47 passed, 1 failed, 6 platform skips in `test-results/fr-15-redesign-policy-detail-and-proposal-review/report-20261125143847/e2e-20261125143847.html`. The sole failure is existing FR-12 history: `GET /api/history` returns `HISTORY_UNAVAILABLE` (503) on the shared synthetic Neon database. Six pre-existing approved proposal payloads lack `current.label` and `requestedChange`; FR-15 does not change the API or these records. A fresh CI database is needed for a clean full-suite gate.

`npm run test -w apps/web` passed 54/54; `npm run typecheck`, `npm run format:check`, and `npm run build` passed. Focused Chromium browser run on Windows passed 18/18. The reports identify the baseline commit and dirty worktree; the focused report attaches current desktop/320px screenshots and accepted reference captures.

**Commands:**
- Focused web component tests after each red/green slice â€” required UI states and exact seeded values pass.
- `npm run test -w apps/web` â€” affected component suite passes.
- `npm run typecheck`, `npm run format:check`, `npm run build` â€” no type, format, or build failures.
- `npm run test:e2e` â€” applicable FR-15 success, rejection, and boundary scenarios pass; dated HTML report and 320px/desktop screenshots saved under `test-results/fr-15-redesign-policy-detail-and-proposal-review/`.

**Manual checks:**
- Compare current desktop and 320px captures with the accepted HTML mockups and inspect screen-reader source navigation and light/dark contrast. A mocked UI test alone does not prove authorization or an unchanged policy record; retain API/browser evidence for those claims.
