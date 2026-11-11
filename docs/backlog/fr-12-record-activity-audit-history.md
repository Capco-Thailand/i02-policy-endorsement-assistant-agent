# FR-12 — Record Activity & Audit History

**Title:** [Story] Record Activity & Audit History
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-12
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed Medium — missing audit evidence could prevent a decision from being explained.
**State:** Backlog draft

## Summary and objective

Log access, RAG sources, eKYC result, document bypass, quotes, draft creation, and reviewer decisions.

## User story or requirement

System requirement: Log access, RAG sources, eKYC result, document bypass, quotes, draft creation, and reviewer decisions.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Audit authenticated actor and action, policy access, RAG sources and versions, mock eKYC result, document bypass, quotes, draft creation, and reviewer decisions.
- [ ] Exclude credentials, session secrets, and unnecessary personal data.

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
