---
name: Policy Endorsement Assistant
status: final
updated: 2026-11-13
source: docs/tickets/fr-01-authenticate-customers.md
---

# FR-01 customer sign-in experience

## Foundation
Responsive browser experience for synthetic customer accounts. Next.js App Router and shadcn/ui are the implementation system; [DESIGN.md](DESIGN.md) supplies the visual tokens. The [sign-in mockup](../../../design/page/sign-in.html) previews initial, invalid-credentials, expiry, pending, and service-failure states. The [signed-in preview](../../../design/page/session.html) shows sign-out placement. These two documents govern if either preview differs.

## Information Architecture
| Surface | Reached from | Purpose |
| --- | --- | --- |
| Sign-in | Unauthenticated app entry or protected-route redirect | Establish a customer session and explain failures |
| Signed-in shell | Successful sign-in or already valid session | Keep a visible Sign out control; FR-03 designs policy content |

FR-01 does not add policy, proposal, or history screens. The sign-in screen has no account switching or recovery path. The signed-in shell places Sign out at the end of the persistent header.

## Voice and Tone
Use short, direct, customer-facing copy. Say “Sign in to view your policies” and “These accounts and policies are for demonstration only.” For invalid credentials say “We couldn't sign you in. Check your details and try again.” Do not reveal whether an account exists. For expiry say “Your session ended. Sign in again to continue.” Avoid claims that a policy was updated or coverage issued.

## Component Patterns
| Component | Behavior |
| --- | --- |
| Form panel | Contains one email field, one password field, one submit button, and any form-level status message |
| Email field | Labeled, required, email keyboard on mobile, value retained after a failed attempt |
| Password field | Labeled, required, masked, value cleared after a failed attempt |
| Sign-in button | Disabled only while a request is pending; text changes to “Signing in…” |
| Sign-out control | Visible in the signed-in header; invalidates the session before returning to sign-in |
| Status message | Appears before fields, receives keyboard focus for failed submissions or session expiry, never includes credentials or account existence |
| Demo boundary note | Visible without scrolling on common desktop sizes and above the form on mobile |

## State Patterns
| State | Treatment |
| --- | --- |
| Initial, no session | Show sign-in form with no error |
| Valid existing session | Redirect to the signed-in shell without flashing another customer's data |
| Signed-in shell | Display the Sign out control while the session is valid; FR-03 owns policy content |
| Missing required field | Native field validity; focus first invalid field, no API call |
| Invalid credentials | Generic message; retain email, clear password, focus message |
| Request pending | Keep form visible; button reads “Signing in…” and prevents duplicate submit |
| Network or service failure | “Sign-in is unavailable. Try again.” Keep email, clear password |
| Expired session | Clear protected client data before redirect; show “Your session ended. Sign in again to continue.” |
| Signed out | Clear protected client data before redirect; show form without a success toast |

## Interaction Primitives
Submit with Enter or the primary button. Tab order follows product note, email, password, then button. The browser sends credentials only to the API; it never stores the password in local storage. The API owns session validity and customer identity. A protected API `401` triggers the expired-session path once, avoiding repeated redirects.

## Accessibility Floor
All fields have visible labels. Native required-field errors focus the first invalid field; generic credential and service errors use the form-level alert. Focus is visible using {colors.focus}. The form and message work with keyboard and screen reader; errors use `role="alert"` or equivalent and are not identified by color alone. Targets are at least 44px tall. At 320px width, content stacks without horizontal scrolling. Reduced motion removes nonessential transitions. Contrast and visual sizes follow [DESIGN.md](DESIGN.md).

## Responsive & Platform
At 900px and wider, context and form sit side by side. Below that, they stack with context first. No modal or hover-only action is needed. The same form is usable on desktop and phone.

## Key Flows
### Flow 1 — Customer signs in (AC1–AC3)
1. Mira opens the prototype on a laptop and reads that it uses demonstration accounts and policies.
2. She enters her local demo email and password and submits.
3. The button shows “Signing in…” while the API validates the credentials.
4. **Climax:** Her valid session takes her to the authenticated entry. Later policy screens show only policies linked to her account.
5. If her details are wrong, the generic message appears, the password clears, and she can retry without retyping the email.

### Flow 2 — Session ends (AC2–AC3)
1. Mira returns to a protected screen after the session has expired.
2. The API rejects the request. The browser clears cached protected data and directs her to sign-in.
3. **Climax:** She sees “Your session ended. Sign in again to continue.” No prior policy detail remains visible.
4. She signs in again with her own demo account.

### Flow 3 — Customer signs out (AC3)
1. Mira is in the signed-in shell on a shared laptop.
2. She chooses Sign out from the persistent header.
3. The API invalidates her session and the browser clears protected data.
4. **Climax:** The sign-in form appears with no policy information or success toast; reusing the old session fails.
5. If sign-out fails, keep her on the signed-in shell and show an actionable error rather than claiming she is signed out.
