# FR-18 — Redesign Decision History

**Title:** [Story] Find recorded non-binding decisions by policy
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Not filed
**Feature ID:** FR-18
**Product context:** [PRD](../PRD.md)
**Risk:** Medium — history wording can imply an approved request updated coverage.
**State:** Backlog draft; UX review pending

## Summary and objective

Apply the accepted customer UI patterns to decision history so each record is easy to identify and understand.

## User story or requirement

As a customer, I can find my recorded decision, identify its policy and request, and open the original proposal without believing my underlying policy changed.

## Business or technical context

- Source: [initiative R7, R8 and shared R9](../../_bmad-output/initiative-customer-ui-redesign/initiative-customer-ui-redesign.md). FR-12 owns history data and authorization; FR-11 owns proposal decisions.
- Use concise overview details. Full address or beneficiary data belongs in the authorized proposal, not the overview unless a reviewed requirement changes that rule.

## Acceptance criteria

- [ ] Each history entry identifies the decision date, policy, request summary, and approval or rejection state and links to the exact authorized proposal.
- [ ] The page explains near its heading that recorded approval is non-binding and did not update policy or coverage; status is text-labeled, not color-only.
- [ ] The overview avoids unnecessary full address and beneficiary detail while retaining enough context to distinguish records.
- [ ] Loading, empty, error, session-ended, multiple-record, and 320px states have a clear next action and no horizontal scrolling; links and controls work by keyboard.
- [ ] Accepted UX spines and browser-viewable history mockup are linked from this ticket and `design/page/index.html`.
- [ ] Synthetic browser checks cover approved and rejected records, policy identity, cross-account isolation, proposal links, and unchanged policy data.

## Scope and out of scope

In scope: decision-history information hierarchy, status presentation, navigation, and responsive states.

Out of scope: changing audit retention, policy records, decision semantics, or proposal calculation.

## Dependencies

- FR-15 supplies the accepted atomic patterns and proposal status presentation.
- FR-11 and FR-12 remain the authoritative decision and history contracts.

## Related subtasks

None identified.

## Accepted decisions and readiness

- Readiness: backlog draft. Complete history UX mockup and link accepted spines before the ticket/UX PR.

## UX handoff references

- [Initiative handoff](../UX_REDESIGN_HANDOFF.md) and [theme preview](../../design/page/shadcn-theme-preview.html).
- New `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable history mockup: pending `bmad-ux` review.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable browser and accessibility checks completed
- [ ] Requirements and UX references updated
- [ ] Code review and CI checks passed
- [ ] Ticket, Issue, PR, and handover linked
- [ ] No unresolved blockers
