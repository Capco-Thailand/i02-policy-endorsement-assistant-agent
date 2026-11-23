# FR-10 — Prepare Proposed Endorsement for Customer Review

**Title:** [Story] Prepare Proposed Endorsement for Customer Review
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-10
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — a draft with incorrect evidence or status could be mistaken for approved coverage.
**State:** Backlog draft

## Summary and objective

Save a non-binding `DRAFT` with proposed changes, cited assessment, and any required calculation result; present a proposed updated-policy view for customer review as `PENDING_APPROVAL`.

## User story or requirement

System requirement: Save a non-binding `DRAFT` with proposed changes, policy and rule citations, and recalculated premium or benefits when applicable; present it for customer review as `PENDING_APPROVAL`.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Only an FR-08 `CAN_PROCEED` outcome may create a proposal. Save proposed changes, the cited policy-and-rule assessment, and any FR-09 calculation result as non-binding `DRAFT` with `binding=false`. FR-07 upload status is outside the proposal contract.
- [ ] After the FR-02 request has been assessed and any required calculation succeeds, presenting the proposal changes its status from `DRAFT` to `PENDING_APPROVAL` and shows current and proposed synthetic policy, premium, and benefit values, marking unchanged values when calculation was unnecessary. Neither state changes live policy coverage.

## Scope and out of scope

In scope:
- The behavior in the draft criteria above, using synthetic data.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Further exclusions to confirm during refinement.

## Dependencies
- Persist future drafts and their supporting evidence through the API's Neon-backed storage, following the [migration ticket](../tickets/chore-migrate-persistence-to-neon.md). FR-10 owns the new draft schema and workflow rules.

- Determine prerequisites and sequencing with the Product Owner.

## Related subtasks

None identified; confirm during refinement.

## Accepted decisions and readiness
- 2026-11-23: Exclude FR-07 receipt and FR-06 results from the endorsement proposal.

- 2026-11-12: Prepare a proposed updated-policy view for the customer to review before approval; keep the draft non-binding.
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
