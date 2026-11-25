# FR-17 — Redesign Request and Eligibility

**Title:** [Story] Understand a requested change and its eligibility result
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Not filed
**Feature ID:** FR-17
**Product context:** [PRD](../PRD.md)
**Risk:** High — confusing recorded requests with eligible changes could mislead customers.
**State:** Backlog draft; UX review pending

## Summary and objective

Apply the accepted data hierarchy to the four change-request forms and their cited eligibility outcomes.

## User story or requirement

As a customer, I can see what I requested, whether it can proceed, why, and what happens next without mistaking request recording for approval or coverage change.

## Business or technical context

- Source: [initiative R4, R5, R8 and shared R9](../../_bmad-output/initiative-customer-ui-redesign/initiative-customer-ui-redesign.md). FR-02 owns request rules; FR-08 owns eligibility and citations.
- Current and requested values may be shown together only when the current value is available from an authorized source. An absent value must be labeled, not invented.

## Acceptance criteria

- [ ] Beneficiary, address, payment-frequency, and accidental-death-rider entry each identify the current value when available and requested value before recording; unavailable current values are explicit.
- [ ] Beneficiary entry shows each allocation percentage and the exact numeric total; any visual allocation aid also retains names, percentages, and an over/under/100% text state.
- [ ] After submission, the recorded request and its ID are distinct from the later eligibility result; the customer sees the next action and no suggestion that coverage changed.
- [ ] Can proceed, cannot proceed, and needs review each show a plain-language reason and next action; missing or conflicting evidence remains unresolved with available policy and rule citations.
- [ ] Invalid input, expired policy, session-ended, loading, API error, and 320px states remain usable by keyboard and do not rely on color alone.
- [ ] Accepted UX spines and browser-viewable request and eligibility mockups are linked from this ticket and `design/page/index.html`.
- [ ] Synthetic browser scenarios cover all four change types, invalid allocations, each eligibility outcome, and preservation of the server calculation and authorization boundary.

## Scope and out of scope

In scope: request and eligibility data presentation, responsive states, and accessible interaction using existing server decisions.

Out of scope: new change types, browser-side eligibility decisions, quote calculation, medical underwriting, or proposal review layout (FR-15).

## Dependencies

- FR-15 supplies the accepted atomic patterns and UX contracts.
- FR-02 and FR-08 remain the authoritative request and eligibility behavior contracts.

## Related subtasks

None identified.

## Accepted decisions and readiness

- Readiness: backlog draft. Confirm current-value sources and complete UX mockups before the ticket/UX PR.

## UX handoff references

- [Initiative handoff](../UX_REDESIGN_HANDOFF.md) and [theme preview](../../design/page/shadcn-theme-preview.html).
- New `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable request and eligibility mockups: pending `bmad-ux` review.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable browser and accessibility checks completed
- [ ] Requirements and UX references updated
- [ ] Code review and CI checks passed
- [ ] Ticket, Issue, PR, and handover linked
- [ ] No unresolved blockers
