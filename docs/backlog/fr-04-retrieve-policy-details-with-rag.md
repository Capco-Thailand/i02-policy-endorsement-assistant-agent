# FR-04 — Retrieve Policy Details with RAG

**Title:** [Story] Retrieve Policy Details with RAG
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-04
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — retrieval could disclose unauthorized policy evidence.
**State:** Backlog draft

## Summary and objective

Fetch relevant policy evidence with source citations and versions.

## User story or requirement

System requirement: Fetch relevant policy evidence with source citations and versions.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Retrieve authorized policy information filtered by policy ID and version, with original section citations.
- [ ] Check decision fields against structured records. Authorization must run before retrieval.
- [ ] Treat retrieved content as untrusted. Do not place identity documents in the vector index.

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
