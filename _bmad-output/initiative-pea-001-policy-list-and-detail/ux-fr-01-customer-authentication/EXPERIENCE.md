# FR-01 experience

## Foundation
Responsive browser application using shadcn/ui in the implementation. [DESIGN.md](DESIGN.md) owns visual tokens.

## Information Architecture
Unauthenticated customers reach sign-in. Authenticated customers reach their linked synthetic policy list and may open a policy detail. The header offers sign-out.

## Voice and Tone
Use direct instructions and generic credential errors. State that policy information is synthetic and approval does not bind coverage.

## Component Patterns
Every input has a visible label. The submit control is disabled while sign-in is pending. Error text remains beside the form and receives focus after failure.

## State Patterns
Show loading, success, invalid credentials, expired session, and network error states. A signed-out or expired session clears protected policy content before returning to sign-in.

## Interaction Primitives
Enter submits the form. Sign-out invalidates the server session before navigation. Browser refresh checks the server session before protected content renders.

## Accessibility Floor
Keyboard operation, visible focus, semantic headings, associated labels, error announcement, and sufficient contrast are required.

## Key Flows
Alice signs in, sees only her linked policies, opens one, and signs out. Bob cannot obtain Alice's policy by changing the URL. An expired session returns either customer to sign-in without showing protected details.

## Responsive & Platform
The form remains one column on mobile. The policy list becomes stacked rows at narrow widths.
