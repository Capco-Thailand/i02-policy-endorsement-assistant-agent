---
name: Policy Endorsement Assistant
status: final
updated: 2026-11-23
---

# FR-08 eligibility — behavior contract

## Foundation
Responsive customer web flow using the existing Next.js and shadcn UI conventions. [DESIGN.md](DESIGN.md) owns visual decisions. The API owns the assessment; the browser displays its typed outcome, reasons, and citations.

## Information Architecture
The recorded-request view shows request summary followed by the latest assessment result and citations. The customer can run or retry the check on an authorized, active request. FR-05 supplies rule evidence and FR-04 supplies policy wording. FR-07 upload is outside this flow.

## Voice and Tone
Use specific explanations such as “The cited rule does not allow this payment frequency” or “The policy wording and rule could not be reconciled.” Do not say “approved,” “verified document,” or “coverage updated.”

## Component Patterns
The check action remains disabled during a check to prevent duplicate requests. A result contains a status heading, customer-readable reason, relevant policy and rule citations, and a next step. Show only citations the API marks applicable. Do not calculate or override the API result in the client.

## State Patterns
- Before check: explain that the customer can check whether the recorded request can proceed.
- Loading: “Checking this request…”; retain request context.
- `CAN_PROCEED`: show “Can proceed to a proposal,” both policy wording and rule citations, and that no policy has changed. FR-09 calculation and FR-10 proposal creation are later steps.
- `CANNOT_PROCEED`: explain the unmet policy or rule condition and a useful next step, with supporting citations.
- `NEEDS_REVIEW`: name missing, stale, conflicting, unavailable, or unresolved evidence; explain what remains unresolved and include relevant citations when available. Do not suggest a reviewer has been assigned.
- Service failure: say “Could not complete the check,” offer retry, and do not present a prior result as current.
- Session expiry: return to sign-in. Unknown or unowned policy/request: show a non-disclosing unavailable message.
- Rider addition: if sources mention real underwriting or health disclosure, explain that this may be needed outside the prototype. Do not collect medical evidence.

## Interaction Primitives
Keep the action keyboard reachable. Announce new results in a polite live region and use an alert for service failure. Preserve the customer's place on the recorded-request page after a check.

## Accessibility Floor
Use semantic headings, a real button, visible focus styles, and text labels for every status. Reasons are a list. Citation text wraps on narrow screens. Status meaning never relies on color. Respect reduced-motion preference.

## Key Flows
1. Narin submits an address request on an active synthetic policy and selects “Check this request.” The API returns `CAN_PROCEED` with policy wording and endorsement rule citations. The result says a proposal can be prepared, while making clear the policy is unchanged.
2. Mali checks a payment-frequency request. The result is `CANNOT_PROCEED` and identifies the rule condition with its citation. She can return to the request and edit it.
3. Narin checks a rider addition. The result is `NEEDS_REVIEW` because sources require unresolved real-world underwriting. It explains what remains unresolved without collecting health information or implying that a reviewer was assigned.

The [mockup](../../../design/page/check-endorsement-eligibility.html) demonstrates assessment states. The [ticket](../../../docs/tickets/fr-08-check-endorsement-eligibility.md) owns requirements.
