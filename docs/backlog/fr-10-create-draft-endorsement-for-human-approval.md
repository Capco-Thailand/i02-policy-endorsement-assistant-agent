# FR-10 — Create Draft Endorsement for Human Approval

**Title:** [Story] Create Draft Endorsement for Human Approval
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-10
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — a draft with incorrect evidence or status could be mistaken for approved coverage.
**State:** Backlog draft

## Summary and objective

Save a non-binding `DRAFT` with proposed changes, quote, and supporting evidence; submit as `PENDING_APPROVAL`.

## User story or requirement

System requirement: Save a non-binding `DRAFT` with proposed changes, quote, and supporting evidence; submit as `PENDING_APPROVAL`.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Save proposed changes, mock premium impact, verification outcomes, and cited policy/rule evidence as non-binding `DRAFT` with `binding=false`.
- [ ] Submission changes status to `PENDING_APPROVAL`; neither action changes policy coverage.

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
