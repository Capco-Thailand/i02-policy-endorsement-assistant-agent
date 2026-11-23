# FR-06 — Verify Customer Identity (Mock eKYC)
**Title:** [Story] Simulate identity checks during an endorsement request
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/85
**Feature ID:** FR-06
**Product context:** [PRD](../PRD.md)
**Risk:** High — a mock pass could be mistaken for real identity verification.
**State:** Removed from MVP scope; existing implementation is not an endorsement workflow gate

> 2026-11-18 scope decision: FR-06 is removed from the MVP journey. Retain this ticket and its Issue as the record of the earlier requirement. No later ticket may require a mock eKYC result to quote or draft. The mock endpoint and UI have been removed from the current implementation.

## Summary and objective
Evaluate deterministic synthetic identity scenarios for a signed-in customer's own active policy. Return `VERIFIED`, `FAILED`, or `REVIEW_REQUIRED` with a reason and a visible mock disclosure.

## User story or requirement
As a customer requesting a policy change, I can see the simulated identity result and understand whether this demonstration can continue.

## Business and technical context
- Historical requirement: the earlier [PRD](../PRD.md) required mock eKYC. The current MVP PRD removes it. FR-01 still supplies session identity and FR-03 still supplies ownership checks.
- The API derives identity from the session. The check does not establish a session or grant policy access. Only synthetic scenario IDs are accepted; no real identity documents, biometric data, or provider calls.

## Acceptance criteria
- [ ] Documented fixtures cover identity match, mismatch, expired ID, failed liveness, and inconclusive liveness. All-pass returns `VERIFIED`; mismatch, expiry, or failed liveness returns `FAILED`; inconclusive liveness returns `REVIEW_REQUIRED`. Each result includes a stable reason code and mock disclosure.
- [ ] The API checks session, ownership, and active policy before evaluating a scenario. Missing session returns `401`; unknown or unowned policy returns the same non-disclosing `404`; expired policy and unknown scenario cannot pass.
- [ ] Each completed check persists actor, policy, outcome, reason, and time in audit data. Failed audit writes fail the operation. Credentials, session tokens, identity documents, and biometric material are excluded.
- [ ] The UI labels every result as simulated, including failure and review states. Failed and review-required results cannot be treated as verified by later steps.
- [ ] The check creates no request, quote, draft, policy change, or coverage binding. API schemas and focused tests cover all scenarios and rejection paths.

## Scope and out of scope
In scope: synthetic fixture evaluation, authenticated API, audit result, and customer-facing mock result.
Out of scope: real eKYC, document upload, OCR, biometrics, provider calls, eligibility, quote, and draft.

## Dependencies
FR-01, FR-02, and FR-03 are implemented. No RAG dependency. FR-08 does not consume the optional mock eKYC result.

## Related subtasks
None.

## Accepted decisions and readiness
- 2026-11-17: Use deterministic synthetic scenarios only; never claim real verification.
- Ticket and UX handoff require review before implementation.

## UX handoff references
Historical design contracts are retained for traceability; the retired mock page was deleted.
- [Visual contract](../../_bmad-output/initiative-customer-authentication/ux-mock-verification/DESIGN.md)
- [Behavior contract](../../_bmad-output/initiative-customer-authentication/ux-mock-verification/EXPERIENCE.md)

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
