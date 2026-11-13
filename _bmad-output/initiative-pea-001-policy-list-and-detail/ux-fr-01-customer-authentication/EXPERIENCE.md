---
status: final
updated: 2026-11-13
---
# FR-01 experience

## Foundation
Responsive browser application using shadcn/ui in implementation. [DESIGN.md](DESIGN.md) owns appearance. The [HTML preview](../../../design/page/sign-in.html) uses local demonstration interactions only; the implementation uses server-validated sessions.

## Information Architecture
Unauthenticated customers reach sign-in. After authentication, customers reach their linked synthetic policies. The policy list provides policy detail navigation and sign-out. FR-03 supplies the policy list and detail behavior.

## Voice and Tone
Use direct instructions and a generic invalid-credentials message. State that data is synthetic and no live coverage changes.

## Component Patterns
Every input has a visible label. The primary action is unavailable while sign-in is pending. Put errors beside the form and move focus to them after failure. Do not reveal whether an account ID exists.

## State Patterns
Show initial, submitting, invalid credentials, network error, authenticated, signed-out, and expired-session states. Clear protected policy content immediately on sign-out or session expiry, then return to sign-in. During a refresh, check the session before protected content appears.

## Interaction Primitives
Enter submits the form. Sign-out invalidates the server session before navigation. The UI takes customer identity from the current-session response; entered or URL identity never grants access. The preview simulates these states without making authorization claims.

## Accessibility Floor
Provide keyboard operation, visible focus, semantic headings, associated labels, announced errors, and contrast using `{colors.ink}` and `{colors.error}`. Focus the sign-in heading after expiry.

## Key Flows
Alice signs in and reaches her policy list, then signs out. Bob cannot see Alice’s policies by changing a URL. If Alice’s session expires, protected content disappears and she returns to sign-in.

## Responsive & Platform
On wide screens, the introduction sits beside the sign-in form. On narrow screens, it moves above the form. Policy rows stack without hiding status or action.
