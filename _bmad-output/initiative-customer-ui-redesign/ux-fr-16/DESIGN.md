---
name: FR-16 sign-in and policy list
description: Proposed visual contract for the synthetic account entry and authorized policy list.
status: final
updated: 2026-11-25
sources:
  - docs/tickets/fr-16-redesign-sign-in-and-policy-list.md
colors:
  background: 'var(--background)'
  foreground: 'var(--foreground)'
  card: 'var(--card)'
  muted-foreground: 'var(--muted-foreground)'
  border: 'var(--border)'
  primary: 'var(--primary)'
  primary-foreground: 'var(--primary-foreground)'
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
  row: '18px'
components:
  sign-in-panel: '{colors.card} with {colors.border}'
  policy-row: '{colors.card} with {colors.border}'
  status-label: '{colors.foreground} text plus semantic color'
  primary-action: '{colors.primary} on {colors.primary-foreground}'
---

# FR-16 visual contract

## Brand & Style

Inherit the accepted FR-15 [visual contract](../ux-fr-15/DESIGN.md), shadcn preset `b51GFh7y6`, Base UI, Public Sans, and runtime semantic tokens. Use the same restrained policy-servicing character. The customer accepted the sign-in and list reference layouts on 2026-11-25.

## Colors

The aliases above resolve from `apps/web/src/app/styles.css`; this contract adds no palette. Status text carries meaning independently of color. Verify 4.5:1 ordinary-text and 3:1 control/focus contrast in light and dark themes.

## Typography

Use the hierarchy above. Policy IDs use tabular numerals and can wrap at 320px. The policy name leads each row; ID and status follow without inventing coverage or payment facts.

## Layout & Spacing

Sign-in presents its synthetic boundary and form in one reading path, with a compact explanation beside the form only when width allows. Policy list puts the page heading, authorized records, then each explicit “View policy” action in reading order. Rows use rules and spacing rather than a dashboard grid. At 320px, the form and each policy row stack with `{spacing.page-mobile}` outer padding and no horizontal scroll. See the browser mockups: [sign-in](../../../design/page/fr-16-sign-in.html) and [policy list](../../../design/page/fr-16-policy-list.html). Captures: [sign-in desktop](mockups/sign-in-1280.png), [sign-in 320px](mockups/sign-in-320.png), [list desktop](mockups/policy-list-1280.png), [list 320px](mockups/policy-list-320.png). `DESIGN.md` and `EXPERIENCE.md` govern if a mockup differs.

## Elevation & Depth

Flat surfaces and one border weight. No gradient, glass, decorative hero art, or layered shadow.

## Shapes

Controls use `{rounded.control}`; rows and panels keep restrained corners. Do not let a badge shape replace status text.

## Components

| Level | Part | Visual responsibility |
| --- | --- | --- |
| Atom | Label, input, button, status text | Inherit shadcn styles and visible focus. |
| Molecule | Sign-in field, policy identity, status label | Keep names and status readable without color. |
| Organism | Sign-in panel, policy row, list state | Present one task or one policy per group. |
| Template | Sign-in, authorized policy list | Preserve heading, boundary, content, action order. |

## Do's and Don'ts

| Do | Don't |
| --- | --- |
| Show exact authorized label, ID, and status. | Add unsourced coverage, term, premium, or insurer facts. |
| Put form errors beside fields and session status before the form. | Rely on a toast or color alone. |
| Keep “View policy” explicit for each record. | Make a decorative card imply an unclear action. |
| Label expired policies as historical when opening their detail. | Suggest an expired policy can be changed. |
