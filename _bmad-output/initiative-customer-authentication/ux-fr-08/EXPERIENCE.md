---
status: final
updated: 2026-11-20
---

# FR-08 eligibility — behavior contract

## Foundation
Responsive customer web flow using the existing Next.js and shadcn UI conventions. [DESIGN.md](DESIGN.md) owns visual tokens. The API owns the decision; the browser displays its typed outcome and reasons.

## Information Architecture
The recorded-request view places request summary, FR-05 guidance, FR-07 mock upload, and then an eligibility section in that order. The section shows the latest completed check and its citations. A customer can rerun the check after uploading or correcting a request through the supported request flow.

## Voice and Tone
Use plain, specific explanations: “Upload a synthetic file for this request,” “Payment frequency is not allowed by the cited rule,” or “Rules need human review.” Do not use “approved,” “verified document,” or “coverage updated.”

## Component Patterns
The check action is available on a recorded request. It remains disabled during a check to prevent duplicate clicks. A result has a heading, reason list, optional citation, and a next step. Cite only evidence the API marks applicable. Do not calculate or override the API result in the client.

## State Patterns
- Before check: explain that the customer can check whether the recorded request can proceed.
- Loading: “Checking this request…” in the result region; retain request context.
- `ELIGIBLE`: show “Eligible to continue to a mock quote,” the cited rule, and that no policy has changed. The later quote action is owned by FR-09.
- `INELIGIBLE`: name each failed input, policy, rule, or missing-upload condition and provide the relevant action. A mock receipt never says the file was suitable.
- `REFERRED`: explain unavailable, conflicting, unknown, or underwriting evidence and that automatic quote and proposal creation are paused. For rider addition, state that real underwriting or health disclosure may be needed outside this prototype; never ask for medical evidence here.
- Service failure: show “Could not complete the check” and a retry action, without a prior successful result appearing current.
- Session expiry: return to sign-in. Unknown or unowned policy/request: show the same unavailable message. Never reveal another customer's data.

## Interaction Primitives
Keep the action keyboard reachable. Announce a new result in a polite live region, and use an alert for service failure. Preserve the customer's place in the recorded-request page after a check.

## Accessibility Floor
Use semantic headings, a real button, visible focus styles, and text labels for every status. Reasons are a list. Citation text wraps on narrow screens. Status meaning cannot rely on color. Reduced-motion preference is respected by the shared styles.

## Key Flows
1. Narin records a synthetic address change on an owned active policy, uploads a synthetic file, and selects “Check eligibility.” The result cites the address rule and says the request can proceed to a mock quote. This is the climax; no quote or policy change occurs yet.
2. Mali checks a payment-frequency request with no upload. The result names the missing mock receipt and links back to upload. After uploading, she reruns the check; only the fresh server result may proceed.
3. Narin checks a rider addition. The result says the request needs human review and explains the real-world underwriting caveat without collecting health details.

The [mockup](../../../design/page/check-endorsement-eligibility.html) demonstrates result states. The [ticket](../../../docs/tickets/fr-08-check-endorsement-eligibility.md) owns requirements if a mock differs.
