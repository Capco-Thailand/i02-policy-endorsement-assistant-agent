---
name: Policy Endorsement Assistant
status: final
updated: 2026-11-13
description: Restrained customer policy servicing interface, extending the existing preview style.
colors:
  ink: '#0a2540'
  muted: '#425466'
  paper: '#ffffff'
  canvas: '#f6f9fc'
  line: '#dce6ef'
  accent: '#635bff'
  accent-ink: '#5148d9'
  accent-soft: '#f0efff'
  error: '#a22d37'
  focus: '#5148d9'
typography:
  display:
    fontFamily: Inter, system-ui, Arial, sans-serif
    fontSize: 48px
    fontWeight: '750'
    lineHeight: '1.12'
    letterSpacing: '-0.04em'
  body:
    fontFamily: Inter, system-ui, Arial, sans-serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label:
    fontFamily: Inter, system-ui, Arial, sans-serif
    fontSize: 13px
    fontWeight: '700'
    lineHeight: '1.4'
rounded:
  sm: 6px
  md: 10px
spacing:
  field-gap: 20px
  panel-padding: 32px
  mobile-gutter: 18px
  desktop-gutter: 24px
components:
  primary-button:
    background: '{colors.accent}'
    foreground: '{colors.paper}'
    radius: '{rounded.sm}'
    minHeight: 46px
  input:
    background: '{colors.paper}'
    foreground: '{colors.ink}'
    radius: '{rounded.sm}'
    minHeight: 46px
---

# FR-01 visual design

## Brand & Style
The sign-in screen belongs to the same synthetic policy servicing product as the existing preview. It uses a quiet document-like page and one clear form. The implementation uses shadcn/ui controls, with the existing `design/global.css` palette and type hierarchy as the brand layer. The [sign-in mockup](../../../design/page/sign-in.html) illustrates form and error states; the [signed-in preview](../../../design/page/session.html) illustrates sign-out placement. These spines govern if either mock differs.

## Colors
Use {colors.canvas} behind a {colors.paper} form, {colors.ink} for primary text, and {colors.muted} for explanation. {colors.accent} marks the primary action and links. {colors.error} marks a form-level rejection; text always explains the error. Keep the existing preview colors. Avoid gradients or decorative accent blocks. Normal text must meet WCAG AA 4.5:1, large text 3:1, and input borders and focus indicators 3:1 against adjacent surfaces.

## Typography
Use {typography.display} for the page title on wide screens; scale it down to 36px on narrow screens. Body text uses {typography.body}; labels use {typography.label}. Preserve a clear reading order from product name to purpose to form.

## Layout & Spacing
At wide widths, put short product context beside a form no wider than 440px. Stack the context above the form below 900px. Use {spacing.desktop-gutter} on desktop and {spacing.mobile-gutter} on phones. Keep the form fields in one column with {spacing.field-gap}; never hide a field behind a disclosure.

## Elevation & Depth
Use a thin {colors.line} border to separate the form. The existing light panel shadow may remain, but hierarchy comes from typography and spacing.

## Shapes
Use {rounded.sm} for controls and {rounded.md} for the form panel. No pill buttons or oversized rounded surfaces.

## Components
- **Form panel:** white surface, thin border, concise heading, two labeled inputs, one full-width primary action.
- **Email field and Password field:** labels above controls; a visible 3:1 boundary at rest and focus outline when active. The password uses masked characters.
- **Sign-in button:** {components.primary-button.background}, {components.primary-button.foreground}, at least {components.primary-button.minHeight}. Disabled while submitting with visible progress wording.
- **Status message:** place above the fields, with plain text for invalid credentials, expired session, or temporary service failure. Error color supplements the wording.
- **Demo boundary note:** text-led notice, separated from context by a thin {colors.line} rule. Above the form on narrow screens.
- **Sign-out control:** outlined, at least 44px high, aligned at the far end of the authenticated header. It remains visible on narrow screens.

## Do's and Don'ts
- Show that this is a synthetic demo before a customer enters credentials.
- Keep credentials out of the mockup and out of user-facing error messages; local setup documentation provides them.
- Use one primary action, “Sign in”; avoid marketing claims, gradients, and celebratory feedback.
