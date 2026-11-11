---
name: Policy Endorsement Assistant
description: Visual contract for FR-02 request capture.
status: draft
updated: 2026-11-11
colors:
  canvas: '#f6f9fc'
  paper: '#ffffff'
  ink: '#0a2540'
  muted: '#425466'
  line: '#dce6ef'
  accent: '#635bff'
  focus: '#5148d9'
  error: '#a22d37'
typography:
  display:
    fontFamily: 'Inter, system-ui, Arial, sans-serif'
  interface:
    fontFamily: 'Inter, system-ui, Arial, sans-serif'
rounded:
  sm: '6px'
  md: '10px'
spacing:
  gutter: '24px'
  section: '32px'
components:
  primary-action:
    background: '{colors.accent}'
    foreground: '{colors.paper}'
    radius: '{rounded.sm}'
---

## Brand & Style

Extend the established staff interface in [FR-01 DESIGN.md](../initiative-pea-001-policy-list-and-detail/ux-fr-01-authenticate-staff/DESIGN.md). The request screen is a work form for synthetic policies. Keep policy identity and non-binding status visible.

## Colors

Use `{colors.canvas}` behind `{colors.paper}` sections. Use `{colors.ink}` for headings, `{colors.muted}` for help, `{colors.error}` with explicit error text, and `{colors.focus}` for keyboard focus. Color alone never conveys status.

## Typography

Use `{typography.display.fontFamily}` for the page title and `{typography.interface.fontFamily}` for fields and guidance. Keep labels above controls.

## Layout & Spacing

Show a compact policy summary before a one-column request form. Keep change type and effective date above conditional inputs. On narrow screens, all sections stack without horizontal scrolling.

## Elevation & Depth

Use borders and whitespace. Avoid heavy shadows, gradients, and decoration.

## Shapes

Use `{rounded.sm}` on fields and buttons, `{rounded.md}` on the main form surface.

## Components

| Component | Visual contract |
|---|---|
| Policy summary | Clear policy identifier and status, separate from editable fields. |
| Change selector | Four plainly named options with one selected state. |
| Conditional fields | Same label, help, and error treatment for every change type. |
| Primary action | One clear “Record request” action; busy text stays readable. |
| Result notice | Text-led confirmation or error near the action. |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Say “Synthetic policy” and “Pending checks” | Suggest approval, issuance, or bound coverage |
| Keep policy and request fields visually distinct | Let a change type switch silently erase entered values |
