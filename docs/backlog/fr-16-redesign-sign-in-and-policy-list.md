# FR-16 — Redesign Sign-in and Policy List

**Title:** [Story] Find the right synthetic policy quickly
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Not filed
**Feature ID:** FR-16
**Product context:** [PRD](../PRD.md)
**Risk:** Medium — extra list facts could expose another customer's policy if authorization is weakened.
**State:** Backlog draft; UX review pending

## Summary and objective

Apply the accepted customer UI patterns to sign-in and the authorized policy list so the first action and policy choices are easy to scan.

## User story or requirement

As a synthetic demo customer, I can sign in and distinguish my available policies without opening each one.

## Business or technical context

- Source: [initiative R1, R2, R8 and shared R9](../../_bmad-output/initiative-customer-ui-redesign/initiative-customer-ui-redesign.md). FR-01 owns session behavior; FR-03 owns policy-list authorization.
- The current list response provides policy label, ID, and status. Any extra coverage, term, or payment facts need an explicitly authorized API response and source; the layout must not guess them.

## Acceptance criteria

- [ ] Sign-in presents the input action and synthetic-demo boundary clearly at desktop and 320px widths; form errors and ended sessions remain understandable with keyboard and screen reader use.
- [ ] The policy list lets a signed-in customer distinguish authorized policies using available sourced facts, with policy identity, active/expired state, and an explicit view action; expired values are labeled as historical where applicable.
- [ ] Loading, empty, error, session-ended, and narrow-width states communicate what is happening and what action is available without horizontal scrolling or color-only meaning.
- [ ] If richer list facts are approved, the API returns them only for the authenticated owner, including a defined unavailable or unresolved representation; unknown or unowned policies remain non-disclosing.
- [ ] The accepted `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable sign-in and policy-list mockups are linked from the ticket and `design/page/index.html`.
- [ ] Synthetic browser checks show sign-in, multiple distinguishable policies, expired status, empty and error states, and unchanged owner isolation.

## Scope and out of scope

In scope: sign-in presentation, policy-list data hierarchy, responsive states, and an authorized list-summary response only if explicitly approved.

Out of scope: identity-provider changes, policy-detail and proposal layout (FR-15), and any new policy data inferred in the browser.

## Dependencies

- FR-15 supplies the accepted atomic patterns and visual/experience contracts.
- Decide whether richer list facts require an authorized summary API before finalizing this ticket's data contract.

## Related subtasks

None identified.

## Accepted decisions and readiness

- Open: richer policy-list facts or current fields only; record the answer here before moving to `docs/tickets/`.
- Readiness: backlog draft. Complete UX mockups and data-source decision before the ticket/UX PR.

## UX handoff references

- [Initiative handoff](../UX_REDESIGN_HANDOFF.md) and [theme preview](../../design/page/shadcn-theme-preview.html).
- New `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable sign-in and list mockups: pending `bmad-ux` review.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable browser and accessibility checks completed
- [ ] Requirements and UX references updated
- [ ] Code review and CI checks passed
- [ ] Ticket, Issue, PR, and handover linked
- [ ] No unresolved blockers
