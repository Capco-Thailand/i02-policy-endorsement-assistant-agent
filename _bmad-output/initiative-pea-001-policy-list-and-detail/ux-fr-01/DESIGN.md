---
name: Policy Endorsement Assistant
description: Customer sign-in visual contract for the synthetic policy prototype.
status: final
updated: 2026-11-13
sources:
  - ../../../docs/tickets/fr-01-authenticate-customers.md
colors:
  ink: '#0a2540'
  muted: '#425466'
  line: '#dce6ef'
  paper: '#ffffff'
  canvas: '#f6f9fc'
  accent: '#635bff'
  accent-ink: '#5148d9'
  accent-soft: '#f0efff'
  error: '#a22d37'
  focus: '#5148d9'
typography:
  body:
    fontFamily: Inter, system-ui, Arial, sans-serif
    fontSize: 15px
    lineHeight: '1.5'
  title:
    fontFamily: Inter, system-ui, Arial, sans-serif
    fontSize: 48px
    fontWeight: '750'
    lineHeight: '1.12'
rounded:
  sm: 6px
  md: 10px
spacing:
  field-gap: 20px
  panel-padding: 32px
  mobile-gutter: 18px
components:
  sign-in-panel:
    background: '{colors.paper}'
    border: '{colors.line}'
    radius: '{rounded.md}'
  primary-button:
    background: '{colors.accent}'
    text: '{colors.paper}'
    focus: '{colors.focus}'
---

# FR-01 visual design

## Brand & Style

Use the established policy page language from `design/global.css`: a calm, document-like surface with clear labels and one prominent action. The sign-in page belongs to a synthetic insurance prototype, so its copy says so plainly. The React implementation uses shadcn/ui; these tokens describe the project visual layer.

## Colors

The existing {colors.canvas} background and {colors.paper} panel separate the sign-in task from the page. {colors.ink} carries headings and field labels; {colors.muted} carries supporting text. {colors.accent} identifies the primary action. Errors use {colors.error} with text and a border, never color alone. The focus ring uses {colors.focus}.

## Typography

Keep Inter and the current strong title hierarchy. Labels are always visible above fields. Avoid decorative display type and placeholder-only labels.

## Layout & Spacing

[ASSUMPTION] Use the existing `.auth-shell` two-column composition on wide screens: short product context on the left and the form on the right. Collapse to one column below 900px, with the form following the context. The form remains usable at 320px. Keep the form panel no wider than 440px.

## Elevation & Depth

Use the subtle existing panel shadow. No gradients, blur, illustrations, or floating decoration.

## Shapes

Use {rounded.sm} on controls and {rounded.md} on the form panel, matching existing policy pages.

## Components

- **Sign-in panel:** White panel, visible border, clear heading, stacked labeled fields, one full-width primary button.
- **Field:** Minimum 46px high with visible border and a focus ring. Error text sits above the fields and is linked to them accessibly.
- **Status notice:** A compact message with text and border for invalid credentials or expired session. Never show whether an account exists.
- **Prototype note:** Small but readable text stating that accounts and policy data are synthetic and no coverage changes occur.

## Do's and Don'ts

Use direct task copy: “Sign in to view your policies.” Keep the public sign-in surface free of policy details. Do not use a dashboard preview, marketing claims, or a visible list of demo credentials on the page.
