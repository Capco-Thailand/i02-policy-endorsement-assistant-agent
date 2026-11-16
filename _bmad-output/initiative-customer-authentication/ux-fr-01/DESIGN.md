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
  focus: '#5148d9'
typography:
  family: 'Inter, system-ui, Arial, sans-serif'
rounded:
  control: 6px
  panel: 10px
spacing:
  field: 20px
  panel: 32px
components:
  form_width: 440px
---
# FR-01 visual contract

## Brand & Style
Use the existing policy page language in `design/global.css`: clear labels, restrained surfaces, and a single primary action. This is a synthetic insurance prototype, so explain that boundary plainly. The eventual React UI uses shadcn/ui with these project tokens.

## Colors
{colors.canvas} surrounds the {colors.paper} form. {colors.ink} labels controls, {colors.muted} supports them, and {colors.accent} marks Sign in. Use {colors.error} with text for failures and {colors.focus} for keyboard focus; never rely on color alone.

## Typography
Use {typography.family}. Keep labels above fields and visible while typing. The page title leads, followed by a brief sentence; no promotional copy.

## Layout & Spacing
The wide view places brief product context beside a form up to {components.form_width}. Below 900px, stack context then form. Remain usable at 320px. Keep fields apart by {spacing.field} and the panel inset near {spacing.panel}.

## Elevation & Depth
Use a border and the existing slight panel shadow. Keep the page flat and readable.

## Shapes
Controls use {rounded.control}; the panel uses {rounded.panel}.

## Components
- Sign-in panel: heading, account ID, masked password, full-width submit action, and synthetic-demo note.
- Error notice: text plus a solid border, immediately before fields.
- Session notice: same compact treatment with neutral language.

## Do's and Don'ts
Show no policy details or demo credentials on the public surface. Keep account-existence details out of error copy. Avoid gradients, illustration, decorative cards, and success celebration.
