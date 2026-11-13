# FR-02 request experience

## Foundation
Responsive browser application using shadcn/ui in the implementation. [DESIGN.md](DESIGN.md) owns visual tokens. This handoff covers synthetic customer policies only.

## Information Architecture
The customer starts from an `ACTIVE` policy detail, enters one supported change, and receives a request-recorded confirmation. The selected policy remains identified throughout. An `EXPIRED` policy detail displays why request creation is unavailable and offers navigation back to the policy list.

## Voice and Tone
Use direct labels and field guidance. Say “Request recorded; checks are pending” on success. Explain that the request is not an approval or policy update. Use a plain “This policy has expired. You cannot request a change to it” message for the blocked state.

## Component Patterns
The change type selector offers beneficiary, correspondence address, payment frequency, and accidental-death rider. Selecting a type shows only its related fields and preserves entered values when the customer returns to a previous type. Beneficiary changes edit a complete replacement list with add and remove row controls; allocation percentages must total 100. The effective date is common to every type. Every input has a visible label; errors appear next to the field and are summarized at submission.

## State Patterns
Show loading policy, active policy, expired policy, unsupported or inaccessible policy, incomplete input, submitting, submission error, and recorded request states. For an expired policy, omit the form and submit control. A direct API attempt must also fail without creating a request. If the session expires, clear policy and form data from view and return to sign-in.

## Interaction Primitives
Changing type updates the visible fields without navigation. Submit once per intended request and disable repeated submission while pending. On an API error, retain entered values for correction. After success, show the server request ID and a path back to the policy.

## Accessibility Floor
Keyboard operation, visible focus, semantic headings, associated labels, error announcement, and sufficient contrast are required. Move focus to the error summary after failed submission and to confirmation after success. Hidden fields must not remain in the tab order or be submitted.

## Key Flows
Alice opens an active synthetic policy, chooses one change, provides its details and an effective date, then submits. The confirmation states that checks are pending. Alice opens an expired policy and sees why the request action is unavailable. Bob cannot start a request for Alice’s policy by changing its URL.

## Responsive & Platform
On narrow screens, policy facts and form controls stack in one column. The submit action remains after the fields in reading and keyboard order.
