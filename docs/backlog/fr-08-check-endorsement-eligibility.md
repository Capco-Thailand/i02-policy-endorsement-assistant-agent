# FR-08 — Check Endorsement Eligibility

**Title:** [Story] Check Endorsement Eligibility
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-08
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — an incorrect gate could allow a quote or draft for an ineligible request.
**State:** Backlog draft

## Summary and objective

Validate required inputs, authorization, active status, applicable rules, and mock upload receipt; explain blocked/referred cases.

## User story or requirement

System requirement: Validate required inputs, authorization, active status, applicable rules, and mock upload receipt; explain blocked/referred cases.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Check required inputs, authorization, `ACTIVE` policy status, applicable rules, and FR-07 `RECEIVED_MOCK` receipt for the same request before quotation or drafting. Do not require FR-06 mock eKYC.
- [ ] Explain ineligible, missing/failed upload, missing-rule, conflicting-rule, and referral outcomes without automatic quote or draft creation. Receipt does not establish document suitability or override a rule gate.

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
- 2026-11-18: FR-06 is outside MVP; FR-07 mock receipt replaces the document-bypass step, while rule eligibility remains deterministic.

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
