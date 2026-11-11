# FR-09 — Calculate Premium Impact (Mock Quote)

**Title:** [Story] Calculate Premium Impact (Mock Quote)
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-09
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed Medium — an incorrect non-binding estimate could mislead staff.
**State:** Backlog draft

## Summary and objective

Show estimated before/after premium and change amount from mock rating data.

## User story or requirement

System requirement: Show estimated before/after premium and change amount from mock rating data.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] For eligible requests with successful mock eKYC, calculate estimated before and after premiums from deterministic mock rating data.
- [ ] Support zero-premium-impact changes and show the change amount.

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
