# FR-15 — Redesign Policy Detail and Proposal Review

**Title:** [Story] Compare sourced policy facts and proposed changes clearly
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-15
**Product context:** [PRD](../PRD.md)
**Risk:** High — a misleading comparison could make a non-binding proposal look like issued coverage.
**State:** Selected for delivery; ticket/UX handoff in review

## Summary and objective

Establish the customer UI redesign's first reference layouts on policy detail and proposal review, then implement the accepted presentation. These screens exercise the hardest data layout and provide reusable atomic patterns for FR-16 through FR-18.

## User story or requirement

As an authenticated customer, I can scan my current synthetic policy and compare each proposed change with its current value before recording a non-binding decision.

## Business or technical context

- Source: [initiative requirements R3, R6, R8, R9 and C1–C5](../../_bmad-output/initiative-customer-ui-redesign/initiative-customer-ui-redesign.md); [screen audit](../UX_DESIGN_AUDIT.md) records the options that informed the accepted FR-15 reference screens.
- FR-14 defines synthetic coverage, exclusions, and cited unresolved states. FR-10 and FR-11 define proposal values and decision behavior. This ticket changes their presentation, not their values or rules.
- The shadcn preset contract and FR-15 UX handoff together govern the accepted reference layouts.
- Use the runtime rose/Public Sans theme and shadcn/ui primitives. The UX handoff defines atoms, molecules, organisms, templates, and page states.

## Acceptance criteria

- [ ] Policy detail places status, term, coverage, beneficiaries, exclusions, and request availability in a clear reading order; each available sourced fact has a visible reference to its full citation, and unresolved facts explain what is unknown without invented amounts.
- [ ] Active and expired policies remain visibly distinct. Only an active policy offers a request action; viewing either policy creates no request or policy change.
- [ ] Proposal review aligns each current and proposed value by field, shows exact server-returned amounts and units, and labels changed and unchanged values without color alone. Unlike benefit types are not compared on a common scale.
- [ ] For a changed server quote, the view shows premium per installment, payment frequency, annualized scheduled total, and each applicable benefit with the correct current and proposed values; for an unchanged impact, it says which values remain unchanged without inventing a difference.
- [ ] Pending, approved, and rejected proposal states have distinct text labels. A non-binding explanation appears before decision actions; recording approval or rejection remains a history action only.
- [ ] Missing, stale, or conflicting policy evidence stays unresolved; a missing quote or proposal does not produce a client-calculated amount or a decision control. An unowned policy or proposal remains non-disclosing.
- [ ] Desktop and 320px layouts keep labels attached to values, provide keyboard access to evidence and actions, and avoid horizontal scrolling.
- [ ] `DESIGN.md`, `EXPERIENCE.md`, browser-viewable policy-detail and proposal-review mockups, and an atomic inventory record the accepted design; the mockups are linked from `design/page/index.html`.
- [ ] Synthetic browser scenarios cover cited and unresolved policy facts, changed and unchanged quote values, all proposal states, and the non-binding boundary without client-side eligibility, premium, or benefit calculation.

## Scope and out of scope

In scope: policy detail, its evidence presentation, proposal comparison and decision presentation, shared atomic patterns, responsive and accessible states.

Out of scope: new coverage terms, new quote or eligibility rules, issuance, policy writes, and redesign of the remaining screens (FR-16 through FR-18).

## Dependencies

- FR-14 coverage detail and citations are implemented; use their authorized synthetic fixtures and existing API boundary.
- FR-10/FR-11 supply proposal data and decision behavior. Their API boundary remains authoritative.
- Use the customer-selected lead question and accepted reference layouts when implementing the screens.

## Related subtasks

None yet; the atomic inventory belongs to this ticket rather than a separate implementation Issue.

## Accepted decisions and readiness

- 2026-11-25: Start with policy detail and proposal review at desktop and 320px, using the same synthetic policy; record customer feedback before extending patterns.
- 2026-11-25: FR-15 was selected as the first local ticket, then returned to the backlog at the user's request. The refined criteria are retained.
- 2026-11-25: The customer chose “What would this request change and cost?” as the lead question. Current policy coverage remains accessible as the baseline for comparison.
- 2026-11-25: The customer selected FR-15 for delivery and accepted the current policy-detail and proposal-review layouts as the implementation reference at desktop and 320px. No layout changes were requested.
- Readiness: requirements, UX handoff, and FR-10/FR-11/FR-14 dependencies are ready for ticket/UX review. Create the Issue after this PR merges, then run ticket preflight before implementation.
- High-risk review check: independently compare every displayed money and benefit value against the seeded server proposal and confirm that approval leaves the underlying policy unchanged.

## UX handoff references

- [Current shadcn theme contract](../../_bmad-output/initiative-pea-001-policy-list-and-detail/ux-chore-shadcn-preset/DESIGN.md) and [theme preview](../../design/page/shadcn-theme-preview.html) are visual sources, not accepted redesign layouts.
- Accepted [FR-15 visual contract](../../_bmad-output/initiative-customer-ui-redesign/ux-fr-15/DESIGN.md) and [experience contract](../../_bmad-output/initiative-customer-ui-redesign/ux-fr-15/EXPERIENCE.md).
- Accepted browser-viewable reference mockups: [policy detail](../../design/page/fr-15-policy-detail.html) and [proposal review](../../design/page/fr-15-proposal-review.html), each responsive through 320px.
- [UX validation report](../../_bmad-output/initiative-customer-ui-redesign/ux-fr-15/validation-report.md) records the resolved rubric and accessibility findings; screen-reader behavior remains an implementation check.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable browser and accessibility checks completed
- [ ] Requirements and UX references updated
- [ ] Code review and CI checks passed
- [ ] Ticket, Issue, PR, and handover linked
- [ ] No unresolved blockers
