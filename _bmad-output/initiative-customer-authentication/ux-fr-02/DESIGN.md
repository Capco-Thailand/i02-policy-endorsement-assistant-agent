---
status: final
updated: 2026-11-16
colors:
  canvas: '#f6f9fc'
  paper: '#ffffff'
  ink: '#0a2540'
  muted: '#425466'
  accent: '#635bff'
  error: '#a22d37'
  warning: '#79510d'
  focus: '#5148d9'
typography:
  family: 'Inter, system-ui, Arial, sans-serif'
rounded:
  control: 6px
  panel: 10px
spacing:
  section: 30px
  field: 18px
components:
  form_width: 720px
---
# FR-02 visual contract

## Brand & Style
Extend the restrained policy page language in `design/global.css`. Make the selected synthetic policy and request status easy to read. Use shadcn/ui controls in the eventual React implementation with these project tokens.

## Colors
{colors.ink} carries labels, {colors.muted} supporting facts, and {colors.accent} the submit action. {colors.error} marks field errors with words, while {colors.warning} identifies an expired policy. Maintain visible focus with {colors.focus}.

## Typography
Use {typography.family}. Keep a strong page title, a concise policy summary, and visible labels. Display dates and allocation percentages legibly.

## Layout & Spacing
Keep the form within {components.form_width}. The policy context remains above the form on narrow screens. Separate sections by {spacing.section}, fields by {spacing.field}; controls remain large enough for touch at 320px.

## Elevation & Depth
Use white surfaces, light borders, and little to no shadow. An expired state relies on text and a colored rule, not decorative effects.

## Shapes
Controls use {rounded.control}; the summary and form panels use {rounded.panel}.

## Components
- Policy summary: policy ID and status remain visible during entry.
- Change-type selector: four named options; the selected option reveals only its own fields.
- Beneficiary rows: name and percentage; clear add and remove controls; total allocation shown in text.
- Field errors: adjacent to inputs and linked through `aria-describedby`.
- Confirmation: request ID and “pending checks” statement, without approval language.
- Expired notice: explicit explanation and no request form or submit action.

## Do's and Don'ts
Show synthetic-data and non-binding boundaries in plain language. Never present request capture as eligibility, quote, draft, approval, or a policy update. Avoid generic dashboard cards, gradients, and celebratory motion.
