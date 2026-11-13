---
status: final
updated: 2026-11-13
colors:
  ink: '#172b3a'
  muted: '#52616b'
  paper: '#ffffff'
  canvas: '#f5f3ee'
  accent: '#9b4d28'
  error: '#a12a2a'
typography:
  body: 'system-ui, sans-serif'
  heading: 'Georgia, serif'
rounded:
  control: 4px
spacing:
  unit: 8px
components:
  form: 'single column, maximum width 28rem'
---
# FR-01 visual design

## Brand & Style
Calm synthetic policy service. Identify the demo context before credentials are entered. Reuse the prior warm paper, dark ink, and rust direction.

## Colors
Use `{colors.ink}` for content, `{colors.muted}` for guidance, `{colors.accent}` for the primary action, and `{colors.error}` for errors. Errors also have text.

## Typography
Use `{typography.heading}` for page headings and `{typography.body}` for copy and controls.

## Layout & Spacing
Keep the form in one narrow column with ample whitespace. Use `{spacing.unit}` increments; preserve reading order on narrow screens.

## Elevation & Depth
Use borders and background contrast, without layered shadows.

## Shapes
Use `{rounded.control}` on inputs and buttons.

## Components
The sign-in form has visible labels, an inline alert, and one primary action. A plain note marks the synthetic prototype. The signed-in preview uses simple policy rows and a sign-out action.

## Do's and Don'ts
Use direct policy-service language. Avoid gradients, glass, decorative imagery, and claims that a decision binds coverage.

The [sign-in preview](../../../design/page/sign-in.html) illustrates layout. This document and [EXPERIENCE.md](EXPERIENCE.md) govern when a mock differs.
