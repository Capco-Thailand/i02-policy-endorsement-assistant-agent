# FR-05 — Retrieve Endorsement Rules with RAG

**Title:** [Story] Retrieve Endorsement Rules with RAG
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-05
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — the wrong rule could lead to an invalid eligibility decision.
**State:** Backlog draft

## Summary and objective

Fetch change-specific rules and document requirements with citations and effective dates.

## User story or requirement

System requirement: Fetch change-specific rules and document requirements with citations and effective dates.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Select applicable rules by product, change type, and effective date; return rule citations and versions.
- [ ] Missing or conflicting rules require human referral.
- [ ] Return any applicable document guidance for the change with source citation, version, and effective date; distinguish a source that says no document is required from missing or conflicting guidance. FR-07 presents this guidance without using it to validate uploaded content.
- [ ] For accidental-death rider additions, surface any rule calling for health disclosure or underwriting as a real-world follow-up; do not request medical evidence in the MVP or claim the mock upload satisfies underwriting.

## Scope and out of scope

In scope:
- The behavior in the draft criteria above, using synthetic data.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Further exclusions to confirm during refinement.

## Dependencies
- Follow the [ADR](../ADR.md) API boundary and Neon application persistence decision. Choose rule retrieval storage and any pgvector use during FR-05 refinement; the Neon migration does not implement RAG.

- Determine prerequisites and sequencing with the Product Owner.

## Related subtasks

None identified; confirm during refinement.

## Accepted decisions and readiness
- 2026-11-18: Include cited document guidance for FR-07, but keep uploaded bytes outside the RAG corpus and do not infer document verification from retrieval.

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
