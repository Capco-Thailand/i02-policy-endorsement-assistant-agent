# FR-16 — Redesign Sign-in and Policy List

**Title:** [Story] Find the right synthetic policy quickly
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-16
**Product context:** [PRD](../PRD.md)
**Risk:** Medium — changing list presentation must preserve owner isolation and session handling.
**State:** Selected; accepted UX handoff ready for ticket/UX PR

## Summary and objective

Apply the accepted customer UI patterns to sign-in and the authorized policy list so the first action and policy choices are easy to scan.

## User story or requirement

As a synthetic demo customer, I can sign in and distinguish my available policies without opening each one.

## Business or technical context

- Source: [initiative R1, R2, R8 and shared R9](../../_bmad-output/initiative-customer-ui-redesign/initiative-customer-ui-redesign.md). FR-01 owns session behavior; FR-03 owns policy-list authorization.
- The current list response provides policy label, ID, and status. FR-16 uses these fields only. Coverage, term, payment, and insurer facts remain on the authorized policy detail screen; the list must not guess them.

## Acceptance criteria

- [ ] Sign-in presents the input action and synthetic-demo boundary clearly at desktop and 320px widths; form errors and ended sessions remain understandable with keyboard and screen reader use.
- [ ] The policy list lets a signed-in customer distinguish authorized policies using the existing owner-authorized label, ID, and status, with an explicit view action; expired values are labeled as historical where applicable. Sign-out and customer-history navigation remain available.
- [ ] Loading, empty, error, session-ended, and narrow-width states communicate what is happening and what action is available without horizontal scrolling or color-only meaning.
- [ ] The policy list uses only owner-authorized label, ID, and status; unknown or unowned policies remain non-disclosing. No new policy summary API or browser-inferred fact is introduced.
- [ ] The accepted `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable sign-in and policy-list mockups are linked from the ticket and `design/page/index.html`.
- [ ] Synthetic browser checks show sign-in, multiple distinguishable policies, expired status, empty and error states, and unchanged owner isolation.

## Scope and out of scope

In scope: sign-in presentation, policy-list data hierarchy using current fields, and responsive states.

Out of scope: identity-provider changes, policy-detail and proposal layout (FR-15), and any new policy data inferred in the browser.

## Dependencies

- FR-15 supplies the accepted atomic patterns and visual/experience contracts.
- Existing FR-03 owner-authorized policy-list API supplies the selected fields; no API expansion is needed.

## Related subtasks

None identified.

## Accepted decisions and readiness

- 2026-11-25: The customer chose current list fields only: policy label, ID, and status. No authorized summary API expansion is in FR-16.
- 2026-11-25: The customer invoked `bmad do fr-16`, selecting the feature for delivery.
- 2026-11-25: The customer accepted the proposed sign-in and policy-list layouts as the implementation reference at desktop and 320px. No layout changes were requested.
- Readiness: accepted UX handoff; ticket/UX PR and linked Issue remain before implementation.

## UX handoff references

- [Initiative handoff](../UX_REDESIGN_HANDOFF.md) and [theme preview](../../design/page/shadcn-theme-preview.html).
- Accepted [FR-16 visual contract](../../_bmad-output/initiative-customer-ui-redesign/ux-fr-16/DESIGN.md), [experience contract](../../_bmad-output/initiative-customer-ui-redesign/ux-fr-16/EXPERIENCE.md), and browser-viewable [sign-in](../../design/page/fr-16-sign-in.html) and [policy-list](../../design/page/fr-16-policy-list.html) mockups. [Validation record](../../_bmad-output/initiative-customer-ui-redesign/ux-fr-16/validation-report.md) covers preview states and width checks.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable browser and accessibility checks completed
- [ ] Requirements and UX references updated
- [ ] Code review and CI checks passed
- [ ] Ticket, Issue, PR, and handover linked
- [ ] No unresolved blockers
