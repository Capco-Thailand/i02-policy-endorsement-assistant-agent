---
title: FR-11 Customer Review and Decision
type: feature
ticket: fr-11-review-approve-reject-endorsement-draft
created: 2026-11-24
status: built
baseline_revision: 57f058b6a059e6ee72479f7efe340aaa59fa8fe4
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/fr-11-review-approve-reject-endorsement-draft.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - _bmad-output/initiative-customer-authentication/ux-fr-09-12/DESIGN.md
  - _bmad-output/initiative-customer-authentication/ux-fr-09-12/EXPERIENCE.md
  - design/page/proposal-review.html
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The owner can review an FR-10 proposal but cannot record a final customer decision. The prototype must show a dated decision without changing policy or coverage.

**Approach:** Add an owner-scoped, transactional decision API and a proposal-page decision section. Reuse the saved proposal values and citations; approval is direct and rejection requires confirmation.

## Boundaries & Constraints

**Always:** Require a valid session, owned policy and proposal, and prior `PENDING_APPROVAL` presentation. Use server time. Return the original result for same-decision retries; reject the opposite decision. Commit decision and minimal audit together.

**Never:** Trust client identity, proposed values, or time; recalculate, mutate policy facts, bind coverage, or invoke reviewer or issuance work. FR-12 owns the history page.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Approve | Owned, presented proposal | `APPROVED` and server time; dated summary | Atomic audit |
| Reject | Owned, presented proposal | Confirmation then `REJECTED` and time | Cancel makes no request |
| Retry | Same final choice | Original result and time | No second audit |
| Conflict | Opposite final choice | Preserve first decision | `409` |
| Unauthorized | No session or foreign/mismatched IDs | No decision or disclosure | `401` or uniform `404` |
| Storage failure | Decision or audit write fails | No apparent success; retry possible | Service error |

</frozen-after-approval>

## Code Map

- `apps/api/src/auth/guards.ts`: align `mayDecideProposal` with stored proposal owner field; use it at the decision boundary.
- `apps/api/src/app.ts`: extend `ProposalSchema`, add validated decision route beside proposal GET; keep HTTP mapping in handler.
- `apps/api/src/db.ts`, `apps/api/sql/005_proposals.sql`: add migration 006 for final statuses and `decided_at`; one conditional, owner-scoped transaction writes status and audit. Preserve `presentProposal` behavior.
- `apps/api/src/proposal.test.ts`, `apps/api/src/proposal.contract.test.ts`, DB integration tests: reuse FR-10 fixtures and public `app.inject`/real database seams.
- `apps/web/src/lib/api.ts`, `queries.ts`, generated `api-types.ts`: typed mutation, cache update, and API contract; no direct fetch in components.
- `apps/web/src/endorsement/ProposalPage.tsx`, `ProposalReview.tsx`: add decision section after notice; reuse comparison and citation rendering. Add a focused section component only if it owns the confirmation and mutation state.
- `apps/web/src/endorsement/*.test.tsx`, `e2e/`: verify visible result, retry, confirmation, keyboard behavior, and owner boundary.
- `docs/API_DEVELOPMENT.md`: document decision route and state/error contract.

## Tasks & Acceptance

**Execution:**
- [ ] Add failing API contract tests in `apps/api/src/proposal.test.ts` and `proposal.contract.test.ts` for decision, authorization, idempotency, and response shape; record red/green.
- [ ] Add failing real-DB integration cases for transaction rollback, concurrent decisions, one audit, and unchanged policy; record red/green.
- [ ] Implement migration 006, database decision method, guard alignment, validated route, and OpenAPI schema in `apps/api/`.
- [ ] Add failing UI tests in `apps/web/src/endorsement/ProposalPage.test.tsx` and `ProposalReview.test.tsx` for direct approval, confirmed rejection, Cancel, error retry, final summary, and focus; record red/green.
- [ ] Regenerate `apps/web/src/lib/api-types.ts`; implement API mutation/query handling and focused proposal-page controls.
- [ ] Add browser cases for the two customer decisions, cancel, retry, and cross-account boundary; capture screenshots and dated HTML report.
- [ ] Update `docs/API_DEVELOPMENT.md` and criterion traceability; inspect the full diff and review the security and accessibility boundaries.

**Acceptance Criteria:**
- Given an owned presented proposal, when its owner reviews it, then exact saved comparison, citations, applicable calculation, unchanged values, and non-binding notice precede decision actions.
- Given an owned presented proposal, when the owner approves or confirms rejection, then the view and response show the immutable decision and server time; Cancel performs no write, and failure retains retry controls.
- Given no valid session or a foreign, unknown, or mismatched policy/proposal, when a decision or result read is attempted, then the response is `401` or indistinguishable `404` as applicable and no write occurs.
- Given a final proposal, when the same choice is retried, then the original time and single audit remain; an opposite or concurrent competing choice cannot replace the result.
- Given a decision storage or audit failure, when the request returns, then no decision appears committed; neither successful choice changes the underlying policy or invokes calculation or issuance.

## Implementation Notes

Implemented the transactional decision API, client controls, and final-state summary. Review found two keyboard focus faults in rejection confirmation; both were fixed before browser verification. Hosted PostgreSQL integration passed 2/2, API suite 109/109 with extended hosted-DB timeouts, focused web tests 7/7, and FR-11 browser scenarios 4/4. Desktop and narrow proposal baselines passed after review. Full non-visual browser suite passed 38/38. The full default test command still times out on unrelated slow FR-04/FR-05 hosted-DB cases; the full local browser suite still fails two pre-existing policy-detail baselines.

## Plan Change Log

## Review Triage Log

- `medium`, patch: `ProposalDecision.tsx` permits keyboard focus to leave the rejection confirmation and reach Approve; the same screen keeps both controls mounted. Contain focus while confirmation is open.
- `medium`, patch: confirming rejection removes the focused button and success replaces decision controls without focusing the recorded summary. Move focus to a logical completion target.

## Design Notes

The proposal page already owns loading and failure states. Keep comparison and citations in `ProposalReview`; put transient confirmation and mutation state in a decision section after the notice. Use semantic buttons, a confirmation dialog with focus restoration, a polite success live region, and an alert for failed writes. Follow the UX spines over mockup differences.

## Verification

**Commands:**
- `npm run ticket:preflight -- docs/tickets/fr-11-review-approve-reject-endorsement-draft.md`
- `npm test`
- `npm run typecheck`
- `npm run format:check`
- `npm run build`
- `npm run test:e2e`

**Manual checks:**
- Compare desktop and narrow proposal screenshots with the reviewed UX and mockup; inspect audit rows for minimal metadata and policy rows for unchanged facts.
