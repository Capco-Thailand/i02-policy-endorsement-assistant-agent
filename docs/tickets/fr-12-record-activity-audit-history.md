# FR-12 — Customer Change History and Audit

**Title:** [Story] Customer Change History and Audit
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-12
**Product context:** [PRD](../PRD.md)
**Risk:** High — a cross-account history leak or incomplete audit would misrepresent a customer's decision.
**State:** Ready for ticket/UX handoff

## Summary and objective

Show each signed-in customer the approved, non-binding changes to their own synthetic policies. Preserve an explainable audit trail across policy access, assessment, calculation, proposal, and decision.

## User story or requirement

As a customer, I want to review my approved proposals and when I approved them, so that I can understand my recorded decisions without mistaking them for changes to my policy or coverage.

System requirement: Persist the actor, action, time, relevant policy/request/proposal identifiers, cited source versions, assessment outcome and reasons, calculation outcome when applicable, and final customer decision. Keep secrets and unnecessary personal details out of audit metadata.

## Business or technical context

- The [PRD](../PRD.md) makes approval a non-binding history record. The [ADR](../ADR.md) places authorization and persistence behind Fastify. [API development](../API_DEVELOPMENT.md) describes the existing session, proposal, and decision contracts.
- FR-10 stores the exact proposed values and citations. FR-11 stores one final decision with server time and writes its audit event atomically. The Neon PostgreSQL audit trail already stores access, assessment, quote, proposal, and decision events; FR-12 completes their identifying metadata and presents approved records.
- The history list derives from persisted approved proposals, not from current policy values or browser state. A detail link opens the existing owner-checked, recorded proposal view.

## Acceptance criteria

- [ ] A signed-in customer can open Customer change history from policy navigation. The list contains only their `APPROVED` proposals, each with policy identity, proposed change, `APPROVED`, server-recorded decision time, and a link to the recorded proposal. Newest decisions appear first, with a stable tie order. Rejected and pending proposals do not appear. Refresh and restart preserve the same records.
- [ ] The history API derives identity from the session and returns only approved proposals owned by that customer. Missing/expired session returns `401`; a customer cannot request another customer's history or follow a detail link to their proposal. Empty history returns an empty list. Storage failure returns a distinct error and does not appear as an empty history.
- [ ] The page shows an accessible empty state with a link to policies, and a distinct failure state with retry. It presents status and time as text, supports keyboard access and narrow screens, and explains that approval records a decision only: the underlying synthetic policy and coverage remain unchanged. The proposal detail retains the original comparison, citations, and decision time.
- [ ] Persisted audit events identify authenticated actor, action, and server time. Policy access events identify the policy where applicable. Assessment events retain outcome, reason codes, and policy/rule citations with source versions; calculator events identify success/failure and rating version or failure reason when applicable; proposal events identify the request/proposal and source versions; final decision events identify proposal, policy, decision, and time. Missing optional calculation creates no fictitious calculation event. Audit metadata contains no password, cookie, session secret, or unnecessary personal details.
- [ ] A history read and an approved detail read are owner-scoped. Neither read creates a proposal, calculation, decision, policy update, or coverage binding. Existing atomic FR-11 decision and audit behavior remains intact; a failed decision write cannot produce a history entry.

## Scope and out of scope

In scope:
- Owner-scoped approved history API and page, navigation, empty/error/accessibility behavior, audit metadata completion, and tests using synthetic data.

Out of scope:
- Rejected-decision history list, export, live insurer or policy integration, policy mutation, coverage binding, and a separate staff workflow. FR-07 upload events remain outside this endorsement audit flow.

## Dependencies

- The [Neon migration ticket](chore-migrate-persistence-to-neon.md), FR-10 proposal persistence/view, and FR-11 final decisions are implemented. FR-01 session and FR-03 ownership checks remain in force.

## Related subtasks

None.

## Accepted decisions and readiness

- 2026-11-12: Customer approval adds the proposed change to that customer's history without further processing.
- 2026-11-23: Audit preliminary assessment outcomes and reasons; calculation events are conditional. FR-07 uploads are outside this flow.
- 2026-11-24: Show approved proposals only; rejected decisions remain on their proposal detail. Use the server-recorded FR-11 decision time and persisted FR-10 proposal snapshot. Reuse the existing UX handoff and proposal detail.
- Status: Requirements and UX handoff are ready for ticket/UX review. Implementation waits for the merged handoff and active Issue.

## UX handoff references

- [Visual contract](../../_bmad-output/initiative-customer-authentication/ux-fr-09-12/DESIGN.md)
- [Behavior contract](../../_bmad-output/initiative-customer-authentication/ux-fr-09-12/EXPERIENCE.md)
- [Customer change history mockup](../../design/page/change-history.html)
- [Proposal review mockup](../../design/page/proposal-review.html)

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
