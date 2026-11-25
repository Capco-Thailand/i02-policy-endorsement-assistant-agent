---
name: Policy Endorsement Assistant shadcn theme
status: final
updated: 2026-11-25
colors:
  primary: 'shadcn --primary from preset b51GFh7y6'
  background: 'shadcn --background'
  foreground: 'shadcn --foreground'
  muted: 'shadcn --muted and --muted-foreground'
  border: 'shadcn --border'
  destructive: 'shadcn --destructive'
typography:
  family: 'Public Sans from preset b51GFh7y6'
rounded:
  control: 'shadcn radius scale from preset b51GFh7y6'
spacing:
  page: '24px wide, 18px narrow'
  section: '30px'
components:
  base: 'Base UI with shadcn Luma style'
  icons: 'Phosphor'
---

# Shadcn preset visual contract

## Brand & Style

Use preset `b51GFh7y6` as the running web app's visual source. Keep the interface restrained and specific to synthetic policy servicing. The preset supplies component appearance; existing customer tasks determine page composition. The [theme preview](../../../design/page/shadcn-theme-preview.html) shows representative states. Existing screen mockups remain layout and content references; this document governs their updated appearance.

## Colors

Use semantic shadcn color roles such as `{colors.primary}`, `{colors.background}`, `{colors.foreground}`, `{colors.muted}`, `{colors.border}`, and `{colors.destructive}`. The preset's rose theme supplies actual values. Use status colors sparingly with readable text labels. Do not retain legacy hex colors in the runtime stylesheet where they override the preset.

## Typography

Use `{typography.family}` throughout the running app. Preserve a clear page title, section heading, label, body, and supporting text hierarchy. Policy identifiers, percentages, dates, and currency remain legible; use tabular numerals where values align.

## Layout & Spacing

Keep the existing single reading column for detail, request, proposal, and history, and the existing compact policy list. Keep the sign-in context beside the form on wide screens and stacked on narrow screens. Use `{spacing.page}` and `{spacing.section}` as starting measures. Do not replace these flows with a generic dashboard.

## Elevation & Depth

Use flat surfaces, borders, and minimal shadows. Avoid gradients, glass, and layered elevation per [visual constraints](../../../docs/VISUAL_UX_CONSTRAINTS.md).

## Shapes

Use `{rounded.control}` and the preset's radius scale consistently. Avoid large rounding on every surface.

## Components

Use `{components.base}` primitives for buttons, inputs, labels, fields, alerts, separators, and confirmation controls. Use `{components.icons}` when an icon helps identify an action; text labels remain primary. Purpose-built policy cards, evidence lists, and value comparisons may use semantic tokens without forcing a generic component layout.

## Do's and Don'ts

| Do | Don't |
| --- | --- |
| Apply the same preset on every implemented route and state | Leave legacy Inter or fixed purple styling on a screen |
| Label active, expired, eligible, review, and rejected states in text | Rely on rose or another color alone |
| Keep the non-binding boundary prominent on proposal and history | Suggest approval issued coverage or updated a policy |
| Preserve readable focus and error treatments | Let a component replacement remove keyboard or screen-reader behavior |
