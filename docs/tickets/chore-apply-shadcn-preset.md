# Chore — Apply the shadcn preset across the web app

**Title:** [Chore] Apply the shadcn preset across the customer web app
**Labels:** `type:story`, `role:dev`, `role:ux`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/147
**Product context:** [PRD](../PRD.md)
**Risk:** Medium — inconsistent styling or component replacement could obscure policy status, form errors, or the non-binding proposal boundary.
**Requirements owner:** This file.

## Summary and objective

Apply shadcn preset `b51GFh7y6` to the existing Next.js customer app so every implemented screen uses its component styling, theme tokens, Public Sans font, and Phosphor icons. The running app imports `apps/web/src/app/styles.css`; `design/global.css` styles separate HTML mockups and is not the runtime stylesheet.

## Requirement

Customers see one coherent shadcn-styled interface across sign-in, policy list, policy detail, endorsement request and eligibility, proposal review and decision, and change history. Existing workflow behavior and the synthetic, non-binding policy boundary remain intact.

## Business and technical context

- The web workspace already has `components.json`, shadcn/Base UI components, and Tailwind CSS v4. Run the preset command from `apps/web`, keeping the npm workspace and root lockfile.
- The preset resolves to Luma style, mist base color, rose theme, Public Sans, and Phosphor icons. The existing runtime CSS contains fixed legacy colors, Inter typography, and control styles that would override the preset unless reconciled.
- [Visual constraints](../VISUAL_UX_CONSTRAINTS.md) still govern layout and decoration. Existing screen mockups and UX handoffs remain behavior and content references; the [new visual contract](../../_bmad-output/initiative-pea-001-policy-list-and-detail/ux-chore-shadcn-preset/DESIGN.md) governs this theme change.

## Acceptance criteria

- [ ] `apps/web/components.json` identifies the requested preset's Luma style, mist base, and Phosphor icons; the web workspace loads its Public Sans font and keeps Base UI as the component base.
- [ ] All implemented customer screens use the preset's semantic color, typography, radius, and component styles. Runtime CSS no longer uses legacy fixed colors or Inter rules that override those choices; `design/global.css` is not imported into the app.
- [ ] Buttons, inputs, labels, alerts, form fields, status treatments, and confirmation controls use shadcn components or consistent semantic tokens where a purpose-built layout is needed. The preset is visible on every implemented route, including loading, empty, error, and success states.
- [ ] Desktop and narrow viewport checks show readable content without horizontal overflow. Keyboard focus, visible labels, error announcements, and status text remain usable; color is not the only way to identify a result.
- [ ] Policy facts, eligibility evidence, current/proposed values, customer decision, and history remain accurate. Approval still records a non-binding decision and does not imply coverage issuance or a policy update.
- [ ] Web tests, typecheck, formatting check, build, and browser E2E pass; desktop and narrow screenshots are reviewed against the UX handoff.

## Scope and out of scope

In scope:
- The existing `apps/web` routes, shared UI components, theme CSS, font and icon dependencies, and root lockfile.
- UX handoff and affected design documentation or mockups needed to describe the new visual system.

Out of scope:
- New product flows, API or database changes, policy binding, and new customer data.
- Styling the Fastify API or the AI and calculator workspaces.

## Dependencies

Existing customer screens and their UX handoffs. No new service dependency.

## Related subtasks

None.

## Accepted decisions and readiness

- 2026-11-25: Use the supplied shadcn preset throughout the running web app. Its theme replaces legacy runtime styling; preserve the existing customer journeys and non-binding language.
- Implementation waits for the ticket/UX PR merge and linked GitHub Issue, per [ticket workflow](../TICKETING.md).

## UX handoff references

- [Visual contract](../../_bmad-output/initiative-pea-001-policy-list-and-detail/ux-chore-shadcn-preset/DESIGN.md)
- [Experience contract](../../_bmad-output/initiative-pea-001-policy-list-and-detail/ux-chore-shadcn-preset/EXPERIENCE.md)
- [Theme preview](../../design/page/shadcn-theme-preview.html)
- Existing [screen mockups](../../design/page/index.html) remain layout and content references where this handoff does not replace them.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
