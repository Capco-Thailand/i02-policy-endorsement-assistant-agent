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
  heading: 'Inter, ui-sans-serif, system-ui, sans-serif'
rounded:
  control: 4px
spacing:
  unit: 8px
components:
  form: 'single column, maximum width 28rem'
---
# FR-01 visual design

## Brand & Style
Use the [Stripe Checkout interface](https://stripe.com/payments/checkout) as a reference for precise form hierarchy, spacing, and states. Keep the established warm paper, dark ink, and rust palette for synthetic policy service. Identify the demo context before credentials are entered.

## Colors
Use `{colors.ink}` for content, `{colors.muted}` for guidance, `{colors.accent}` for the primary action, and `{colors.error}` for errors. Errors also have text.

## Typography
Use `{typography.heading}` for page headings and `{typography.body}` for copy and controls.

## Layout & Spacing
On wide screens, pair a short policy-service introduction with one focused sign-in panel. Use `{spacing.unit}` increments and generous spacing between heading, fields, and action. Stack the introduction before the form on narrow screens.

## Elevation & Depth
Use borders and background contrast, without layered shadows.

## Shapes
Use `{rounded.control}` on inputs and buttons, with slightly larger corners on the one sign-in panel.

## Components
The sign-in form has visible labels, clear default, hover, focus, disabled, and error states, and one full-width primary action. A plain note marks the synthetic prototype. The signed-in preview uses simple policy rows and a sign-out action.

## Do's and Don'ts
Use direct policy-service language. Avoid gradients, glass, decorative imagery, and claims that a decision binds coverage.

The [sign-in preview](../../../design/page/sign-in.html) illustrates layout. This document and [EXPERIENCE.md](EXPERIENCE.md) govern when a mock differs.
