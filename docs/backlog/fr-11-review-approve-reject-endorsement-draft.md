# FR-11 — Review & Approve/Reject Endorsement Draft

**Title:** [Story] Review & Approve/Reject Endorsement Draft
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-11
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — self-review or an unauthorized decision could bypass human control.
**State:** Backlog draft

## Summary and objective

A signed-in staff member assigned to the policy, other than the creator, can review a submitted draft and record an `APPROVED` or `REJECTED` decision; staff can track status.

## User story or requirement

System requirement: A signed-in staff member assigned to the policy, other than the creator, can review a submitted draft and record an `APPROVED` or `REJECTED` decision; staff can track status.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] A different signed-in staff member assigned to the policy may record `APPROVED` or `REJECTED` on a submitted draft.
- [ ] The creator may not review their own draft. A decision never updates or binds a policy.

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
