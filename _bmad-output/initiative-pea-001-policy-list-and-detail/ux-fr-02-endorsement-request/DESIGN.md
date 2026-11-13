---
status: final
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
  form: 'single-column, max-width 36rem'
---
# FR-02 visual design

## Brand & Style
Use the FR-01 customer sign-in visual language for the request form: calm, direct policy-service content on paper surfaces. Identify every policy and request as synthetic.

## Colors
Use `{colors.ink}` for primary text, `{colors.muted}` for guidance, `{colors.accent}` for the main action, and `{colors.error}` for validation. Expired-policy messaging is text-led, not color alone.

## Typography
Use `{typography.heading}` for the page title and `{typography.body}` for policy facts, labels, inputs, and status text.

## Layout & Spacing
Put selected policy facts above the form in one readable column. Keep the change type, its fields, effective date, and submit action in a clear sequence. Use `{spacing.unit}` increments and a narrower form width than the policy detail page.

## Shapes
Inputs and buttons have modest `{rounded.control}` corners and visible borders. Avoid decorative cards around every field.

## Components
The policy summary stays visible while the customer edits. Change-type controls reveal only the relevant fields. Validation appears beside each affected field. An expired policy shows an unavailable state without a request form.

## Do's and Don'ts
Say “Request recorded; checks are pending” after submission. Do not imply approval, a quote, policy change, or coverage binding. Avoid gradients, glass effects, and decorative imagery.
