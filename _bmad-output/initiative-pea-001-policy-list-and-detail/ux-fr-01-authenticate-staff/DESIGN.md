---
name: Policy Endorsement Assistant
description: Visual contract for synthetic staff sign-in.
status: final
sources:
  - docs/tickets/fr-01-authenticate-staff.md
updated: 2026-11-12
colors:
  canvas: '#f6f9fc'
  paper: '#ffffff'
  ink: '#0a2540'
  muted: '#425466'
  line: '#dce6ef'
  accent: '#635bff'
  accent-ink: '#5148d9'
  error: '#a22d37'
  focus: '#5148d9'
typography:
  display:
    fontFamily: 'Inter, system-ui, Arial, sans-serif'
    fontWeight: 750
    lineHeight: 1.12
    letterSpacing: '-0.04em'
  interface:
    fontFamily: 'Inter, system-ui, Arial, sans-serif'
    lineHeight: 1.5
rounded:
  sm: '6px'
  md: '10px'
spacing:
  gutter: '24px'
  section: '32px'
components:
  sign-in-panel:
    background: '{colors.paper}'
    border: '{colors.line}'
    radius: '{rounded.md}'
  primary-action:
    background: '{colors.accent}'
    foreground: '{colors.paper}'
    radius: '{rounded.sm}'
---

## Brand & Style

The sign-in screen is a focused work entry for staff using synthetic policies. Inherit the shared palette and type from `design/global.css`. Keep a plain form, a clear synthetic-data notice, and no production insurer branding.

## Colors

Use `{colors.canvas}` behind the form and `{colors.paper}` for the form surface. `{colors.accent}` identifies the one primary action. Pair `{colors.error}` with explicit error words. All text and controls meet WCAG 2.2 AA contrast.

## Typography

Use `{typography.display.fontFamily}` for the page heading and `{typography.interface.fontFamily}` for controls. Keep labels outside inputs and visible while typing.

## Layout & Spacing

On wide screens, the sign-in heading and synthetic boundary sit beside the compact form. At 700px and below, they stack in reading order. The form remains one column and fits a 320px viewport without horizontal scrolling. The [mockup](../../../design/page/sign-in.html) shows the composition; this document wins if they differ.

## Elevation & Depth

Use a quiet border for the form surface. Avoid glow, gradients, blur, and layered shadows.

## Shapes

Inputs and actions use `{rounded.sm}`. The form surface uses `{rounded.md}`.

## Components

| Component | Visual contract |
|---|---|
| Credential field | Persistent label, full width, 46px minimum height, visible focus outline. |
| Primary action | Full-width white-on-violet button with readable busy state. |
| Error or session notice | Text-first message above the form action; color is a secondary cue. |
| Signed-in account control | Staff display name and Sign out action in the protected header. |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Say “Synthetic demo accounts only” | Suggest access to live insurer systems |
| Keep one clear Sign in action | Add dashboard or marketing furniture |
| Show focus and error text visibly | Reveal which credential failed |
