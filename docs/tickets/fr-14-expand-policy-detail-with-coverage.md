# FR-14 — Expand Policy Detail with Product and Coverage Information
**Title:** [Story] Show product details and coverage summary on policy detail
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/127
**Feature ID:** FR-14
**Product context:** [PRD](../PRD.md)
**Risk:** High — incomplete or incorrect coverage details could mislead a customer about synthetic policy terms.
**State:** Ticket/UX handoff in review

## Summary and objective
Expand the existing policy detail view with synthetic insurer and product metadata, coverage amounts, and key exclusions, supported by versioned policy wording evidence.

## User story or requirement
As a customer viewing one of my synthetic policies, I can understand which product and plan it represents, what coverage amounts it lists, and which key exclusions apply, with citations to the source wording.

## Business or technical context
- The [PRD](../PRD.md) limits the prototype to synthetic policies and versioned mock policy documents. This feature must not connect to a live insurer, change a policy, or imply issued or bound coverage.
- The implemented [FR-03 policy detail](../tickets/fr-03-check-policy-access.md) shows policy ID, product label, status, effective and expiry dates, payment frequency, and beneficiaries. It does not currently return insurer identity, policy type, plan/version, coverage amounts, or exclusions.
- [FR-04](../tickets/fr-04-retrieve-policy-details-with-rag.md) supplies policy-scoped, versioned citations. Its current seeded evidence covers status, dates, payment frequency, and beneficiaries; it does not contain the new coverage details in this draft.
- Keep this as read-only policy information. Existing authorization, non-disclosing not-found behavior, active/expired request access, and non-binding boundaries remain in force.

## Accepted synthetic product terms
The following terms are fixtures for this prototype only. They describe no real insurer or issued coverage. Each policy's existing source document remains version `v1`; add the named sections to that policy-scoped document and keep structured policy values identical to its excerpts.

| Policy ID | Insurer display name | Type | Product / version | Coverage |
| --- | --- | --- | --- | --- |
| `POL-NARIN-001` | Example Mutual (Synthetic) | Life | Family Protection Plan / `v1` | Life benefit: `THB 1,000,000`; accidental death benefit: `THB 250,000` |
| `POL-MALI-001` | Example Mutual (Synthetic) | Life | Secure Future Plan / `v1` | Life benefit: `THB 750,000` |
| `POL-NARIN-002` | Example Mutual (Synthetic) | Life | Classic Life Plan / `v1` | Life benefit: `THB 500,000`; policy status remains `EXPIRED` |

For all three policies, `exclusions.life` states: “The life benefit does not cover death caused by intentional self-injury.” For `POL-NARIN-001` only, `exclusions.accidental-death` states: “The accidental death benefit does not cover death caused solely by illness, without an accident.” These are the complete key exclusions displayed in this prototype, not a claim about real-world policy terms.

Use `product` for insurer, type, product name, and version; `coverage.life` for the life amount and `coverage.accidental-death` for the Family Protection amount. Each exclusion has its own section as named above. Cite the existing policy-specific synthetic source title, version `v1`, and exact section ID beside each displayed term. Do not add an accidental death benefit to Secure Future or Classic Life. The expired Classic Life amount is historical policy information, not current coverage.

## Acceptance criteria
- [ ] For each seeded synthetic policy, the policy detail response and page show a synthetic insurer display name, policy type, product name, and plan or product version. These fields match the policy's versioned synthetic source.
- [ ] All three seeded policies use the accepted synthetic product terms and section IDs above; source excerpts and structured values match exactly.
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
- 2026-11-23: Customer approved the three-product synthetic coverage draft, including amounts, currency, and displayed exclusions. The exact `v1` source sections above are the implementation contract.
- 2026-11-23: UX handoff updated to the accepted fixture terms; mockup remains a static preview rather than seeded API data.
- Status: Requirements and UX handoff are ready for review. Create the tracking Issue after the ticket/UX PR merges, then run implementation preflight.

## UX handoff references
- [Existing policy detail visual contract](../../_bmad-output/initiative-customer-authentication/ux-fr-03/DESIGN.md) — baseline only; extend during refinement.
- [Existing policy detail experience contract](../../_bmad-output/initiative-customer-authentication/ux-fr-03/EXPERIENCE.md) — baseline only; extend during refinement.
- [Current policy detail mockup](../../design/page/policy-detail.html) — FR-03 baseline; FR-14 has a separate expanded-detail mockup below.
- [FR-04 evidence mockup](../../design/page/policy-evidence.html) — citation presentation reference.
- [FR-14 visual contract](../../_bmad-output/initiative-customer-authentication/ux-fr-14/DESIGN.md) and [experience contract](../../_bmad-output/initiative-customer-authentication/ux-fr-14/EXPERIENCE.md) — expanded detail handoff.
- [FR-14 expanded policy detail mockup](../../design/page/policy-detail-coverage.html) — accepted synthetic terms and preview states.

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
