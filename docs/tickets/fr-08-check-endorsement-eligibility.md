# FR-08 — Check Endorsement Eligibility
**Title:** [Story] Explain whether an endorsement request can proceed
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/116
**Feature ID:** FR-08
**Product context:** [PRD](../PRD.md)
**Risk:** High — a false eligible decision could permit an invalid quote or proposal.
**State:** Revised assessment merged in PR #124; FR-09/FR-10 gate integration remains pending

## Summary and objective
Assess whether a recorded synthetic endorsement request can proceed by checking cited passages from both the authorized policy wording and applicable endorsement rules. Explain every negative or unresolved result to the customer.

## User story or requirement
As a customer, I can check my recorded request and see a preliminary `CAN_PROCEED`, `CANNOT_PROCEED`, or `NEEDS_REVIEW` result with a reason and relevant policy and rule citations.

## Business and technical context
- The [PRD](../PRD.md) requires an assistant assessment grounded in cited policy wording and rules. Fastify enforces the session, ownership, active status, required fields, evidence scope, and tool gates. FR-02 defines request shapes; FR-04 and FR-05 supply versioned policy and rule evidence. FR-06 and FR-07 are outside the MVP assessment gate.
- Use the persisted request and authorized structured policy fields to select and reconcile evidence. Missing, stale, conflicting, or unavailable evidence cannot produce `CAN_PROCEED`. Retrieved prose and customer input are untrusted and cannot override API gates or invent monetary amounts.
- Return typed `CAN_PROCEED`, `CANNOT_PROCEED`, or `NEEDS_REVIEW` results with stable reason codes and safe customer explanations. `NEEDS_REVIEW` is a preliminary result; it does not assign an operational reviewer or authorize a quote or proposal.
- PR #124 replaced the earlier outcome contract and receipt-dependent checks with cited policy-and-rule assessment. FR-09 and FR-10 are not yet implemented, so their fresh-server gate must be verified when those features are built.

## Acceptance criteria
- [ ] For a signed-in customer, check a persisted request belonging to one of their policies. A missing or invalid session returns `401`; unknown or another customer's policy or request returns the same non-disclosing `404`. Check access, required fields, and `ACTIVE` status before policy or rule retrieval. Rejected checks do not retrieve evidence or produce an assessment.
- [ ] For an authorized request, retrieve versioned passages from the selected policy wording and effective rules matching its product, change type, and requested effective date. Reconcile structured decision fields with the owned policy. A preliminary positive assessment includes citations from both sources; never invent a citation or silently replace structured facts.
- [ ] Return `CAN_PROCEED`, `CANNOT_PROCEED`, or `NEEDS_REVIEW`. `CANNOT_PROCEED` includes a customer-readable reason and supporting citations. `NEEDS_REVIEW` identifies missing, stale, conflicting, unavailable, or otherwise unresolved policy or rule evidence, provides a customer-readable reason, and includes relevant citations when available. Neither result implies approval or an assigned reviewer.
- [ ] Only a fresh server `CAN_PROCEED` result for the same request may advance to FR-09 calculation when needed or FR-10 proposal creation. FR-07 upload and receipt are outside this flow and cannot affect any assessment outcome. An old browser result is not authorization.
- [ ] Show outcome, explanation, citations, and the next step in the recorded-request UI. Loading, service failure, expired session, unavailable request, `CAN_PROCEED`, `CANNOT_PROCEED`, and `NEEDS_REVIEW` states are distinct. If a rider rule mentions real underwriting or health disclosure, explain that later real-world review may be needed without collecting medical evidence.
- [ ] Treat retrieved text and customer input as untrusted. Neither may override ownership, active status, tool gates, or the non-binding boundary. Assessment creates no quote or proposal, does not mutate the request or policy, and binds no coverage.
- [ ] Record a durable audit event for each completed assessment with request ID, actor, policy, outcome, reason codes, policy and rule source IDs/versions, and time, without unnecessary personal data. If the audit write fails, return a service failure rather than an apparent `CAN_PROCEED` result.
- [ ] API, component, and browser evidence covers all four change types; positive, negative, and unresolved cited cases; missing/stale/conflicting policy or rule evidence; prompt-like source text; session and cross-account boundaries; expired policy; service and audit failures; no upload; and unchanged policy data. Record criterion coverage and remaining gaps in the implementation plan.

## Scope and out of scope
In scope: preliminary server assessment and audit, typed API response, and recorded-request result UI using synthetic data.

Out of scope: FR-06 eKYC, real document suitability or underwriting, quote calculation, proposal creation, human review workflow, policy mutation, and coverage binding.

## Dependencies
FR-01/02/03 session, request, and ownership boundaries; FR-04 policy wording; FR-05 rule evidence. FR-09/10 consume the fresh server assessment gate. FR-07 upload is outside this flow.

## Related subtasks
None.

## Accepted decisions and readiness
- 2026-11-23: The assistant assesses cited policy wording and rules; upload is outside the flow. `NEEDS_REVIEW` explains unresolved evidence without assigning a reviewer.
- 2026-11-23: PR #124 reconciled the API, UI, audit, and source citations with this ticket. CI run 45135833676 passed PostgreSQL, component, and browser tests. The [implementation plan](../implementation-plan/fr-08-check-endorsement-eligibility.md) records criterion coverage and the future FR-09/FR-10 gate gap.

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
