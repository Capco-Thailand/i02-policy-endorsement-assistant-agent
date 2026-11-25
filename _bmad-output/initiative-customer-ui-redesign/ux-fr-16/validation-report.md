# FR-16 UX validation — 2026-11-25

The customer accepted the [sign-in](../../../design/page/fr-16-sign-in.html) and [policy-list](../../../design/page/fr-16-policy-list.html) reference layouts on 2026-11-25. Both use the existing authorized list fields: label, ID, and status.

## Browser review

- Headless Chromium rendered both mockups at 1280px and 320px. `document.documentElement.scrollWidth` equaled the viewport width in all four renders.
- At 320px, sign-in initial, invalid credentials, ended session, and service error states each retained a heading and had no horizontal overflow.
- At 320px, policy-list initial, loading, empty, service error, and ended-session states each retained a heading and had no horizontal overflow.
- Submitting the empty sign-in form focused the Account ID field and exposed field-specific errors.
- Captures: [sign-in 1280](mockups/sign-in-1280.png), [sign-in 320](mockups/sign-in-320.png), [list 1280](mockups/policy-list-1280.png), [list 320](mockups/policy-list-320.png).

These are static mockup checks. Runtime screen reader behavior, owner isolation, API state handling, and application visual baselines remain implementation checks under the ticket.
