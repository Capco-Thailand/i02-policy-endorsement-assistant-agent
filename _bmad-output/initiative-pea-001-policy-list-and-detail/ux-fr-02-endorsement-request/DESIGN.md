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
  form: 'single column, maximum width 36rem'
---
# FR-02 visual design

## Brand & Style
Continue the FR-01 synthetic policy-service direction: warm paper surfaces, dark ink, restrained rust accent.

## Colors
Use `{colors.ink}` for content, `{colors.muted}` for guidance, `{colors.accent}` for the primary action, and `{colors.error}` plus text for validation.

## Typography
Use `{typography.heading}` for the page title and `{typography.body}` for policy facts, labels, controls, and status.

## Layout & Spacing
Put selected policy facts above the form. Sequence change type, its fields, effective date, and submit action in one column using `{spacing.unit}` increments.

## Elevation & Depth
Use borders and whitespace rather than shadows or decorative cards.

## Shapes
Use modest `{rounded.control}` corners with visible borders.

## Components
Keep the policy summary visible during entry. Show only fields for the selected change. Place errors beside affected fields; show an error summary after submission. Expired policies show an unavailable state with no form.

## Do's and Don'ts
Say “Request recorded; checks are pending” after capture. Do not imply approval, a quote, a policy update, or coverage binding.

The [request preview](../../../design/page/request.html) illustrates active and expired states. This document and [EXPERIENCE.md](EXPERIENCE.md) govern when a mock differs.
