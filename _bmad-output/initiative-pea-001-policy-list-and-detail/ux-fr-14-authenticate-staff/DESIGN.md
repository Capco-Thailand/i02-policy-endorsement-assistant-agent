---
name: Policy Endorsement Assistant
description: Visual contract for FR-14 staff sign-in and session feedback.
status: final
sources:
  - https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/13
updated: 2026-11-10
colors:
  canvas: '#f5f4ef'
  paper: '#fffefa'
  ink: '#242b2a'
  muted: '#66716e'
  line: '#d9ddd6'
  accent: '#176b60'
  focus: '#bd7b25'
  error: '#9b3e2f'
typography:
  display:
    fontFamily: 'Georgia, Times New Roman, serif'
  interface:
    fontFamily: 'Arial, sans-serif'
rounded: {}
spacing: {}
components:
  sign-in-panel:
    background: '{colors.paper}'
    border: '{colors.line}'
  primary-action:
    background: '{colors.accent}'
    foreground: '#ffffff'
---

## Brand & Style

Extend the established policy-record language from [PEA-001 DESIGN.md](../ux-pea-001-policy-list-and-detail/DESIGN.md): warm paper, fine rules, evergreen action cues, serif headings, and compact sans-serif controls. Sign-in is a work entry point for synthetic policy servicing. It should feel like a secure form, with no marketing imagery or ornamental dashboard furniture. shadcn/ui supplies accessible form primitives; this document supplies the local visual treatment.

## Colors

Use `{colors.canvas}` for the page and `{colors.paper}` for the form. `{colors.accent}` identifies the primary action and links. `{colors.error}` is reserved for authentication and field error text, paired with an icon or explicit words. `{colors.focus}` is the visible keyboard focus outline. Meet WCAG 2.2 AA contrast for every text and control state.

## Typography

The page heading uses `{typography.display.fontFamily}`. Labels, instructions, errors, buttons, and session notice use `{typography.interface.fontFamily}`. Keep field labels outside inputs so they stay visible while typing.

## Layout & Spacing

A single column presents the app name, sign-in heading, short context sentence, credentials form, and synthetic-demo notice. Keep the form comfortably narrow on desktop and full width with page gutters on phones. The error appears beside the form action in reading order. The [sign-in mockup](../../../design/page/sign-in.html) demonstrates the layout; this document wins if it differs.

## Elevation & Depth

Flat surfaces and borders carry hierarchy. Do not add card shadows, glow, or blur.

## Shapes

Use restrained square or small-radius controls in line with the existing policy pages. Avoid oversized rounded panels.

## Components

| Component | Visual contract |
|---|---|
| Credential fields | Persistent label, plain border, visible focus outline, and enough width for account identifiers. |
| Primary action | One evergreen Sign in button. Disabled or busy states retain readable text. |
| Authentication error | Text-first message directly above the action, with a contrasting border or icon; no secrets or account-specific hints. |
| Session notice | Compact bordered message above the form, using the same form width and explicit words. |
| Signed-in account control | Staff display name and Sign out action in the application header; no policy data in the control. |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Say “Synthetic demo” near the form | Imply production account access or real policy servicing |
| Keep labels and errors visible while typing | Use placeholders as labels |
| Show session expiry as a page-level state | Reveal whether an account identifier exists |
| Preserve policy-page visual continuity | Introduce a new palette for sign-in |
