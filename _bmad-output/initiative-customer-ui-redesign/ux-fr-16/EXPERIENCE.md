---
name: FR-16 sign-in and policy list experience
status: final
updated: 2026-11-25
sources:
  - docs/tickets/fr-16-redesign-sign-in-and-policy-list.md
---

# FR-16 experience contract

## Foundation

Responsive web for synthetic demo customers. Inherit existing FR-01 session and FR-03 owner authorization behavior. [DESIGN.md](DESIGN.md) owns visual tokens and composition; this file owns behavior. Use only current policy-list response fields: label, ID, status. The customer accepted the reference layouts on 2026-11-25.

## Information Architecture

| Surface | Customer answer | Next action |
| --- | --- | --- |
| Sign-in | Which synthetic account can I use, and what does signing in do? | Enter account ID and password, then sign in. |
| Policy list | Which of my policies should I open? | Choose the named “View policy” action for one authorized record; retain sign-out and customer history links. |
| Policy detail | What does this policy contain? | Existing FR-15 detail flow; expired values are historical. |

The [sign-in](../../../design/page/fr-16-sign-in.html) and [list](../../../design/page/fr-16-policy-list.html) mockups show the proposed order. The spines win on conflict.

## Voice and Tone

Use “Synthetic demo account,” “Your policies,” “Active,” “Expired,” and “View policy.” The prototype boundary explains that viewing or signing in does not change live coverage. Do not imply that signing in validates a real insurer identity.

## Component Patterns

| Part | Behavior |
| --- | --- |
| Sign-in panel | Account ID and password have labels, required errors, and one submit action. Invalid credentials produce a readable form-level error and keep the form usable. |
| Policy row | Reads one owner-authorized response item. Label leads, ID distinguishes, status states Active or Expired, and the link names its action. |
| List state | Loading names what is loading; empty says no policies are linked; service error offers retry; session-ended returns to sign-in. |

## State Patterns

| State | Visible outcome |
| --- | --- |
| Blank sign-in fields | Field-specific errors; focus moves to first invalid field. |
| Invalid credentials | Form-level error; no policy data displayed. |
| Session ended | Sign-in heading and status message; no stale policy data. |
| Sign-in service unavailable | Error and retry by submitting again; no false session. |
| Policy list loading | Heading remains; status names policies. |
| Empty list | Clear empty message with no invented policy. |
| List service error | Error and retry control. |
| Active policy | Text “Active”; View policy opens authorized detail. |
| Expired policy | Text “Expired”; detail labels historical values and offers no request action. |
| Unowned or unknown policy | Existing FR-03 non-disclosing boundary applies; list contains only authorized records. |

## Interaction Primitives

Reading and tab order follow heading, boundary, form or list, then action. The full policy row may be a link if its accessible name includes the policy label; visible “View policy” remains. Form submission and retry use existing API clients and session logic. Do not infer new policy facts in the browser.

## Accessibility Floor

Use explicit labels, native form controls, and semantic status/alert text. Move focus to the first invalid field on client validation and keep form-level errors announced. Session-ended message precedes the form. Focus rings use `{colors.primary}` with visible contrast. At 320px, no horizontal scroll, clipped IDs, fields, error messages, or buttons; status meaning does not depend on color.

## Responsive & Platform

Desktop can place explanation and form in adjacent areas while preserving one DOM reading path. At 320px they stack. Policy rows remain a single vertical list at both widths; at 320px each row stacks identity, status, and action. The same authorized data appears at both widths.

## Key Flows

### Narin finds a policy

1. Narin opens sign-in and sees that this is a synthetic prototype.
2. Narin enters the demo account ID and password and signs in.
3. The authorized list shows two policies with distinct names, IDs, and Active or Expired text.
4. **Climax:** Narin chooses the intended policy from “View policy” without opening each one.
5. On an expired policy, the detail labels values as historical and offers no change request.

If the session ends, Narin returns to sign-in with an explanation. If the list cannot load, Narin sees retry without another customer's records.

## Inspiration & Anti-patterns

Use the accepted FR-15 semantic theme and restrained hierarchy. Avoid generic dashboard cards and unsourced list facts.
