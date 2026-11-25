# FR-17 — Redesign Request and Eligibility

**Title:** [Story] Understand a requested change and its eligibility result
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-17
**Product context:** [PRD](../PRD.md)
**Risk:** High — confusing recorded requests with eligible changes could mislead customers.
**State:** Selected; accepted UX handoff ready for ticket/UX PR

## Summary and objective

Apply the accepted data hierarchy to the four change-request forms and their cited eligibility outcomes.

## User story or requirement

As a customer, I can see what I requested, whether it can proceed, why, and what happens next without mistaking request recording for approval or coverage change.

## Business or technical context

- Source: [initiative R4, R5, R8 and shared R9](../../_bmad-output/initiative-customer-ui-redesign/initiative-customer-ui-redesign.md). FR-02 owns request rules; FR-08 owns eligibility and citations.
- Current and requested values may be shown together only when the current value is available from an authorized source. An absent value must be labeled, not invented.
- Current beneficiaries and payment frequency come from the owner-authorized policy detail response. The response has no current correspondence address or rider on/off field. A confirmed cited accidental-death coverage term can be shown as coverage context, never as an inferred rider state. The browser may sum entered beneficiary percentages for form feedback; eligibility remains a server decision.

## Acceptance criteria

- [ ] Beneficiary, address, payment-frequency, and accidental-death-rider entry identify the authorized current value when available and the requested value before recording. The current address and rider state are explicitly unavailable; a confirmed accidental-death coverage term is labeled as coverage, with source access, not as rider state.
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

- 2026-11-25: The customer invoked `bmad do fr-17`, selecting the feature for delivery.
- 2026-11-25: The customer chose existing authorized policy detail fields for current-value context. Beneficiaries and payment frequency are available; the current correspondence address is not supplied. Confirmed cited accidental-death coverage may be shown, but the UI must not infer a rider on/off state.
- 2026-11-25: The customer accepted the proposed request and eligibility desktop/320px layouts as implementation references, including the previewed states.
- Readiness: accepted UX contracts and mockups are linked below; the ticket/UX PR and Issue link must merge before implementation preflight.

## UX handoff references

- [Initiative handoff](../UX_REDESIGN_HANDOFF.md) and [theme preview](../../design/page/shadcn-theme-preview.html).
- Accepted [visual contract](../../_bmad-output/initiative-customer-ui-redesign/ux-fr-17/DESIGN.md), [experience contract](../../_bmad-output/initiative-customer-ui-redesign/ux-fr-17/EXPERIENCE.md), and browser-viewable [request](../../design/page/fr-17-request.html) and [eligibility](../../design/page/fr-17-eligibility.html) mockups. [Validation record](../../_bmad-output/initiative-customer-ui-redesign/ux-fr-17/validation-report.md) covers preview states and responsive widths.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable browser and accessibility checks completed
- [ ] Requirements and UX references updated
- [ ] Code review and CI checks passed
- [ ] Ticket, Issue, PR, and handover linked
- [ ] No unresolved blockers
