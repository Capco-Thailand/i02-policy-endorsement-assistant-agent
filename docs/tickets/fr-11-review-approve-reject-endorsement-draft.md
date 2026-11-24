# FR-11 — Customer Review and Decision
**Title:** [Story] Customer Review and Decision
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-11
**Product context:** [PRD](../PRD.md)
**Risk:** High — a cross-account decision or misleading approval could expose a proposal or imply coverage changed.
**State:** Ready for ticket/UX handoff

## Summary and objective
Let the owning customer approve or reject an FR-10 proposal after reviewing it. Record one final, non-binding decision and its time. FR-12 presents approved changes in customer history.

## User story or requirement
As a signed-in customer, I want to decide on the proposed change to my own policy, so that my choice is recorded without changing my policy or coverage.

## Business or technical context
- The [PRD](../PRD.md) defines the non-binding boundary. [ADR](../ADR.md) keeps authorization and writes behind Fastify. The [API contract](../API_DEVELOPMENT.md) defines FR-10 proposal preparation and the `mayDecideProposal` guard.
- FR-10 saves a proposal as `DRAFT` and presents it as `PENDING_APPROVAL`. This decision uses that saved proposal and its exact values and citations; it does not reassess eligibility or recalculate a quote.
- The decision belongs to the authenticated proposal owner and the linked owned policy. Client-supplied identity, policy facts, proposed values, or decision time have no authority.

## Acceptance criteria
- [ ] The owning signed-in customer can review the FR-10 `PENDING_APPROVAL` comparison, citations, calculated impact when applicable, unchanged values, and explicit non-binding notice before choosing. Approval is a direct action; rejection requires confirmation with Cancel. The customer can decide only after the proposal is presented.
- [ ] Approve records `APPROVED`; confirmed rejection records `REJECTED`. The response and proposal view show the final decision and server-recorded time and replace decision controls with a recorded-decision summary. Canceling rejection makes no write. A failed write keeps the proposal undecided, displays an actionable error, and permits retry.
- [ ] Only the authenticated owner of the proposal and linked policy can decide or read its result. Missing or expired session returns `401`; unknown, foreign, or mismatched policy/proposal IDs return the same non-disclosing `404`. A forged customer ID, policy ID, or proposed value cannot authorize or alter the decision.
- [ ] A proposal accepts one final decision. A repeated request with the same decision returns the original status and time without another decision or audit record; an opposite decision returns a conflict and preserves the first result. Concurrent attempts cannot produce two final decisions.
- [ ] Approval and rejection write actor, proposal, request, policy, decision, and time to the audit trail atomically with the state change, without credentials or unnecessary personal data. Storage failure returns an error without apparent success. Neither choice modifies policy facts, binds coverage, invokes calculation, or starts reviewer or issuance work.

## Scope and out of scope
In scope:
- Decision API, persisted final status and time, proposal-page controls and result state, and decision audit using synthetic data.

Out of scope:
- FR-12 approved-change history page and broader audit trail; live insurer integration, policy mutation, coverage binding, staff approval, and issuance.

## Dependencies
- FR-10 proposal persistence and customer view are implemented. FR-01 session and FR-03 policy ownership checks remain in force. FR-12 consumes final decisions for customer history.

## Related subtasks
None.

## Accepted decisions and readiness
- 2026-11-12: The owning customer approves or rejects; no separate staff reviewer or issuance step runs.
- 2026-11-23: Calculation appears only when premium or benefits changed; approval remains non-binding.
- 2026-11-24: FR-11 owns the final decision and its audit; FR-12 owns the approved-change history page. One final decision is immutable, with idempotent same-decision retries.
- Status: Requirements and existing UX handoff are ready for ticket/UX review. Implementation waits for the merged handoff and active Issue.

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
