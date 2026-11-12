# FR-11 — Customer Review & Approve/Reject Proposed Endorsement

**Title:** [Story] Customer Review & Approve/Reject Proposed Endorsement
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-11
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — a cross-account decision or misleading approval status could expose data or imply live coverage changed.
**State:** Backlog draft

## Summary and objective

A signed-in customer reviews the proposed updated-policy view for their own request and records an `APPROVED` or `REJECTED` decision. Approval adds the proposed change to that customer's history page; no later reviewer or issuance step runs.

## User story or requirement

System requirement: Allow the owning customer to review the proposed updated-policy view and record an `APPROVED` or `REJECTED` decision; show approved changes in that customer's history without changing live coverage.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] The signed-in customer sees current and proposed policy values, mock premium impact, and the non-binding boundary before deciding on their own submitted request.
- [ ] Only the owning customer may record `APPROVED` or `REJECTED`; a different customer or forged identity or policy ID cannot decide or view the proposal.
- [ ] An approved proposal appears in that customer's history with the proposed change, decision, and time. Rejection is recorded without applying a change. Neither decision changes the underlying policy record or binds coverage; no later review or issuance step runs.

## Scope and out of scope

In scope:
- The behavior in the draft criteria above, using synthetic data.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Further exclusions to confirm during refinement.

## Dependencies

- Determine prerequisites and sequencing with the Product Owner.

## Related subtasks

None identified; confirm during refinement.

## Accepted decisions and readiness

- 2026-11-12: The owning customer reviews and approves or rejects the proposal. No separate staff reviewer or later issuance step is part of this prototype.
- Open question: Confirm precise inputs, error cases, dependencies, and any UX handoff before implementation.
- Status: Backlog draft; not ready for implementation or Issue creation.

## UX handoff references

- Not yet identified; add design documents and browser-viewable mockups if this ticket includes UI.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
