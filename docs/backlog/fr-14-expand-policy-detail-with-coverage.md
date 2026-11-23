# FR-14 — Expand Policy Detail with Product and Coverage Information
**Title:** [Story] Show product details and coverage summary on policy detail
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Not filed
**Feature ID:** FR-14
**Product context:** [PRD](../PRD.md)
**Risk:** High — incomplete or incorrect coverage details could mislead a customer about synthetic policy terms.
**State:** Backlog draft

## Summary and objective
Expand the existing policy detail view with synthetic insurer and product metadata, coverage amounts, and key exclusions, supported by versioned policy wording evidence.

## User story or requirement
As a customer viewing one of my synthetic policies, I can understand which product and plan it represents, what coverage amounts it lists, and which key exclusions apply, with citations to the source wording.

## Business or technical context
- The [PRD](../PRD.md) limits the prototype to synthetic policies and versioned mock policy documents. This feature must not connect to a live insurer, change a policy, or imply issued or bound coverage.
- The implemented [FR-03 policy detail](../tickets/fr-03-check-policy-access.md) shows policy ID, product label, status, effective and expiry dates, payment frequency, and beneficiaries. It does not currently return insurer identity, policy type, plan/version, coverage amounts, or exclusions.
- [FR-04](../tickets/fr-04-retrieve-policy-details-with-rag.md) supplies policy-scoped, versioned citations. Its current seeded evidence covers status, dates, payment frequency, and beneficiaries; it does not contain the new coverage details in this draft.
- Keep this as read-only policy information. Existing authorization, non-disclosing not-found behavior, active/expired request access, and non-binding boundaries remain in force.

## Acceptance criteria
- [ ] For each seeded synthetic policy, the policy detail response and page show a synthetic insurer display name, policy type, product name, and plan or product version. These fields match the policy's versioned synthetic source.
- [ ] The page shows each included coverage by name, its insured amount, and currency. It shows key exclusions or limitations in customer-readable language with the source title, version, and section citation.
- [ ] Coverage and exclusion details are returned only after the API verifies the signed-in customer's ownership of the policy. Missing sessions return `401`; unknown and unowned policy IDs return the same non-disclosing `404` without exposing policy or source details.
- [ ] Missing, stale, or conflicting coverage evidence is shown as unresolved with a clear explanation and relevant citation when available. The system does not infer or fabricate an insurer, coverage amount, exclusion, or source citation.
- [ ] Existing policy ID, status, dates, payment frequency, beneficiaries, synthetic-data disclosure, and active-policy request action remain available. An expired policy still cannot start a request.
- [ ] The expanded detail remains readable at 320px, keyboard accessible, and has distinct loading, unavailable, unresolved-evidence, and session-ended states.
- [ ] Seeded policy and source fixtures contain no real insurer or customer data. Viewing the details creates no request, quote, proposal, policy update, or coverage binding.
- [ ] API, UI, and browser evidence covers source-to-structured-data consistency, owner isolation, missing/stale/conflicting evidence, active and expired policies, and unchanged policy data. Record criterion coverage and remaining gaps in the implementation plan.

## Scope and out of scope
In scope:
- Synthetic insurer and product metadata, coverage amounts, and key exclusions for the seeded policies.
- Owner-authorized policy detail API and customer-facing summary with versioned policy-wording citations and unresolved states.

Out of scope:
- Live insurer data or integrations, policy recommendations, personalized suitability advice, underwriting interpretation, policy changes, new endorsement types, quotation, issuance, and coverage binding.

## Dependencies
- FR-03 owns the existing authorized policy list/detail flow and policy ownership boundary.
- FR-04 owns versioned synthetic policy documents and citations; this feature adds coverage content needed for the expanded summary.

## Related subtasks
None identified; confirm during refinement.

## Accepted decisions and readiness
- 2026-11-23: Keep all insurer, product, coverage, and exclusion content synthetic. Display coverage and exclusions with versioned source citations; do not infer missing terms.
- Open question: Define the coverage items and key exclusions to include for each seeded product, including their synthetic insured amounts and currencies.
- 2026-11-23: UX handoff drafted from current requirements. Illustrative mock terms are not fixture decisions; the open coverage-content question still blocks implementation and Issue creation.
- Status: Backlog draft; UX handoff exists, but product terms and ticket refinement remain open.

## UX handoff references
- [Existing policy detail visual contract](../../_bmad-output/initiative-customer-authentication/ux-fr-03/DESIGN.md) — baseline only; extend during refinement.
- [Existing policy detail experience contract](../../_bmad-output/initiative-customer-authentication/ux-fr-03/EXPERIENCE.md) — baseline only; extend during refinement.
- [Current policy detail mockup](../../design/page/policy-detail.html) — baseline only; update during UX handoff.
- [FR-04 evidence mockup](../../design/page/policy-evidence.html) — citation presentation reference.
- [FR-14 visual contract](../../_bmad-output/initiative-customer-authentication/ux-fr-14/DESIGN.md) and [experience contract](../../_bmad-output/initiative-customer-authentication/ux-fr-14/EXPERIENCE.md) — expanded detail handoff.
- [FR-14 expanded policy detail mockup](../../design/page/policy-detail-coverage.html) — illustrative synthetic values and preview states.

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
