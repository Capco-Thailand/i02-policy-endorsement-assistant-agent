# FR-07 — Bypass Document Verification (Mock)

**Title:** [Story] Bypass Document Verification (Mock)
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-07
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — presenting a bypass as verification could mislead customers.
**State:** Backlog draft

## Summary and objective

Record `BYPASSED_MOCK` without inspecting or validating uploaded documents.

## User story or requirement

System requirement: Record `BYPASSED_MOCK` without inspecting or validating uploaded documents.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Return and audit `BYPASSED_MOCK` without upload, OCR, signature analysis, file inspection, or authenticity checks.
- [ ] Make the bypass visible as a simulation; never describe it as real verification.

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
