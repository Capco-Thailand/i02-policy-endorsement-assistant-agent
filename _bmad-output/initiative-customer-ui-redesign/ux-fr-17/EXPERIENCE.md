---
name: FR-17 request and eligibility experience
status: final
updated: 2026-11-25
sources:
  - docs/tickets/fr-17-redesign-request-and-eligibility.md
---

# FR-17 experience contract

## Foundation

Responsive web for synthetic demo customers. Inherit FR-02 request validation and authorization, FR-08 server eligibility decisions and citations, and FR-15's non-binding language. [DESIGN.md](DESIGN.md) owns the visual tokens. Use existing authorized policy detail fields only: beneficiaries, payment frequency, and confirmed cited coverage; the current correspondence address and rider state are not supplied. The customer accepted the reference layouts on 2026-11-25.

## Information Architecture

| Surface | Customer answer | Next action |
| --- | --- | --- |
| Change request | What does my policy say now, and what am I asking to change? | Choose one of four types, enter requested details, and record the request. |
| Recorded request | Was my request saved, and did it change coverage? | Read the request ID and pending-check state; choose Check eligibility. |
| Eligibility result | Can this request proceed, why, and what happens next? | Follow the server-provided next step; prepare a proposal only when allowed. |

The [request](../../../design/page/fr-17-request.html) and [eligibility](../../../design/page/fr-17-eligibility.html) mockups show accepted desktop and 320px reading order. The spines win on conflict.

## Voice and Tone

Use “Current policy”, “Requested change”, “Record request”, “Request recorded”, “Check eligibility”, and the outcome label. Say “No policy coverage has changed” after recording and assessment. Never call a recorded request approved or imply a successful check binds coverage. For absent current values, say “Not available in this policy record”; avoid guessing.

## Component Patterns

| Part | Behavior |
| --- | --- |
| Change chooser | One native choice selects beneficiary, correspondence address, payment frequency, or accidental-death rider fields; selecting it moves focus to the new fields heading. |
| Current-value panel | Reads only authorized policy detail data. Current beneficiaries and frequency are exact; an absent address is explicit. Confirmed cited accidental-death coverage may be shown, but rider state is not inferred. |
| Beneficiary rows | A complete replacement list. Each name and percentage is labeled, editable, and removable except the last row. The numeric total and under/over/100% text update together. |
| Record action | Valid calendar date and change-specific fields are required. Invalid input receives an inline error and first-invalid focus. Submission is not an eligibility decision. |
| Recorded request | Uses the server-returned ID and requested values. It keeps a separate Check eligibility action and states no coverage changed. |
| Eligibility result | Uses server outcome, reasons, next step, policy/rule citations and unresolved source IDs as returned. Only `CAN_PROCEED` offers proposal preparation. |

## State Patterns

| State | Visible outcome |
| --- | --- |
| Initial | No change type selected; current policy identity and boundary visible. |
| Incomplete or invalid | Descriptive field error, retained input, focus on first invalid field; beneficiary total says under or over 100%. |
| Recording | Named pending state; submit disabled while in flight. |
| Recorded, unchecked | Request ID, pending-check explanation, separate Check eligibility button. |
| `CAN_PROCEED` | Plain-language reason, next step, citations, and prepare-proposal action. |
| `CANNOT_PROCEED` | Reason and next step; no prepare-proposal action. |
| `NEEDS_REVIEW` | Unresolved reason/source, human-review next step, available citations; no prepare-proposal action. |
| Service error | Retain editable request input or recorded request; offer retry without a false decision. |
| Expired, foreign, unknown, or ended session | Existing FR-02/08 owner and session boundaries; no request or eligibility write. |

## Interaction Primitives

Keep DOM and tab order aligned with heading, boundary, current value, requested fields, total, record action, recorded state, check action, outcome, and next step. Use the existing API hooks and server calculations. Current coverage terms are evidence about the policy, not a browser-derived rider eligibility decision. The result does not reuse the request's success style.

## Accessibility Floor

Use native labeled controls, fieldset/legend for beneficiary rows, semantic status and alert regions, and clear button text. Announce the allocation total and outcome with text; avoid color-only states. Keep links, IDs, percentages, citation labels, errors, and buttons readable at 320px without horizontal scroll. Keyboard users can add/remove rows, retry, and follow citations.

## Responsive & Platform

At desktop, aligned current/requested subcolumns may aid comparison without changing reading order. At 320px they stack and all four change types retain the same fields and actions. Do not hide citations or the non-binding boundary on mobile.

## Key Flows

### Narin requests a payment-frequency change

1. Narin opens his active synthetic policy and chooses a change request.
2. He sees the current monthly frequency from his authorized policy record and selects annual as the requested value.
3. He chooses an effective date and records the request.
4. **Climax:** The page shows the request ID and “pending checks”; he understands that no coverage changed.
5. He checks eligibility and reads the server-provided outcome, reason, citation, and next step before any proposal preparation.

### Mali reviews an unresolved source

1. Mali records a valid request against her active synthetic policy.
2. Eligibility returns `NEEDS_REVIEW` with a missing or conflicting source.
3. **Climax:** She sees why automated progression stopped and the human-review next step, without a proposal or invented coverage decision.

## Inspiration & Anti-patterns

Use the accepted FR-15 comparison hierarchy and semantic theme. Avoid a multi-step wizard that hides current values, a green “request saved” card that looks like approval, or a chart that obscures exact beneficiary percentages.
