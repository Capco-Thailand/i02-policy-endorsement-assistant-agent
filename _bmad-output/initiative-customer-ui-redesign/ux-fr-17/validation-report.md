# FR-17 UX validation — 2026-11-25

## Scope

Reviewed the request and eligibility HTML against the FR-17 ticket criteria, the accepted FR-15/16 semantic theme, `docs/DESIGN_STANDARD.md`, and `docs/VISUAL_UX_CONSTRAINTS.md`. The customer accepted these layouts on 2026-11-25. This is reference validation, not application E2E evidence.

## Browser checks

- Chromium rendered the payment-frequency request and needs-review eligibility previews at 1280px and 320px; captures are in `design/page/fr-17-*.png` and linked from `DESIGN.md`.
- `document.documentElement.scrollWidth <= innerWidth` passed for those four captures.
- At 320px, Chromium also opened all four request types, invalid/expired/service-error states, and all five eligibility preview states without horizontal overflow; the address-unavailable and rider-state-unavailable labels were visible.
- In the beneficiary preview, adding a row and entering 10% changed the text state to “Over 100%”; removing that row restored “Exactly 100%”.
- The mockups have explicit labels, a text-only synthetic boundary, visible focus rules, and text outcome headings.
- Request preview offers four change types and invalid, expired, and service-error examples; eligibility preview offers unchecked, can-proceed, cannot-proceed, needs-review, and service-error examples.

## Source and behavior review

- Current beneficiaries and payment frequency come from the owner-authorized policy detail response. The current correspondence address is absent and must be labeled unavailable. A confirmed cited accidental-death coverage term may be shown, but it does not prove a rider on/off state.
- Mockup values and source IDs are synthetic examples. Implementation must render authorized API values, server-provided eligibility reasons/next steps/citations, and server-returned request ID.
- The request ID and pending-check message are separate from eligibility. No proposal action appears for cannot-proceed or needs-review outcomes.

## Remaining gate

Application keyboard, screen-reader, API authorization, and browser behavior checks belong to implementation.
