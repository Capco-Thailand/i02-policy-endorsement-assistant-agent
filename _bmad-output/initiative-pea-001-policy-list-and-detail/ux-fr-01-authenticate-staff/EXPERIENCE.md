---
name: Policy Endorsement Assistant
description: Behavior contract for FR-01 customer authentication.
status: final
sources:
  - docs/tickets/fr-01-authenticate-staff.md
updated: 2026-11-12
---

# FR-01 Customer Authentication Experience

## Foundation

Responsive web for customers using synthetic policies. Next.js App Router and shadcn/ui are the intended implementation. [DESIGN.md](DESIGN.md) governs appearance; this document governs sign-in behavior. The [sign-in mockup](../../../design/page/sign-in.html) is a preview; both documents win if it differs. FR-11 and FR-12 own the later proposed-policy review and history screens.

## Information Architecture

| Surface | Route | Purpose |
|---|---|---|
| Sign in | `/sign-in` | Enter individual demo credentials and receive session feedback. |
| Protected policy pages | `/policies` and detail routes | Display only synthetic policies linked to the signed-in customer after session validation. |
| Signed-in header | Protected pages | Identify the current customer and offer Sign out. |

A direct protected URL validates the server session before showing policy content. Invalid sessions lead to sign-in. After success, return to a safe requested internal route or `/policies`; never follow an external redirect.

## Voice and Tone

Use “Sign in to request a policy change,” “Account ID,” “Password,” “Sign in,” and “Sign out.” Explain that only the customer's synthetic policies are available, proposed changes require their review, and approved changes appear in history without changing live coverage. Invalid credentials: “Sign-in failed. Check your account ID and password.” Expiry: “Your session ended. Sign in again to continue.” Sign-out: “You signed out.” API failure: “Sign-in is unavailable. Try again.” Never identify which credential was wrong.

## Component Patterns

| Component | Behavior |
|---|---|
| Credential form | Both fields required; Enter submits; password is masked and compatible with password managers. |
| Sign in button | During submission says “Signing in…” and prevents duplicate submission. |
| Form error | Announced inline; cleared on retry. Retain Account ID and clear Password after rejection. |
| Session notice | Appears above the form after expiry or sign-out, without policy details. |
| Sign out | Calls the backend, clears protected client state, and navigates to sign-in even if the session already ended. |

## State Patterns

| State | Treatment |
|---|---|
| Initial | Empty labeled fields and synthetic demo notice. |
| Submitting | Busy button and retained field values. |
| Invalid credentials | Generic error, cleared password, focus on the error. |
| API unavailable | Retryable error; no protected content. |
| Expired or signed out | Protected content removed; distinct notice on sign-in. |
| Signed in | Safe internal destination; backend remains authority for actor and policy access. |
| Unknown or another customer's policy | Same non-disclosing unavailable result. |

## Interaction Primitives

- Tab order follows Account ID, Password, and Sign in; `{colors.focus}` marks focus.
- Password never enters a URL or browser storage.
- After sign-in, focus the protected page heading. After expiry, focus the sign-in heading or notice.
- Client route guards handle display only; the server validates every protected request.

## Accessibility Floor

Use semantic form controls, persistent labels, associated errors, an announced form error, and visible focus. Do not rely on color alone. The page reflows at 320px and requires no hover.

## Responsive & Platform

The same fields and actions work on desktop and mobile. The form remains one column. No motion is required; respect reduced-motion preference.

## Key Flows

### Sign in to request a policy change

1. Amina, a synthetic demo customer, opens `/policies` with no valid session.
2. The app directs her to sign-in without rendering policy data.
3. She enters her Account ID and password.
4. **Climax:** `/policies` opens under her validated session and shows only policies linked to her account; the header offers Sign out.

Failure: invalid credentials show the generic error and create no usable session.

### Expire and sign out

1. Amina's session expires on a protected page.
2. The next API request fails and protected content disappears.
3. **Climax:** sign-in explains that the session ended; the old session cannot be reused.
4. After signing in again, she chooses Sign out and sees “You signed out.”

## Open detail

Confirm seeded account display names when local demo credentials are defined. The mockup contains no real credentials.
