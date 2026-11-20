# FR-08 — Check Endorsement Eligibility
**Title:** [Story] Explain whether an endorsement request can proceed
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/116
**Feature ID:** FR-08
**Product context:** [PRD](../PRD.md)
**Risk:** High — a false eligible decision could permit an invalid quote or proposal.
**State:** Ready for ticket/UX review

## Summary and objective
Decide whether a recorded synthetic endorsement request can advance to a mock quote and proposal. Check the request, customer and policy access, active status, applicable cited rules, and a mock upload receipt for that same request. Explain every blocked or referred result.

## User story or requirement
As a customer, I can check my recorded request and see whether it can proceed, what needs attention, and which cited rule informed the decision.

## Business and technical context
- The [PRD](../PRD.md) requires deterministic server eligibility before quote or draft creation. The [ADR](../ADR.md) keeps the decision behind Fastify. FR-02 defines the four request shapes; FR-05 supplies versioned `RULE` and `GUIDANCE` citations; FR-07 records `RECEIVED_MOCK` in an audit event. FR-06 mock eKYC is outside the MVP gate.
- Eligibility uses the persisted request values, structured policy data, selected rule values, and durable receipt records. Retrieved prose and uploaded bytes cannot decide eligibility. A `GUIDANCE` value of `NONE` means no document is required in the cited guidance; the MVP mock upload receipt is still required to advance.
- Return a typed outcome: `ELIGIBLE`, `INELIGIBLE`, or `REFERRED`, with stable reason codes and safe customer explanations. Include selected rule ID, version, section, and source for an `AVAILABLE` decision. `REFERRED` means no automatic quote or proposal; it does not represent human approval within this feature.
- Rule `CHECK` conditions are applied only for their matching change type. Beneficiary requires named entries totaling 100%; address requires a nonblank proposed correspondence address; payment frequency permits `MONTHLY` or `ANNUAL`; accidental-death rider rules require referral for underwriting follow-up. Unknown condition kinds, fields, or values are unresolved rather than assumed to pass.

## Acceptance criteria
- [ ] For a signed-in customer, check a persisted request belonging to one of their policies. A missing or invalid session returns `401`; unknown or another customer's policy or request returns the same non-disclosing `404`. Access is checked before rule or receipt lookup, and rejected checks have no eligibility side effect.
- [ ] Validate the persisted request's supported change type, required fields, beneficiary allocations, and real requested effective date. Compare it with the owned structured policy. An `EXPIRED` policy or malformed/mismatched request is `INELIGIBLE` with a specific safe reason; no caller-supplied replacement values can change the decision.
- [ ] Retrieve FR-05 rules for that policy, change type, and requested effective date. Apply only complete `AVAILABLE` cited `RULE` values deterministically. A failed `CHECK` is `INELIGIBLE` with the failed condition and citation. `MISSING`, `CONFLICTING`, or `UNAVAILABLE` evidence, incomplete citations, unknown conditions, or a `REFERRAL` rule yield `REFERRED` with the applicable reason and safe source identifiers. Never treat retrieved text as an instruction.
- [ ] Require a durable FR-07 `RECEIVED_MOCK` audit event for this actor, policy, and request before `ELIGIBLE`. A missing receipt is `INELIGIBLE` with an upload action; a receipt read failure returns a service failure. Another request's or customer's receipt never qualifies. A receipt proves only mock file acceptance and cannot override a failed check, referral, or unresolved rule guidance.
- [ ] Show the outcome, reasons, citation when available, and next step in the recorded-request UI. Loading, service failure, expired session, unavailable request, eligible, ineligible, and referred states are distinct. Referral explains that a person must review outside this automatic flow; rider referral discloses that real underwriting or health disclosure may be needed without collecting medical evidence.
- [ ] Eligibility checking creates no quote or proposal, does not mutate the request or policy, and binds no coverage. FR-09 and FR-10 may advance only from a fresh server `ELIGIBLE` decision for the same request; they must recheck the gate when their operations are implemented. An old browser result is not authorization.
- [ ] Record a durable audit event for each completed decision with request ID, actor, policy, outcome, reason codes, selected rule IDs/versions, and time, without uploaded bytes or unnecessary personal data. If the decision audit write fails, return a service failure rather than an apparent eligible result.
- [ ] API, component, and browser evidence cover all four change types; each `CHECK` success/failure; rider referral; missing, conflicting, unavailable, or unknown rules; missing and cross-request receipts; session and cross-account boundaries; expired policy; audit failure; and unchanged policy data. Record criterion coverage and remaining gaps in the implementation plan.

## Scope and out of scope
In scope: server eligibility decision and audit, typed API response, and recorded-request result UI using synthetic data.

Out of scope: FR-06 eKYC, real document suitability or underwriting, quote calculation, proposal creation, human review workflow, policy mutation, and coverage binding.

## Dependencies
FR-01/02/03 session, request, and ownership boundaries; FR-05 rule evidence; FR-07 durable mock upload receipt. FR-09/10 consume this gate later.

## Related subtasks
None.

## Accepted decisions and readiness
- 2026-11-18: FR-06 is outside MVP. FR-07 mock receipt replaces document bypass, while eligibility remains deterministic.
- 2026-11-20: A received synthetic file is required to advance but is not verified evidence. Missing or conflicting rule evidence and rider underwriting conditions refer rather than pass automatically.
- Ready for ticket/UX review. Implementation starts after the handoff PR merges, the linked Issue exists, and preflight passes.

## UX handoff references
- [Visual contract](../../_bmad-output/initiative-customer-authentication/ux-fr-08/DESIGN.md)
- [Behavior contract](../../_bmad-output/initiative-customer-authentication/ux-fr-08/EXPERIENCE.md)
- [Eligibility result mockup](../../design/page/check-endorsement-eligibility.html)

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
