---
name: FR-01 customer sign-in
status: final
updated: 2026-11-13
sources:
  - ../../../docs/tickets/fr-01-authenticate-customers.md
---

# FR-01 experience

## Foundation

Responsive customer web experience. The Next.js application uses shadcn/ui for controls and the paired [DESIGN.md](DESIGN.md) for the project visual layer. The browser calls the Fastify API; only the server validates sessions and derives customer identity. The [browser mockup](../../../design/page/sign-in.html) illustrates states; these two documents govern if the mockup differs.

## Information Architecture

| Surface | Reached from | Purpose |
| --- | --- | --- |
| Sign-in | App entry or protected route without a valid session | Enter local demo credentials and establish a session. |
| Customer policy list | Successful sign-in | Land on only the customer's linked synthetic policies; FR-03 owns the list behavior and design. |
| Protected route gate | Direct URL or session expiry | Clear protected data, then send the customer to sign-in with a generic explanation. |
| Sign-out | Authenticated app navigation | Invalidate the server session, clear client-held protected data, and return to sign-in. |

The sign-in page does not expose account names, policy identifiers, or beneficiary details before authentication. [ASSUMPTION] After sign-in, return the customer to a safe requested route when one exists and is authorized; otherwise use the policy list. The API remains the authority for access.

## Voice and Tone

Use plain customer language. Primary action: “Sign in.” Invalid credentials: “We couldn't sign you in. Check your details and try again.” Expired or signed-out session: “Your session ended. Sign in again.” Do not disclose whether an account exists. State “Synthetic demo accounts only” near the form.

## Component Patterns

| Component | Behavior |
| --- | --- |
| Credential fields | Both required; labels persist; password is masked; Enter submits. |
| Submit button | Disabled only while a submission is pending; repeat submissions are prevented. |
| Error notice | Appears after a failed request, announced to assistive technology, and does not erase entered account ID. Password is cleared after invalid credentials. |
| Sign-out action | Available wherever authenticated navigation exists; waits for server invalidation, then clears protected client state and navigates to sign-in. |

## State Patterns

| State | Treatment |
| --- | --- |
| Initial | Empty credential fields, no policy data, one primary action. |
| Missing field | Keep focus on first missing field and provide field-specific required text. |
| Submitting | Keep form visible, disable duplicate submission, announce progress. |
| Invalid credentials | Generic error; no usable session or account existence clue. |
| API unavailable | Explain sign-in is temporarily unavailable and allow retry; do not imply credentials were wrong. |
| Session expired or invalid | Remove protected data from view and cache; redirect to sign-in with session-ended copy. |
| Signed out | Invalidate session before navigating; old token or cookie cannot be reused. |

## Interaction Primitives

Tab order follows document order. Enter submits from either field. Keyboard focus remains visible using {colors.focus}. Submission errors move focus to the error summary. Browser back after sign-out must not reveal protected content; a fresh server check is required before showing it.

## Accessibility Floor

Use a semantic form with explicit labels, `autocomplete="username"` and `autocomplete="current-password"`, a real submit button, and an error summary with `role="alert"`. Keep errors in text, associate field errors via `aria-describedby`, and maintain readable contrast using {colors.ink}, {colors.muted}, and {colors.error}. No interaction depends on hover or motion. Respect reduced-motion preference.

## Key Flows

1. **Narin signs in:** Narin opens the prototype, enters the credentials for his synthetic account, and submits. The server establishes an expiring session. He reaches his linked policy list without seeing another customer's data.
2. **Mali mistypes a password:** Mali submits invalid credentials. She sees the generic error, keeps the account ID, corrects the password, and retries. No session or policy data appeared after the failed attempt.
3. **Narin's session ends:** While viewing a protected page, Narin's session expires. The page clears protected data and sends him to sign-in with the session-ended message. Reusing the old session against the API returns `401`.
4. **Mali signs out:** Mali chooses Sign out. The server invalidates her session and the app clears protected data. Browser back and direct API reuse do not restore access.

## Prototype boundary

All identities and policy data are synthetic. Signing in and any later customer decision cannot update a live policy or bind coverage. FR-11 owns the proposal decision UI; FR-12 owns the history page.
