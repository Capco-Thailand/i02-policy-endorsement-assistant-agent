---
name: Policy Endorsement Assistant shadcn experience
status: final
updated: 2026-11-25
---

# Shadcn preset experience contract

## Foundation

The product remains a responsive customer web app. [DESIGN.md](DESIGN.md) owns its visual identity, using shadcn/Base UI and preset `b51GFh7y6`. Existing feature EXPERIENCE.md files own their screen-specific workflows where this document does not change behavior.

## Information Architecture

Keep the implemented route sequence: sign-in, policy list, policy detail, endorsement request and eligibility, proposal review and decision, and change history. Styling does not add routes or change navigation order.

## Voice and Tone

Keep plain policy language and the existing synthetic-data notice. Use “proposed change” and “record your decision.” Approval never says that coverage was issued or the underlying policy changed.

## Component Patterns

Forms use labeled fields and visible error text. Primary actions use the preset button style. Status panels include a text outcome and the next step. Evidence stays next to the decision it supports. Current and proposed values keep explicit labels.

## State Patterns

Loading names what is loading. Empty states offer the relevant next action. Errors remain visible and actionable. Success states state only the action actually recorded. Use `{colors.muted}` for supporting text and `{colors.destructive}` for errors as defined in [DESIGN.md](DESIGN.md).

## Interaction Primitives

Keep submit, retry, back, sign-out, approve, and reject behavior. Reject still requires confirmation, Escape and Cancel dismiss it, and focus returns to the originating control. Applying a shadcn component must preserve these behaviors.

## Accessibility Floor

Keep semantic headings, explicit labels, keyboard focus, error announcements, and status text. Check contrast under the new preset, including disabled controls and focus rings. No outcome depends on color or an icon alone.

## Responsive & Platform

At narrow viewport widths, stack sign-in, policy cards, facts, beneficiary rows, and current/proposed comparisons without horizontal scrolling. Keep actions large enough to operate by touch.

## Key Flows

1. A customer signs in, sees their policy list, and opens a policy. The new theme changes appearance only; policy ownership and status remain clear.
2. The customer requests an endorsement, reviews eligibility and cited evidence, then examines a proposed change. The proposal clearly says it is non-binding.
3. The customer approves or rejects the proposal and later reads the history entry. The entry records a decision, while the underlying policy remains unchanged.
