# FR-07 — Bypass Document Verification (Mock)
**Title:** [Story] Record and display a document-check bypass
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/87
**Feature ID:** FR-07
**Product context:** [PRD](../PRD.md)
**Risk:** High — a bypass presented as verification could mislead customers.
**State:** Selected for ticket/UX handoff

## Summary and objective
Record `BYPASSED_MOCK` for a signed-in customer's own active-policy endorsement flow and show that no document verification occurred.

## User story or requirement
As a customer, I can see that document verification was skipped in this demonstration, so I do not mistake the result for a real check.

## Business and technical context
- [PRD](../PRD.md) requires an explicit, audited bypass. FR-01 session identity and FR-03 ownership checks provide the access boundary; FR-02 provides request context.
- `BYPASSED_MOCK` is a simulation marker, not a passing verification result. No file or document content is accepted.

## Acceptance criteria
- [ ] An authorized call for an owned active policy returns `BYPASSED_MOCK` with explicit wording that document verification was skipped; the UI shows this beside the status.
- [ ] The API records actor, policy, request context, status, and time in a durable audit event. Failed audit writes fail the operation. Audit data excludes credentials, session secrets, and document contents.
- [ ] Missing session returns `401`; unknown or unowned policy returns the same non-disclosing `404`; expired policy cannot pass. Rejected calls record no successful bypass.
- [ ] No upload, file storage, OCR, signature analysis, document inspection, or authenticity check is invoked or added. The bypass creates no quote, draft, policy change, or coverage binding.
- [ ] API schema, UI states, and focused tests cover success, disclosure, session failure, cross-account access, expired policy, and audit failure.

## Scope and out of scope
In scope: authenticated bypass API, audit event, and customer-facing mock disclosure.
Out of scope: real document verification, upload, OCR, identity checks, eligibility, quote, and draft.

## Dependencies
FR-01, FR-02, and FR-03 are implemented. No RAG dependency. FR-06 is a separate mock check; FR-08 consumes both results later.

## Related subtasks
None.

## Accepted decisions and readiness
- 2026-11-17: `BYPASSED_MOCK` never means verified.
- Ticket and UX handoff require review before implementation.

## UX handoff references
- [Visual contract](../../_bmad-output/initiative-customer-authentication/ux-mock-verification/DESIGN.md)
- [Behavior contract](../../_bmad-output/initiative-customer-authentication/ux-mock-verification/EXPERIENCE.md)
- [Mock verification page](../../design/page/mock-verification.html)

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
