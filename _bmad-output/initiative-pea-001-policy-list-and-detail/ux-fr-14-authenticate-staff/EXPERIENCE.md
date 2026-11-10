---
name: Policy Endorsement Assistant
status: final
sources:
  - https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/13
updated: 2026-11-10
---

# FR-14 Staff Authentication Experience

## Foundation

Responsive web for synthetic policy-service staff. Next.js App Router and shadcn/ui are the intended UI stack. [DESIGN.md](DESIGN.md) owns visual treatment; this document owns behavior. The existing PEA-001 design language carries through the authentication surface. The [sign-in mockup](../../../design/page/sign-in.html) shows normal, invalid-credential, and expired-session states. These spines win if the mock differs.

## Information Architecture

| Surface | Route | Reached from | Purpose |
|---|---|---|---|
| Sign in | `/sign-in` | App entry or protected route without a valid session | Enter individual synthetic demo credentials. |
| Protected policy pages | Existing `/policies` and policy routes | Successful sign-in or direct URL | Display only backend-authorized data after session validation. |
| Signed-in header | Existing protected pages | Every authenticated page | Identify the current staff member and expose Sign out. |

The sign-in route does not show policy details. A protected direct URL first validates the session; if invalid, it reaches sign-in without rendering cached policy content. After successful sign-in, return to the originally requested internal route when safe, otherwise `/policies`. A signed-in visitor at `/sign-in` goes to `/policies`. These routing details are an assumption to confirm; no user-supplied external redirect is followed.

## Voice and Tone

Use plain copy: “Staff sign in,” “Account ID,” “Password,” “Sign in,” “Sign out,” and “Synthetic demo accounts only.” For invalid credentials: “Sign-in failed. Check your account ID and password.” For expiry: “Your session ended. Sign in again to continue.” For a request failure: “Sign-in is unavailable. Try again.” Never indicate which credential was wrong or expose the account fixture in an error.

## Component Patterns

| Component | Behavior |
|---|---|
| Credential form | Account ID and password are required. Enter submits from either field. Password input masks characters and allows standard password-manager behavior. |
| Sign in button | Submits once; while pending, shows “Signing in…” and prevents duplicate submission. |
| Form error | Appears inline after a rejected attempt and is announced. Clear it when a new attempt starts; keep the account ID and clear the password. |
| Session notice | Appears at the top of sign-in after expiry or sign-out; it never includes policy information. |
| Sign out control | Available in the authenticated app header, keyboard operable, and calls the backend. Clear protected client state and navigate to sign-in after the server confirms or rejects an already-invalid session. |

## State Patterns

| State | Treatment |
|---|---|
| Initial | Empty labeled fields, enabled submit when inputs meet required-field validation, synthetic-demo notice. |
| Submitting | Button says “Signing in…”; field values stay in place; duplicate submit prevented. |
| Invalid credentials | Generic inline error, password cleared, focus moves to the error summary or password field. |
| API unavailable | Inline retryable error; no signed-in state or protected content. |
| Session expired or invalid | Protected content is removed; sign-in screen shows “Your session ended. Sign in again to continue.” |
| Signed out | Protected content is removed; sign-in screen shows “You signed out.” |
| Signed in | Redirect to safe internal destination or `/policies`; backend remains the authority on actor and policy access. |
| Cross-account or unknown policy | Existing generic unavailable policy state, with no policy or beneficiary data. |

## Interaction Primitives

- Tab order follows heading, account ID, password, Sign in. A visible `{colors.focus}` outline marks focus.
- Enter submits the form. Submission never stores a password in browser storage or URL parameters.
- On sign-in success, focus the protected page heading. On expiry, focus the sign-in heading or session notice; assistive technology announces the reason.
- Sign out is an explicit action in the signed-in header. Repeating it when the session has already ended still leaves the browser in the signed-out state.
- Client-side route guards are presentation only. Protected API calls always validate the server session.

## Accessibility Floor

- Use semantic `<form>`, `<label>`, `<input>`, and `<button>` elements with clear accessible names.
- Associate field errors with inputs and expose the form error with `role="alert"` or a polite live region appropriate to timing.
- Do not rely on color alone for invalid, busy, or expired states. The page reflows at 320px without horizontal scrolling.
- Keep focus visible and meaningful after submit, redirect, expiry, and sign-out. Do not erase entered account ID after a failed sign-in.

## Responsive & Platform

The same form and actions appear on desktop and mobile. The form remains one column and retains full field labels at narrow widths. No hover-only actions. No motion is required; follow reduced-motion preference.

## Key Flows

### Sign in and resume assigned policy work

1. Alice, a synthetic demo staff member, opens `/policies` in a browser with no valid session.
2. The app directs her to Staff sign in without showing policy content.
3. She enters her individual account ID and password and submits.
4. **Climax:** `/policies` opens under Alice's validated session, showing only policies assigned to her. The header identifies Alice and offers Sign out.

Failure: invalid credentials show the generic form error. No protected policy request succeeds from that attempt.

### Expire and sign out safely

1. Alice's session expires while a protected page is open.
2. Her next protected request receives an authentication failure, and the UI removes protected content.
3. **Climax:** the sign-in page explains that her session ended and lets her sign in again. The old session cannot be reused.
4. Later, she chooses Sign out in the header. The UI returns to sign-in, clears protected state, and shows “You signed out.”

## Assumptions and open questions

- **Assumption:** A safe internal return path is retained through sign-in. If no valid return path is available, use `/policies`.
- **Open question:** Confirm the display name and account-ID wording for seeded staff fixtures once local configuration is defined. The mockup uses generic sample text and no real credentials.
