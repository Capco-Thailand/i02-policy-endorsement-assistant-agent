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
  form: 'single column, maximum width 36rem'
---
# FR-02 visual design

## Brand & Style
Use the [Stripe Checkout interface](https://stripe.com/payments/checkout) as a reference for a clear summary-and-form relationship, crisp control states, and action hierarchy. Continue the FR-01 warm paper, dark ink, and restrained rust direction.

## Colors
Use `{colors.ink}` for content, `{colors.muted}` for guidance, `{colors.accent}` for the primary action, and `{colors.error}` plus text for validation.

## Typography
Use `{typography.heading}` for the page title and `{typography.body}` for policy facts, labels, controls, and status.

## Layout & Spacing
On wide screens, keep the selected policy summary beside the request form; the summary remains visible as the form grows. Within the form, sequence change type, its fields, effective date, and submit action using `{spacing.unit}` increments. Stack summary before form on narrow screens.

## Elevation & Depth
Use whitespace, thin dividers, and one bordered form surface to distinguish the task from the policy summary.

## Shapes
Use modest `{rounded.control}` corners with visible borders.

## Components
Keep the policy summary visible during entry. Show only fields for the selected change. Inputs have clear default, hover, focus, and error states. Place errors beside affected fields; show an error summary after submission. Expired policies show an unavailable state with no form.

## Do's and Don'ts
Say “Request recorded; checks are pending” after capture. Do not imply approval, a quote, a policy update, or coverage binding.

The [request preview](../../../design/page/request.html) illustrates active and expired states. This document and [EXPERIENCE.md](EXPERIENCE.md) govern when a mock differs.
