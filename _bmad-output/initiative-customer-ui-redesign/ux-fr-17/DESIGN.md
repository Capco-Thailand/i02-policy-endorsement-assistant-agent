---
name: FR-17 request and eligibility redesign
description: Proposed visual contract for four synthetic change requests and cited eligibility outcomes.
status: final
updated: 2026-11-25
sources:
  - docs/tickets/fr-17-redesign-request-and-eligibility.md
colors:
  background: 'var(--background)'
  foreground: 'var(--foreground)'
  card: 'var(--card)'
  muted: 'var(--muted)'
  muted-foreground: 'var(--muted-foreground)'
  border: 'var(--border)'
  primary: 'var(--primary)'
  primary-foreground: 'var(--primary-foreground)'
  warning-foreground: 'var(--warning-foreground)'
  destructive: 'var(--destructive)'
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
  section: '28px'
components:
  change-context: '{colors.muted} with {colors.foreground} text'
  value-pair: '{colors.card} with {colors.border} rule'
  allocation-total: '{colors.foreground} text with numeric total'
  recorded-request: '{colors.card} with {colors.border} rule'
  eligibility-result: '{colors.card} with {colors.border} rule'
  source-link: '{colors.primary} with visible focus'
---

# FR-17 visual contract

## Brand & Style

Inherit the accepted [FR-15](../ux-fr-15/DESIGN.md) and [FR-16](../ux-fr-16/DESIGN.md) semantic theme, shadcn preset `b51GFh7y6`, Base UI controls, and Public Sans. The customer accepted these FR-17 reference layouts on 2026-11-25. Keep the request distinct from the later eligibility assessment and both distinct from a coverage change.

## Colors

Use the runtime semantic aliases in frontmatter without a new palette. Text names each outcome; color supports it. The synthetic boundary and unresolved source notice use a flat muted surface with a primary or warning edge, never an implied approval green. Ordinary text targets 4.5:1 contrast; controls and focus target 3:1 in light and dark themes.

## Typography

The page title states the task. Section headings name “Current policy”, “Requested change”, “Request recorded”, and “Eligibility”. Names, percentages, amounts, and source identifiers retain exact values and units. Allocation percentages and the total use tabular numerals; at 320px the title may reduce to 28px.

## Layout & Spacing

The [request mockup](../../../design/page/fr-17-request.html) starts with policy identity and a synthetic boundary, then the change choice, a current-value panel, the requested inputs, total/validation, and “Record request”. The [eligibility mockup](../../../design/page/fr-17-eligibility.html) starts with the recorded request and ID, then a separate check action and outcome with reason, next action, and available citations. At desktop the content remains one reading column with a bounded width; current and requested values may align as two columns inside a field comparison. At 320px they stack in DOM order with `{spacing.page-mobile}` outer padding and no horizontal scroll. The spines govern if a mockup differs. Captures: [request desktop](mockups/request-1280.png), [request 320px](mockups/request-320.png), [eligibility desktop](mockups/eligibility-1280.png), [eligibility 320px](mockups/eligibility-320.png).

## Elevation & Depth

Flat surfaces, one border weight, restrained rules, and no layered shadows. No dashboard grid, gradients, glass, or decorative imagery.

## Shapes

Inputs and buttons use `{rounded.control}`. Status labels may use a small radius but retain the outcome text. A percent bar is optional context; it cannot replace row percentages or the exact total.

## Components

| Level | Part | Visual responsibility |
| --- | --- | --- |
| Atom | Field label, value, percent, button, source link | Inherit shadcn tokens, show clear focus and units. |
| Molecule | Current/requested pair, beneficiary allocation row, outcome label | Make differences readable without color. |
| Organism | Request form, recorded-request panel, eligibility result | Keep recording, checking, and proposal preparation separate. |
| Template | Request and eligibility screens | Preserve task, boundary, input, result, and next-action order. |

## Do's and Don'ts

- Do label the current address “Not available in this policy record.”
- Do show a confirmed accidental-death benefit with its source when available; do not turn that benefit into an invented rider-on/off flag.
- Do show each beneficiary name and percentage plus the numeric allocation total and under/over/100% text.
- Do present `CAN_PROCEED`, `CANNOT_PROCEED`, and `NEEDS_REVIEW` as distinct text outcomes with server-provided reasons and next steps.
- Don't imply request recording, eligibility, or proposal preparation updates coverage or binds a policy.
