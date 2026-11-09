---
name: Policy Endorsement Assistant
description: Visual contract for the PEA-001 policyholder policy list and detail flow.
status: final
sources:
  - ../../../docs/tickets/PEA-001-policy-list-and-detail.md
updated: 2026-11-09
colors:
  canvas: "#f5f4ef"
  paper: "#fffefa"
  ink: "#242b2a"
  muted: "#66716e"
  line: "#d9ddd6"
  accent: "#176b60"
typography:
  display: "Georgia, Times New Roman, serif"
  interface: "Arial, sans-serif"
rounded: {}
spacing: {}
components: {}
---

## Brand & Style

The policyholder flow uses a restrained policy-record visual language: warm paper surfaces, fine rules, evergreen action cues, and serif record headings paired with compact sans-serif labels. Policy facts and eligibility remain the focus. Avoid gradients, ornamental imagery, card-heavy dashboards, and decorative shadows. Keep the styling specific to synthetic policy servicing rather than a generic SaaS template.

## Colors

Use the named colors above as the mockup palette. Evergreen is reserved for active status and primary actions; muted ochre marks expired/unavailable state. Status always appears as text; color may reinforce it but never carry it alone. The implemented theme must meet WCAG 2.2 AA contrast for normal text and focus indicators, including badge text, the primary action, and the expired explanation.

## Typography

Use serif display headings for page titles and policy identifiers, with sans-serif interface labels and supporting copy. Policy number is the identifying heading within a card and on detail. Labels are visibly distinct from values, and monetary and date values remain readable at narrow widths.

## Layout & Spacing

Use the existing spacing scale. The list is a responsive stack of full-width policy cards; at wider widths, a restrained two-column grid is acceptable if every card remains easy to scan. Detail uses a single reading column with grouped sections for policy facts and beneficiaries. The primary action follows the eligibility information in reading order. No horizontal scrolling for core facts.

The [My Policies mockup](../../../design/page/policies.html) shows the card layout. The [active detail](../../../design/page/policy-detail.html) and [expired detail](../../../design/page/policy-detail-expired.html) mockups show fact grouping and the action states. The [unavailable page](../../../design/page/policy-unavailable.html) shows the feedback panel; the [intake boundary](../../../design/page/endorsement-intake-boundary.html) shows where the active action leads. These documents win if a mock differs.

## Elevation & Depth

Use flat paper panels, thin borders, and separators. Hierarchy comes from headings, grouping, and spacing rather than layered shadows.

## Shapes

Prefer square corners and restrained compact badges. Avoid large rounded card treatments.

## Components

| Component | Visual contract |
|---|---|
| Policy card | Flat bordered record panel with policy number, product, status badge, effective and expiry dates, and a clear detail link. Entire card may be a link if focus and hover states remain visible. |
| Status badge | Compact text badge with literal `ACTIVE` or `EXPIRED` text; color is supplementary. |
| Policy fact group | Labeled values in a responsive definition-list layout; no truncated values. |
| Beneficiary list | Repeated rows with name, relationship, and allocation percentage; use separators between rows. |
| Action button | Evergreen primary action for Request Endorsement on eligible policies; muted disabled state for expired policies, with nearby explanatory text. |
| Feedback panel | Restrained bordered panel for errors and unavailable access; clear title, brief explanation, and recovery action where applicable. |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Show status and eligibility in words | Make eligibility depend on color alone |
| Keep policy identifiers prominent | Make users infer identity from product name |
| Keep disabled action visible with an explanation | Remove the action without explaining why an expired policy cannot proceed |
| Use shadcn defaults until a brand is supplied | Invent a new palette or type system for this ticket |
