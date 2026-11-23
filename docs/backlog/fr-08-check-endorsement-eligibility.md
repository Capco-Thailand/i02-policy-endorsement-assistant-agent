# FR-08 — Check Endorsement Eligibility

**Title:** [Story] Check Endorsement Eligibility
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-08
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — an incorrect gate could allow a quote or draft for an ineligible request.
**State:** Backlog draft

## Summary and objective

Assess each submitted request against cited policy wording and applicable endorsement rules; explain eligible, ineligible, and referred cases.

## User story or requirement

System requirement: After API authorization and active-policy checks, the assistant assesses the requested change against both vector-retrieved policy wording and effective endorsement rules, returning a cited outcome and explanation.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] The API checks required inputs, ownership, and `ACTIVE` status before retrieval. For an authorized request, retrieve versioned passages from the selected policy wording and rules applicable to its product, change type, and effective date; include citations from both sources in the assessment.
- [ ] Return `CAN_PROCEED`, `CANNOT_PROCEED`, or `NEEDS_REVIEW`. `CANNOT_PROCEED` includes a customer-readable reason and supporting citations. `NEEDS_REVIEW` includes a customer-readable reason, identifies the missing, stale, conflicting, or otherwise unresolved policy or rule evidence, and includes relevant citations when available. Never invent a citation for missing evidence or imply that the request was approved or assigned to a reviewer.
- [ ] Only `CAN_PROCEED` may advance to recalculation when needed and proposal creation. FR-07 upload and receipt are outside this endorsement flow and cannot affect the assessment.
- [ ] Treat retrieved text and customer input as untrusted. Neither may override API authorization, tool gates, or the non-binding boundary. Record source IDs and versions with the outcome.

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
- 2026-11-23: Product flow revised: the assistant assesses cited policy wording and rules from vector retrieval; API gates and calculation remain deterministic. FR-07 receipt is not evidence of document suitability.

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
