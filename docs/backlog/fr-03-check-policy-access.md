# FR-03 — Check Policy Access

**Title:** [Story] Check Policy Access
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-03
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — incorrect access could expose another staff account's policy.
**State:** Backlog draft

## Summary and objective

Allow staff to view and act on only the synthetic policies assigned to them.

## User story or requirement

System requirement: Allow staff to view and act on only the synthetic policies assigned to them.

## Business or technical context

- Historical [Issue #3](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/3) covered backend policy access alongside list/detail and eligibility. Review its behavior and current code when refining this ticket.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Enforce policy access on the backend for every policy read and endorsement action; client-supplied ownership claims do not grant access.
- [ ] Return only assigned policies in list results. Reject unknown or unassigned policy IDs without disclosing policy or beneficiary details.
- [ ] Check authorization before retrieving policy evidence or creating a request, quote, or draft. Rejected actions do not change policy state or bind coverage.
- [ ] Use synthetic policy and assignment data only.

## Scope and out of scope

In scope:
- The behavior in the draft criteria above, using synthetic data.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Further exclusions to confirm during refinement.

## Dependencies

- FR-01 supplies authenticated staff identity; historical Issue #1 supplies policy list and detail entry points. Confirm their current implementation state when refining this draft.
- Open question: Compare historical Issue #3 with current code and identify any policy-access gaps before handoff.

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
