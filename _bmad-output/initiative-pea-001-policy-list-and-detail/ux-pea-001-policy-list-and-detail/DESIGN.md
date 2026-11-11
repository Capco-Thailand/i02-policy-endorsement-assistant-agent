---
name: Policy Endorsement Assistant
description: Visual contract for the PEA-001 policyholder policy list and detail flow.
status: final
sources:
  - ../../../docs/PRD.md
updated: 2026-11-11
colors:
  canvas: "#f6f9fc"
  paper: "#ffffff"
  ink: "#0a2540"
  muted: "#425466"
  line: "#dce6ef"
  accent: "#635bff"
  accent-ink: "#5148d9"
  accent-soft: "#f0efff"
  focus: "#5148d9"
  active: "#16624a"
  active-soft: "#e8f6ef"
  warning: "#79510d"
  warning-soft: "#fff5df"
typography:
  display:
    fontFamily: "Inter, system-ui, Arial, sans-serif"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.04em"
  interface:
    fontFamily: "Inter, system-ui, Arial, sans-serif"
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "10px"
spacing:
  gutter: "24px"
  section: "32px"
components:
  primary-action:
    background: "{colors.accent}"
    foreground: "{colors.paper}"
    radius: "{rounded.sm}"
  record-panel:
    background: "{colors.paper}"
    border: "{colors.line}"
    radius: "{rounded.md}"
---

## Brand & Style

Use a Stripe-inspired product identity: deep ink, crisp white surfaces, a cool near-white canvas, a confident violet action, generous spacing, and clear sans-serif hierarchy. The reference is [Stripe's public site](https://stripe.com/); retain the Policy Endorsement Assistant name and mark rather than copying Stripe's logo or product imagery. The result should feel precise and trustworthy for synthetic policy servicing. Keep policy facts and eligibility more prominent than decoration.

## Colors

Use `{colors.ink}` for primary text, `{colors.muted}` for secondary text, and `{colors.line}` for quiet separation. `{colors.accent}` belongs to primary actions and compact emphasis; use the darker `{colors.accent-ink}` for text links on light surfaces. `{colors.accent-soft}` is a light action tint, not a status color. Active and expired states use explicit text; `{colors.active}` and `{colors.active-soft}` identify an active policy, while `{colors.warning}` and `{colors.warning-soft}` distinguish an expired or unavailable policy without suggesting approval. Avoid purple-to-blue gradients. All normal text, controls, badges, and focus indicators must meet WCAG 2.2 AA contrast; the white-on-violet primary action and dark-violet links are the required pairs.

## Typography

Use `{typography.display.fontFamily}` with a bold, tightly tracked heading hierarchy. Interface labels, supporting copy, and controls use `{typography.interface.fontFamily}`. Prefer Inter when available, with the system font as the local fallback; browser-viewable mockups must still render without a network font. Policy number remains the identifying heading within a record card and on detail. Keep labels distinct from values and numeric data readable at narrow widths.

## Layout & Spacing

Use `{spacing.gutter}` for desktop page gutters and `{spacing.section}` between major groups, reducing gutters on narrow screens. The list is a responsive stack of full-width policy cards; at wider widths, a restrained two-column grid is acceptable if every card remains easy to scan. Detail uses a single reading column with grouped sections for policy facts and beneficiaries. The primary action follows eligibility information in reading order. No horizontal scrolling for core facts.

The shared CSS applies this identity to the current [preview index](../../../design/page/index.html) and [sign-in mockup](../../../design/page/sign-in.html). Recreated policy-list, detail, unavailable, and intake mockups should use the same tokens. This document wins if a mock differs.

## Elevation & Depth

Use white panels against the cool canvas, hairline borders, and separators. A single subtle hover shadow may clarify an interactive card; do not layer shadows, glow, or blur. Hierarchy comes primarily from type, grouping, and spacing.

## Shapes

Use `{rounded.sm}` for controls and `{rounded.md}` for record panels. Keep badges compact. Do not turn every surface into a pill or an oversized rounded card.

## Components

| Component | Visual contract |
|---|---|
| Policy card | White bordered record panel with policy number, product, status badge, effective and expiry dates, and a clear detail link. A subtle border or shadow change may signal hover; keyboard focus remains visible. |
| Status badge | Compact text badge with literal `ACTIVE` or `EXPIRED` text; violet is not used as a proxy for eligibility. |
| Policy fact group | Labeled values in a responsive definition-list layout; no truncated values. |
| Beneficiary list | Repeated rows with name, relationship, and allocation percentage; use separators between rows. |
| Action button | White-on-violet primary action for Request Endorsement on eligible policies; neutral disabled state for expired policies, with nearby explanatory text. |
| Feedback panel | Restrained bordered panel for errors and unavailable access; clear title, brief explanation, and recovery action where applicable. |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Show status and eligibility in words | Make eligibility depend on color alone |
| Keep policy identifiers prominent | Make users infer identity from product name |
| Keep disabled action visible with an explanation | Remove the action without explaining why an expired policy cannot proceed |
| Apply the shared ink, violet, and cool-neutral tokens to new screens | Copy Stripe trademarks, gradients, or marketing imagery |
