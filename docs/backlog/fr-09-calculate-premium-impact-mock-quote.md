# FR-09 — Calculate Premium and Benefit Impact (Mock Quote)

**Title:** [Story] Calculate Premium and Benefit Impact (Mock Quote)
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-09
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed Medium — an incorrect non-binding estimate could mislead customers.
**State:** Backlog draft

## Summary and objective

Call a separate deterministic calculation service when an eligible change affects premium or benefits, then show its returned values for review.

## User story or requirement

System requirement: For a request assessed as able to proceed, use a separate calculation service for affected premium and/or benefits; show the returned before/after values and changes.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] After FR-08 returns `CAN_PROCEED`, `BENEFICIARY` and `ADDRESS` changes do not call the calculation service; the proposal marks premium and benefit values unchanged. `PAYMENT_FREQUENCY` changes call it to recalculate payment amount and schedule; the covered benefit stays unchanged. `ACCIDENTAL_DEATH_RIDER` `ADD` or `REMOVE` calls it to recalculate affected premium and rider benefit. No `CANNOT_PROCEED` or `NEEDS_REVIEW` request calls it.
- [ ] Provide versioned, repeatably loadable synthetic rating fixtures for the seeded policies, including baseline premium, payment frequency, rider state and benefit values needed by both calculation paths. Reconcile the fixture's policy ID, product ID, and current payment frequency with the authorized structured policy; missing or contradictory baseline data blocks calculation and proposal creation.
- [ ] Run the calculator as a separate internal service, reached only by Fastify after authorization and the assessment gate. Its versioned request contains the request and policy IDs, product ID, requested effective date, change type and proposed fields, and validated current policy fields; it carries no customer name, credentials, or uploaded content. The calculator selects its versioned synthetic rating fixture by policy and product. The response contains the rating version, currency, before/after premium amounts and payment frequency, before/after applicable benefit values, and calculated differences. Fastify validates the response and passes returned values through unchanged; the assistant and browser do not calculate amounts.
- [ ] The same validated inputs and rating version produce the same result. Tests cover both no-call change types, all four payment frequencies, rider add/remove, unchanged benefit or zero premium difference where applicable, and exact before/after values from known synthetic fixtures.
- [ ] A missing fixture, invalid response, timeout, or calculation service failure blocks proposal creation and appears as a service failure, never as a zero change or eligibility failure. FR-07 upload and FR-06 eKYC are outside this flow; no calculation binds coverage or writes the underlying policy.

## Scope and out of scope

In scope:
- The behavior in the draft criteria above, using synthetic data.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Further exclusions to confirm during refinement.

## Dependencies

- FR-02 supplies validated change types and fields; FR-03 supplies the authorized structured policy; FR-08 supplies `CAN_PROCEED`. FR-09 owns synthetic rating fixtures and the internal calculator contract. FR-10 consumes the validated result; FR-13 starts the calculator service with the application.

## Related subtasks

None identified; confirm during refinement.

## Accepted decisions and readiness
- 2026-11-23: FR-08 `CAN_PROCEED` gates calls to the separate calculation service; recalculate only values affected by the request.
- 2026-11-23: Beneficiary and address changes require no calculation. Payment frequency and accidental-death rider changes use an internal calculator service with versioned synthetic rating data; FR-09 owns its contract and fixtures.

- Open question: Confirm precise inputs, error cases, dependencies, and any UX handoff before implementation.
- Status: Backlog draft; not ready for implementation or Issue creation.

## UX handoff references

- [Visual contract](../../_bmad-output/initiative-customer-authentication/ux-fr-09-12/DESIGN.md)
- [Behavior contract](../../_bmad-output/initiative-customer-authentication/ux-fr-09-12/EXPERIENCE.md)
- [Proposal review mockup](../../design/page/proposal-review.html)
- [Change history mockup](../../design/page/change-history.html)

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
