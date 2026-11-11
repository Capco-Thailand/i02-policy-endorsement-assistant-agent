---
name: Policy Endorsement Assistant
status: draft
updated: 2026-11-11
---

# FR-02 Request Capture Experience

## Foundation

Responsive web for authenticated staff. [DESIGN.md](DESIGN.md) owns the visual treatment. The [request mockup](../../design/page/create-endorsement-request.html) shows the main form and its states. The documents govern if the mock differs.

## Information Architecture

| Surface | Reached from | Purpose |
|---|---|---|
| Assigned policy detail | Policy list | Show selected synthetic policy and start a request. |
| Create request | Assigned policy detail | Capture one supported change. |
| Recorded request confirmation | Successful submission | Show request ID and “Pending checks”; return to policy detail. |

## Voice and Tone

Use “Create endorsement request,” “Requested effective date,” “Record request,” and “Pending checks.” Say “This request does not change coverage.” For inaccessible or unknown policy use one generic message: “Policy unavailable.”

## Component Patterns

| Component | Behavior |
|---|---|
| Policy summary | Read-only; shows ID and status from the authorized API. |
| Change selector | Offers beneficiary, correspondence address, payment frequency, accidental-death rider. Changing selection reveals relevant fields. |
| Required fields | Show clear labels and field errors; retain entered values after rejection. |
| Submit | Prevent duplicate submission while pending. Server response decides success. |

## State Patterns

| State | Treatment |
|---|---|
| Loading policy | Say what is loading; do not show stale policy details. |
| Invalid session | Remove protected content and route to sign-in. |
| Unknown or unassigned policy | Generic unavailable page without policy details. |
| Incomplete or invalid | Inline errors with focus moved to the first invalid field. |
| Submitting | “Recording request…” and no duplicate action. |
| Success | Request ID, pending-check status, and non-binding reminder. |
| Server failure | Retryable error; preserve input. |
| Expired policy | Show “Cannot proceed to eligibility” beside status; request recording remains an open product decision. |

## Interaction Primitives

Use a normal form submit with Enter support. Keep the selected policy fixed. If the change type changes, retain values for each type in the browser until submission or navigation away. Move focus to the confirmation heading after success.

## Accessibility Floor

Use semantic form controls and associated labels. Errors use text and `aria-describedby`; the result is announced. Preserve visible `{colors.focus}` and keyboard access to every option. Reflow at 320px.

## Responsive & Platform

The same fields and status messages appear on desktop and mobile, in one reading order. No hover-only action is required.

## Key Flows

### Record a change request

1. Alice opens an assigned synthetic policy and chooses Create endorsement request.
2. She sees the fixed policy ID, selects correspondence address, enters the requested address and effective date.
3. She records the request. The server associates it with Alice's session.
4. **Climax:** Alice sees a request ID and “Pending checks,” with a clear statement that coverage has not changed.

If an input is missing, Alice corrects it without reentering the other values. An inaccessible policy never reaches the form.

## Assumptions and open questions

- **Open question:** Confirm permitted values and required inputs for each change type against synthetic fixtures.
- **Open question:** Confirm whether an expired policy request is recorded or blocked at submission.
