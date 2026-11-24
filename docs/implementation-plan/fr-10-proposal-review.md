---
title: FR-10 Prepare Proposed Endorsement for Customer Review
type: feature
ticket: fr-10-create-draft-endorsement-for-human-approval
created: '2026-11-24'
status: built
baseline_revision: a762b8d7c28deb082aab36be11353af17aac0f8b
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
  - _bmad-output/initiative-customer-authentication/ux-fr-09-12/DESIGN.md
  - _bmad-output/initiative-customer-authentication/ux-fr-09-12/EXPERIENCE.md
---

<frozen-after-approval reason="ticket intent">

## Intent

**Problem:** Eligible customers cannot review a saved, cited, non-binding proposal. The existing quote route calculates impact but does not persist or present a draft.

**Approach:** Fastify rechecks the saved request and fresh assessment, obtains unchanged or calculated impact, and persists one proposal per request. The owning customer opens a proposal page that compares current and proposed values and explains the non-binding boundary.

## Boundaries & Constraints

**Always:** Authorize before evidence, quote, or storage access. Persist exact assessment citations and quote response, use one draft per request, and audit creation and presentation. Preserve synthetic-only values and an unchanged underlying policy.

**Never:** Let the browser calculate values, create a proposal after a failed gate, treat missing calculation as zero, expose another customer's record, or implement FR-11 decisions and FR-12 history here.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Eligible address | Owned active request, fresh `CAN_PROCEED` | One `DRAFT`, explicit unchanged impact, then `PENDING_APPROVAL` view | No calculator call |
| Eligible frequency | Owned active request, valid calculator response | One draft with exact THB quote and citations, then comparison view | Failed quote returns retryable failure and no draft |
| Blocked | Foreign, expired, invalid, or non-positive assessment | No proposal | Non-disclosing 404 or documented 409 |
| Repeat | Same request after successful creation | Existing proposal and original snapshot | No duplicate, quote, or extra creation audit |

</frozen-after-approval>

## Code Map

- `apps/api/src/app.ts`: existing `assess` and FR-09 quote route provide authorization, citation, and calculator patterns; reuse their gate logic without copying quote arithmetic into the browser.
- `apps/api/src/db.ts`, `apps/api/sql/`: PostgreSQL repository and ordered migrations; add atomic proposal insert/read/status transition and audit metadata without policy updates.
- `apps/api/src/endorsement/`: add proposal schemas and workflow; keep HTTP handlers focused on responses.
- `apps/web/src/lib/api.ts`, `routes.ts`, generated `api-types.ts`: typed API client and route map; regenerate types from OpenAPI.
- `apps/web/src/app/policies/[policyId]/request/`: existing request flow is the entry point. Add a focused proposal review screen and data hook; do not add FR-11 decision actions yet.
- `design/page/proposal-review.html`: comparison and evidence structure. `DESIGN.md` and `EXPERIENCE.md` govern copy, status, narrow layout, and accessibility.

## Tasks & Acceptance

**Execution:**
- [ ] Add API integration tests for authorization, eligibility, unchanged and calculated impact, duplicate preparation, storage failure, and no policy write; confirm focused red/green results.
- [ ] Add migration, repository operations, proposal schemas, and Fastify prepare/read routes with atomic state and audit writes.
- [ ] Add web component tests for comparison, unchanged fields, citations, loading/error states, and non-binding copy; confirm red/green results.
- [ ] Add API client, typed routes, proposal page, and request-flow navigation; regenerate API types.
- [ ] Update API developer documentation and FR-10 traceability; run browser scenarios and review the complete diff.

**Acceptance Criteria:**
- Given an owned, active saved request, when a proposal is prepared, then only fresh `CAN_PROCEED` can persist one non-binding draft with the requested change, current values, citations, and exact impact.
- Given an unchanged request, when prepared, then the calculator is not called and the UI marks premium and benefit unchanged.
- Given a calculated request, when the quote succeeds, then the UI shows returned THB payment and benefit values; on failure no proposal exists.
- Given a prepared proposal, when its owner opens it, then status becomes `PENDING_APPROVAL` and the page shows comparison, source versions and sections, and the non-binding notice.
- Given a foreign or missing record, expired session, storage failure, or repeated action, when accessed, then no data leak, false success, duplicate draft, policy mutation, or duplicate creation audit occurs.

## Implementation Notes

API proposal creation and presentation, PostgreSQL migration, generated web types, proposal page, and browser scenarios implemented. Focused API test first failed for missing routes and then passed; web review test first failed for a missing component and then passed. All review findings below were fixed before full verification.

## Plan Change Log

## Review Triage Log

- medium, patch: Existing proposal returned before active policy and fresh assessment checks; retries now recheck both without replacing the saved proposal.
- medium, patch: Equal benefit values lost the returned THB amount; the comparison now shows the amount and “Unchanged.”
- medium, patch: E2E signed out a separate request context; it now signs out through the page session.
- medium, patch: Storage failure looked like ineligibility; preparation now offers a retryable service error.
- high, patch: An internal quote request repeated assessment and could persist mismatched citations; calculation now uses the same fresh assessment snapshot.
- high, patch: PostgreSQL migration used text for a UUID request foreign key; it now uses UUID, and migration passed on a disposable database.
- low, patch: Playwright used an unsupported locator and strict matches for multiple citations; locators were corrected, and both FR-10 scenarios passed.

## Design Notes

The review page owns comparison and evidence sections; separate components only where they carry distinct data or state. Keep the request page as the entry point. Decision controls from the mockup belong to FR-11 and should not imply approval is available here.

## Verification

**Commands:**
- Focused API and web tests, recording red and green outcomes
- `npm test`
- `npm run typecheck`
- `npm run format:check`
- `npm run build -w apps/web`
- `npm run test:e2e`

Results on 24 November 2026: `npm test`, `npm run typecheck`, and `npm run format:check` passed with a disposable synthetic PostgreSQL database. `npm run build -w apps/web -- --webpack` passed. Default Turbopack build failed locally on port binding (`EPERM`), and the full browser suite had two pre-existing visual baseline mismatches. Focused `npm run test:e2e -- e2e/proposal.spec.ts` passed 4/4 with desktop and narrow visual comparisons and screenshots in the dated HTML report linked from the traceability record. Linux CI remains the final standard build and browser gate.

**Manual checks (if no CLI):**
- Compare desktop and narrow proposal screenshots with the reviewed UX contract and mockup.
