---
title: 'FR-19 Refine customer UI'
type: feature
ticket: fr-19-refine-customer-ui
created: '2026-11-26'
status: in-review
baseline_revision: 'e7f5610a736833aec510b835e429c2f10bd54a4e'
route: full
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/fr-19-refine-customer-ui.md
  - _bmad-output/initiative-customer-ui-redesign/ux-fr-19/DESIGN.md
  - _bmad-output/initiative-customer-ui-redesign/ux-fr-19/EXPERIENCE.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
---

<frozen-after-approval reason="customer selected FR-19 with the reviewed UX handoff">

## Intent

**Problem:** Customer navigation, request confirmation, and proposal review contain distracting prototype copy and weak hierarchy. The current brand mark does not match the red theme.

**Approach:** Apply the FR-19 UX handoff across the signed-in flow, retaining the existing API, policy status, assessment, quote, and decision behavior.

## Boundaries & Constraints

**Always:** Preserve synthetic-only and non-binding behavior, authorized routes, current status badge colors, visible outcome reasons, quote values, and keyboard access. Use the existing shadcn semantic theme.

**Never:** Change API contracts, evidence storage, calculation, policy writes, or approval semantics. Do not remove returned policy facts merely because their value contains “Synthetic”.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Policies | Active and expired policies | History button by heading, existing tinted status badges and arrows | Loading/empty/error states stay usable |
| Recorded request | Saved change | Request ID, status, values/date, separate eligibility action | No implied policy change |
| Assessment | Result with citations | Outcome, reasons, next step remain; source panel hidden | Error/retry remain visible |
| Proposal | Pending or decided | Current/proposed values and quote remain; specified notice and source panel hidden | Decision controls only while pending |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/policies/page.tsx` — history link, policy-list notice, shared header.
- `apps/web/src/policies/PolicyList.tsx` and `apps/web/src/app/styles.css` — retain active/expired classes and success/warning tokens; style new heading action and back-link spacing.
- `apps/web/src/auth/SignInScreen.tsx`, `apps/web/src/app/history/page.tsx`, and policy/request/proposal route pages — repeated brand mark and subtitle.
- `apps/web/src/policies/PolicyDetail.tsx` and `EvidenceSection.tsx` — remove specified footer and decorative evidence heading, preserve facts.
- `apps/web/src/endorsement/RecordedRequest.tsx`, `RequestForm.tsx`, `EligibilityCheck.tsx` — confirmation/assessment presentation; keep separate mutation.
- `apps/web/src/endorsement/ProposalReview.tsx`, `ProposalPage.tsx`, `ProposalDecision.tsx` — review hierarchy and decision presentation; keep mutation and state gates.
- Adjacent component tests and `e2e/` — observable seams. The three `design/page/fr-19-*.html` previews are references, not app stylesheets.

## Tasks & Acceptance

**Execution:**
- [x] Update component tests first for policies, confirmation, assessment, and proposal; record red/green evidence.
- [x] Update shared brand/header, policy history action, copy, and CSS without changing `PolicyList` status logic.
- [x] Restructure recorded request and proposal presentation; hide only source-detail blocks and specified notices.
- [ ] Update documentation and E2E criterion coverage for desktop and 320px.

**Acceptance Criteria:**
- Given a signed-in account, when Policies loads, then history is a button by the heading and status badges retain current colors and labels.
- Given a saved request, when confirmation appears, then its ID, change, date, pending-check status, and check action are clear and policy remains unchanged.
- Given an assessment or proposal, when viewed, then source-detail panels are absent while outcome, reasons, impact, and decision flow remain intact.
- Given loading, failure, empty, narrow, or decided state, when rendered, then the screen has a usable next action, visible focus, and no horizontal overflow.

## Implementation Notes

- Implemented shared red PE branding, policy history action, request confirmation, source-panel removal, and proposal presentation in the existing web component seams.
- Focused red/green slices and final 63/63 web tests, typecheck, and format check passed. Browser E2E requires a disposable test database; the supplied Neon database contains historical application data and was not used as a test target.
- Criterion-by-criterion evidence and pending browser checks are recorded in `docs/implementation-plan/fr-19-criterion-traceability.md`.

## Plan Change Log

## Review Triage Log

- Quick review: confirmation focus landed on the page heading. Confirmed and moved focus to the confirmation panel heading; the component regression and browser assertion now check that heading.
- Quick review: browser visual and boundary coverage remains pending. Component tests cover loading, empty, failure, referral, rejection, session end, and decided states; CI's disposable test database will run the desktop and 320px browser journey. Screenshots are attached for review; visual baseline comparison remains an explicit acceptance check.

## Verification

Criterion mapping and red/green results: [FR-19 criterion traceability](fr-19-criterion-traceability.md). Browser verification requires a disposable synthetic database; the supplied Neon database contains historical application records and is excluded from test use.

**Commands:**
- `npm run typecheck` — affected workspaces typecheck.
- `npm run format:check` — application source formatting passes.
- `npm test` — affected component and API contracts pass.
- `npm run test:e2e` — FR-19 browser journey and report recorded.
