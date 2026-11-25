---
name: FR-18 decision history redesign
description: Accepted visual contract for owner-scoped approved decision history.
status: final
updated: 2026-11-25
sources:
  - docs/tickets/fr-18-redesign-decision-history.md
colors:
  background: 'var(--background)'
  foreground: 'var(--foreground)'
  card: 'var(--card)'
  muted: 'var(--muted)'
  muted-foreground: 'var(--muted-foreground)'
  border: 'var(--border)'
  primary: 'var(--primary)'
  primary-foreground: 'var(--primary-foreground)'
typography:
  family: 'Public Sans'
  page-title: '34px / 700 / 1.15'
  section-title: '20px / 700 / 1.3'
  body: '15px / 1.5'
  label: '12px / 650'
rounded:
  control: 'var(--radius)'
spacing:
  page-desktop: '28px'
  page-mobile: '16px'
  section: '24px'
components:
  boundary: '{colors.muted} with {colors.primary} edge'
  history-row: '{colors.card} with {colors.border} rule'
  status-label: '{colors.foreground} text with restrained semantic tint'
  proposal-link: '{colors.primary} with visible focus'
---

# FR-18 visual contract

## Brand & Style

Inherit the accepted FR-15 to FR-17 semantic theme, shadcn preset `b51GFh7y6`, Base UI controls, and Public Sans. The customer accepted this FR-18 reference layout on 2026-11-25 by asking to continue after review. Decision history is a record of actions on synthetic proposals, never issued coverage.

## Colors

Use the runtime semantic aliases in frontmatter. The `APPROVED` label may have a restrained positive tint, but the decision word carries the meaning. The non-binding notice uses a muted surface and primary edge, distinct from the status label. Text targets 4.5:1 contrast and focus indicators 3:1 in light and dark themes.

## Typography

The page title is “Customer change history”. Each entry leads with the change type and a concise requested-value summary, followed by policy identity, request ID, decision date, and a proposal link. Preserve the exact server-returned ID and time; dates use a consistent locale and timezone. IDs wrap at 320px.

## Layout & Spacing

The [history mockup](../../../design/page/fr-18-history.html) uses one bounded reading column. Heading and non-binding notice precede the list. Repeated entries are separated by flat borders; no dashboard grid or visual card stack is needed. At desktop, decision date and status may sit beside the change summary. At 320px, all metadata and the link stack in DOM order with `{spacing.page-mobile}` outer padding and no horizontal scroll. The spines govern if the mockup differs.

Reference captures: [desktop](../../../design/page/fr-18-history-1280.png) and [320px](../../../design/page/fr-18-history-320.png).

## Elevation & Depth

Use flat surfaces, thin rules, and no layered shadows or decorative background.

## Shapes

Buttons and status labels use `{rounded.control}`. The proposal link remains a text link with an obvious focus treatment.

## Components

| Level | Part | Visual responsibility |
| --- | --- | --- |
| Atom | Date, status, ID, link | Show exact text and readable focus. |
| Molecule | History row | Keep change, policy, request, decision, and link together. |
| Organism | History list or state panel | Preserve one reading order across states. |
| Template | History page | Place non-binding meaning before records and next actions. |

## Do's and Don'ts

- Do show approved records only; rejected decisions remain on their proposal detail under FR-12.
- Do use a short change summary. Never expose full addresses or beneficiary names and allocations in the overview.
- Do link to the exact owner-authorized recorded proposal.
- Don't say approval changed the underlying policy or coverage.
