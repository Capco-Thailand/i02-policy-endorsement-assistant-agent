---
status: final
updated: 2026-11-16
---
# FR-01 experience contract

## Foundation
Responsive customer web app. The Next.js UI uses shadcn/ui and the paired [visual contract](DESIGN.md). Fastify validates each session and derives the customer identity. The [sign-in mockup](../../../design/page/sign-in.html) previews states; the two contracts govern if it differs.

## Information Architecture
| Surface | Entry | Outcome |
| --- | --- | --- |
| Sign-in | App entry or protected route without a valid session | Establish a session with synthetic local credentials. |
| Policy list | Successful sign-in | Show only linked policies; FR-03 owns list content and design. |
| Protected-route gate | Direct URL or session expiry | Remove protected data and return to sign-in. |
| Sign-out | Authenticated navigation | Invalidate session, clear protected state, return to sign-in. |

## Voice and Tone
Use direct customer language: “Sign in to view your policies.” Invalid credentials: “We couldn't sign you in. Check your details and try again.” Expiry: “Your session ended. Sign in again.” State “Synthetic demo accounts only” near the form. Do not reveal whether an account exists.

## Component Patterns
- Account ID and password are required, labeled, keyboard reachable, and submitted with Enter. Mask the password.
- While submitting, prevent duplicate requests and announce progress. On invalid credentials, keep account ID, clear password, and focus the generic error.
- Sign-out waits for server invalidation, then clears protected client data and returns to sign-in.

## State Patterns
| State | Behavior |
| --- | --- |
| Initial | Empty form; no policy data. |
| Missing field | Name the missing field and focus it. |
| Submitting | Keep form visible; disable duplicate submission. |
| Invalid credentials | Generic error; no session or protected data. |
| API unavailable | Distinct retry message; do not claim credentials were wrong. |
| Expired or invalid session | Clear protected view and cache; redirect with session-ended copy. |
| Signed out | Old session cannot restore access through browser back or direct API use. |

## Interaction Primitives
Follow document tab order. Maintain visible focus via {colors.focus}. Move focus to error summary after request failure. The API checks authorization again on direct navigation and browser history.

## Accessibility Floor
Use semantic form fields with persistent labels, `autocomplete="username"` and `autocomplete="current-password"`, a submit button, and error summary with `role="alert"`. Associate field errors with inputs. Do not depend on motion or hover. Respect reduced-motion settings.

## Key Flows
1. Narin signs in using his synthetic account and reaches only his linked policy list.
2. Mali mistypes a password, receives a generic error, corrects it, and retries without any protected data appearing after the failure.
3. Narin's session expires on a protected page. The page clears customer data and returns him to sign-in; direct API reuse yields `401`.
4. Mali signs out. The session is invalid immediately; browser back does not reveal protected content.

## Prototype Boundary
All accounts and policies are synthetic. A later proposal decision belongs to FR-11 and creates only a non-binding record; FR-12 owns history.
