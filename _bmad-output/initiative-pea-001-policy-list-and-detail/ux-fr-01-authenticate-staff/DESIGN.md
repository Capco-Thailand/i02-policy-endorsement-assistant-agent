---
name: Policy Endorsement Assistant
description: Visual contract for FR-01 staff sign-in and session feedback.
status: final
sources:
  - https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/13
updated: 2026-11-11
colors:
  canvas: '#f6f9fc'
  paper: '#ffffff'
  ink: '#0a2540'
  muted: '#425466'
  line: '#dce6ef'
  accent: '#635bff'
  accent-ink: '#5148d9'
  accent-soft: '#f0efff'
  focus: '#5148d9'
  error: '#a22d37'
typography:
  display:
    fontFamily: 'Inter, system-ui, Arial, sans-serif'
    fontWeight: 700
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

Extend the app-wide Stripe-inspired identity in [PEA-001 DESIGN.md](../ux-pea-001-policy-list-and-detail/DESIGN.md): deep ink, cool canvas, white surfaces, violet primary action, generous spacing, and a bold sans-serif heading. Sign-in is a secure work entry point for synthetic policy servicing. Keep it focused on the form, with no marketing imagery or ornamental dashboard furniture. shadcn/ui supplies accessible form primitives; this document supplies the local visual treatment.

## Colors

Use `{colors.canvas}` for the page and `{colors.paper}` for the form. `{colors.accent}` fills the primary action; `{colors.accent-ink}` colors text links. `{colors.error}` is reserved for authentication and field error text, paired with explicit words. `{colors.focus}` is the visible keyboard focus outline. Meet WCAG 2.2 AA contrast for every text and control state.

## Typography

The page heading uses the bold `{typography.display.fontFamily}` role. Labels, instructions, errors, buttons, and session notice use `{typography.interface.fontFamily}`. Keep field labels outside inputs so they stay visible while typing.

## Layout & Spacing

On desktop, a two-column layout places the app identity, sign-in heading, and synthetic-environment boundary beside a compact form panel. On phones, these regions stack in the same reading order and the form fills the available width within page gutters. The form itself remains one column. The error appears beside the form action in reading order. The [sign-in mockup](../../../design/page/sign-in.html) demonstrates the layout; this document wins if it differs.

## Elevation & Depth

The white form panel and quiet border carry hierarchy. Do not add layered card shadows, glow, or blur.

## Shapes

Use `{rounded.sm}` for inputs and buttons and `{rounded.md}` for the form panel. Avoid oversized rounded panels.

## Components

| Component | Visual contract |
|---|---|
| Credential fields | Persistent label, plain border, visible focus outline, and enough width for account identifiers. |
| Form heading | Small account-access label and concise heading above the fields; it must not replace the page's Staff sign in heading. |
| Primary action | One white-on-violet Sign in button. Disabled or busy states retain readable text. |
| Authentication error | Text-first message directly above the action, with a contrasting border or icon; no secrets or account-specific hints. |
| Session notice | Compact bordered message above the form, using the same form width and explicit words. |
| Signed-in account control | Staff display name and Sign out action in the application header; no policy data in the control. |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Say “Synthetic demo” near the form | Imply production account access or real policy servicing |
| Keep labels and errors visible while typing | Use placeholders as labels |
| Show session expiry as a page-level state | Reveal whether an account identifier exists |
| Preserve the shared app identity | Copy Stripe's logo or introduce a separate sign-in palette |
