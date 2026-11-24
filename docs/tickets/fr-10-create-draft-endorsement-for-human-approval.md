# FR-10 — Prepare Proposed Endorsement for Customer Review

**Title:** [Story] Prepare Proposed Endorsement for Customer Review
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/135
**Feature ID:** FR-10
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — a draft with incorrect evidence or status could be mistaken for approved coverage.
**State:** Ready for ticket/UX handoff

## Summary and objective

Save a non-binding `DRAFT` with proposed changes, cited assessment, and any required calculation result; present a proposed updated-policy view for customer review as `PENDING_APPROVAL`.

## User story or requirement

System requirement: Save a non-binding `DRAFT` with proposed changes, policy and rule citations, and recalculated premium or benefits when applicable; present it for customer review as `PENDING_APPROVAL`.

## Business or technical context

- The [PRD](../PRD.md) defines the non-binding boundary. [ADR](../ADR.md) keeps authorization, assessment, calculation, and writes behind Fastify. The [API contract](../API_DEVELOPMENT.md) defines saved requests, fresh FR-08 assessment, and FR-09 quote results.
- A proposal belongs to one saved request, its policy, and its requester. It stores the requested change, current policy facts, cited assessment, and exact quote or an explicit unchanged result. FR-11 owns the later decision; FR-12 owns approved-change history.

## Acceptance criteria

- [ ] A signed-in customer can prepare a proposal only for their own recorded request on their own active policy. The API rechecks ownership, policy status, and fresh FR-08 `CAN_PROCEED`. Unknown and foreign IDs get the same non-disclosing response. Other assessments, invalid requests, and expired policies create no proposal.
- [ ] Address and beneficiary requests use the FR-09 `UNCHANGED` result without calling the calculator. An eligible calculated change obtains the FR-09 quote before draft creation. Calculation failure creates no proposal and gives a retryable error; missing calculation is never shown as zero impact.
- [ ] Preparation persists one non-binding `DRAFT` per request with `binding=false`, proposed fields, current policy snapshot, policy and rule citations with source IDs, versions and sections, and the exact quote or explicit unchanged impact. Retrying returns the existing proposal without a duplicate or replacement quote.
- [ ] The owning customer opens the proposal as `PENDING_APPROVAL`. The screen compares current and proposed synthetic policy values, payment amount and schedule, annualized total, and benefits where relevant. It labels unaffected values “Unchanged,” displays citations, and states that a later approval records a decision only and leaves policy and coverage unchanged.
- [ ] A missing or expired session cannot prepare or read a proposal; foreign proposal and policy IDs have the same non-disclosing response. Assessment, quote, and storage failures do not advance status or appear successful. Repeated reads create no extra proposals.
- [ ] Preparation and presentation audit the actor, request, policy, outcome, citation source versions, calculation status, and proposal status without credentials or unnecessary personal data. Neither state writes policy facts, binds coverage, or uses FR-07 upload status.

## Scope and out of scope

In scope:
- The behavior in the draft criteria above, using synthetic data.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Customer approval/rejection and history (FR-11/FR-12), live pricing, issuance, and policy mutation.

## Dependencies
- FR-02 saved request, FR-03 owned policy, FR-08 fresh assessment, FR-09 quote contract, and [Neon persistence](../tickets/chore-migrate-persistence-to-neon.md) are implemented. FR-10 owns its proposal schema and workflow.

## Related subtasks

None identified; confirm during refinement.

## Accepted decisions and readiness
- 2026-11-23: Exclude FR-07 receipt and FR-06 results from the endorsement proposal.

- 2026-11-12: Prepare a proposed updated-policy view for the customer to review before approval; keep the draft non-binding.
- 2026-11-24: One proposal per request; draft creation and customer presentation are distinct; existing FR-09–FR-12 UX contracts govern the screen.
- Status: Requirements and UX references are ready for ticket/UX review. No unanswered decision blocks implementation after the handoff merges and the Issue exists.

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
