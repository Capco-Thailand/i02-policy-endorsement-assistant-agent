---
status: final
updated: 2026-11-13
---
# FR-02 request experience

## Foundation
Responsive browser application using shadcn/ui in implementation. [DESIGN.md](DESIGN.md) owns appearance. The [HTML preview](../../../design/page/request.html) simulates request capture locally; the implementation requires the FR-01 session and FR-03 policy access.

## Information Architecture
From an `ACTIVE` policy detail, the customer enters one supported change and sees a request-recorded confirmation. Keep the selected policy identified throughout. An `EXPIRED` policy shows why request creation is unavailable and a route back to policies.

## Voice and Tone
Use direct labels and field guidance. Say “Request recorded; checks are pending” on success. Explain that capture is not approval or a policy update. Tell the customer plainly that an expired policy cannot be changed.

## Component Patterns
Offer beneficiary, correspondence address, payment frequency, and accidental-death rider. Show only fields for the selected type; preserve values when switching types. Beneficiary entry edits the complete replacement list with add and remove controls; allocations must total 100%. Every type has a requested effective date. Errors appear beside fields and in a focusable summary.

## State Patterns
Show loading policy, active policy, expired policy, inaccessible policy, incomplete input, submitting, server error, and recorded request. On an expired policy, omit form and submit action. If the session expires, clear policy and entry data from view and return to sign-in. On other errors, retain entered values for correction.

## Interaction Primitives
Changing type changes fields without navigation. Hidden fields leave the tab order and submission. Disable repeat submission while pending. On success, show the server request ID and a route back to the policy. A direct API request for an expired or inaccessible policy also fails; UI hiding alone is insufficient.

## Accessibility Floor
Provide keyboard operation, visible focus, semantic headings, associated labels, announced errors, and contrast using `{colors.ink}` and `{colors.error}`. Focus the error summary after failed submission and confirmation after success.

## Key Flows
Alice opens an active synthetic policy, selects a change, enters details and an effective date, then submits. She sees that checks are pending. Alice opens an expired policy and sees why no request can start. Bob cannot request a change to Alice’s policy by changing the URL.

## Responsive & Platform
On narrow screens, policy facts and controls stack in one column. The submit action follows fields in reading and keyboard order.
