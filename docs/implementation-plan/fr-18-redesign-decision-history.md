---
title: FR-18 decision history redesign
type: feature
ticket: fr-18-redesign-decision-history
created: 2026-11-25
status: built
baseline_revision: 03954f58b8a1b4c9a7459185625ef12d0c9ccc88
route: full
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/fr-18-redesign-decision-history.md
  - _bmad-output/initiative-customer-ui-redesign/ux-fr-18/DESIGN.md
  - _bmad-output/initiative-customer-ui-redesign/ux-fr-18/EXPERIENCE.md
  - design/page/fr-18-history.html
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
---

<frozen-after-approval reason="customer-selected FR-18 and accepted UX handoff">

## Intent

**Problem:** Decision history currently buries the non-binding notice, omits request IDs, and exposes full address or beneficiary details in overview rows. Customers need to identify their approved decisions and reach the exact recorded proposal without mistaking approval for changed coverage.

**Approach:** Redesign the existing owner-scoped approved-history page around the accepted FR-18 layout, retaining the FR-12 API and proposal authorization boundary.

## Boundaries & Constraints

**Always:** Show server-returned policy and request identity, decision time, text approval status, concise change summary, and exact proposal link. Place the non-binding meaning beside the heading. Use synthetic data, semantic and keyboard-accessible controls, and a 320px layout without overflow.

**Never:** Add rejected entries to history, disclose full address or beneficiary values in overview, mutate policy or coverage, or calculate decision semantics in the browser.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Approved entries | One or more owner records | Newest-first list, safe summaries, policy/request IDs, date, status, exact proposal links | No stale cross-account records |
| Rejected decision | Owner proposal rejected | Absent from approved history; detail retains decision | No rejected-history API |
| Async states | Loading, empty, service error, expired session | Distinct explanation and next action | Retry error; sign-in for ended session |
| Narrow viewport | 320px | Ordered stack, wrapped IDs, keyboard links, no horizontal scroll | No clipped controls |

</frozen-after-approval>

## Code Map

- `apps/web/src/endorsement/ChangeHistory.tsx` — page and `HistoryList`; `changeSummary` leaks addresses and beneficiary detail. Reuse `useHistory`, `routes.proposal`, and session clearing.
- `apps/web/src/endorsement/ChangeHistory.test.tsx` — component seam for safe summary, identity, boundary placement, and async states; update mocked request IDs.
- `apps/web/src/app/styles.css` — scoped history layout around line 905; update flat rows, notice, 320px wrapping and focus.
- `e2e/history.spec.ts` — real synthetic FR-12 owner flow, authorization, unchanged policy, and deterministic visual scenarios; update old PII assertions and 375px baseline to 320px.
- `apps/api/src/app.ts` — existing history schema includes `requestedChange.id` and APPROVED-only status; retain contract.

## Tasks & Acceptance

**Execution:**
- [x] `ChangeHistory.test.tsx` — add failing public UI assertions for safe summaries, request identity, exact links, boundary placement, and states; record red result.
- [x] `ChangeHistory.tsx` — render accepted content and state hierarchy; preserve existing query and auth boundary.
- [x] `styles.css` — match accepted single-column desktop/320px layout and focus treatment.
- [x] `e2e/history.spec.ts` — update real-flow assertions, add rejected exclusion and 320px checks; capture reviewed visual baselines and screenshots.
- [x] `docs/` traceability and handoff — record criterion coverage, dated browser report, red/green evidence and limitations.

**Acceptance Criteria:**
- Given approved owner records, when history loads, then each row shows policy, request ID, safe change summary, date, Approved, and exact authorized proposal link in server order.
- Given a rejected proposal, when history loads, then the rejected decision is absent and remains on its owner-authorized detail.
- Given any history state, when the page renders, then non-binding meaning is near the heading and the state offers a clear next action.
- Given 320px width or keyboard navigation, when the customer reviews entries and links, then IDs wrap, controls are reachable, and the page has no horizontal overflow.
- Given a foreign account or a recorded approval, when history and policy detail are read, then foreign data is unavailable and underlying policy values remain unchanged.

## Implementation Notes

- Kept the FR-12 approved-only API and exact proposal route. The page clears cached records and shows an in-place session-ended action on authorization failure.
- [Criterion traceability](fr-18-criterion-traceability.md) records the local browser outcome, red/green component slices, and CI follow-up for the shared-database 503.

## Plan Change Log

## Review Triage Log

- 2026-11-25 quick review: 3 medium, 0 high/low, 1 false, 0 maybe-false.
- `e2e/history.spec.ts` rejection exclusion: **medium / patch**. Proposal IDs are in link `href`, so text inspection misses a rejected link; assert the rejected path is absent from history links.
- `e2e/history.spec.ts` unchanged policy: **medium / patch**. Comparing only frequency after address decisions cannot detect another policy field changing; compare owner-authorized policy records before and after.
- `e2e/history.spec.ts` 320px baseline: **false**. `e2e/history.spec.ts-snapshots/history-approved-320-chromium-win32.png` exists as an untracked addition and will be included in the staged implementation commit; the temp diff listed it explicitly.
- FR-18 criterion handoff: **medium / patch**. Add a criterion traceability record with local browser report, red/green evidence, and stated shared-database limitations.

## Verification

**Commands:**
- `npm run test -w apps/web -- ChangeHistory.test.tsx` — red before code, green after.
- `npm run typecheck` — typed UI/API contract remains aligned.
- `npm run format:check` — source formatting passes.
- `npm run test:e2e` with `E2E_TICKET_ID=fr-18-redesign-decision-history` — browser coverage and dated HTML report.
