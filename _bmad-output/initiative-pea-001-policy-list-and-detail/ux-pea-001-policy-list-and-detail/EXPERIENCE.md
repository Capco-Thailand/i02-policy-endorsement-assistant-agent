---
name: Policy Endorsement Assistant
status: final
sources:
  - ../../../docs/tickets/PEA-001-policy-list-and-detail.md
updated: 2026-11-09
---

# PEA-001 Experience

## Foundation

Responsive web for desktop and mobile equally. React, TanStack, and shadcn/ui are the repo's UI stack. [DESIGN.md](DESIGN.md) owns the visual treatment; this document owns behavior. The mock policyholder context and all displayed records are synthetic. A policy detail or intake route does not create, approve, or bind an endorsement.

## Information Architecture

| Surface | Route | Reached from | Purpose |
|---|---|---|---|
| My Policies | `/policies` | App entry/navigation | List only policies the current mock user may view. |
| Policy detail | `/policies/:policyId` | Policy card/link or direct URL | Read policy facts, beneficiaries, and endorsement eligibility. |
| Endorsement intake | `/policies/:policyId/endorsements/new` | Eligible detail action | Start a separate intake flow; its content is outside PEA-001. |

Back navigation from detail returns to My Policies. A direct detail URL must run the same authorization check as navigation from the list. The [list mockup](../../../design/page/policies.html), [active detail](../../../design/page/policy-detail.html), [expired detail](../../../design/page/policy-detail-expired.html), and [unavailable page](../../../design/page/policy-unavailable.html) illustrate the PEA-001 surfaces. The [intake boundary](../../../design/page/endorsement-intake-boundary.html) shows where the active action leads; its content belongs to a later ticket. These spines win if a mock differs.

## Voice and Tone

Use plain, factual labels: “My Policies,” “Policy details,” “Beneficiaries,” and “Request Endorsement.” For an expired policy: “This policy has expired. Endorsement requests are unavailable.” For no policies: “No policies are available for this account.” Avoid copy implying that opening intake changes coverage or submits a request.

## Component Patterns

| Component | Behavior |
|---|---|
| Policy card | Opens its own detail route. Show policy number, product, stored status, and effective/expiry dates. Preserve a visible keyboard focus state. |
| Status badge | Displays the backend status verbatim as ACTIVE or EXPIRED. Never derive it from expiry date. |
| Policy fact group | Shows all ticket-required policy fields on detail, with a legible absent expiry value such as “Not provided.” |
| Beneficiary list | Shows current beneficiaries with full name, relationship, and allocation percentage. An empty array gets a clear empty message. |
| Action button | On ACTIVE detail, Request Endorsement navigates to the policy's intake route. On EXPIRED detail, it remains disabled with explanatory text. Server eligibility remains authoritative. |
| Feedback panel | Shows list/detail load errors, invalid responses, or access failures without fabricated or leaked policy data. Offer Retry where retry can help and Back to My Policies on detail failures. |

## State Patterns

| State | My Policies | Policy detail |
|---|---|---|
| Loading | Heading and skeleton cards; no synthetic placeholders presented as real data. | Heading and skeleton fact groups; action unavailable. |
| Loaded | Only authorized policy cards. | All required fields and current beneficiaries. |
| Empty | “No policies are available for this account.” | “No beneficiaries are listed for this policy.” within the beneficiary section. |
| ACTIVE | Text status; card opens detail. | Request Endorsement enabled if backend allows it. |
| EXPIRED | Text status; card still opens detail. | Action disabled with reason. |
| API/invalid data error | Feedback panel with Retry; no fabricated records. | Feedback panel with Retry and Back; no partial sensitive data from an invalid response. |
| Unauthorized or unknown policy | No unauthorized card in list. | Generic unavailable page; no policy or beneficiary fields. |
| Eligibility changes after load | No initiation from list. | Backend refusal is shown as a recoverable message; refresh policy status and disable action when now ineligible. |

A direct URL to endorsement intake must check authorization and stored status before showing intake. For an unauthorized, unknown, or expired policy, show a generic unavailable state with a path back to My Policies; do not create a draft.

## Interaction Primitives

- A card/link is operable by mouse, touch, Enter, and keyboard navigation.
- Back to My Policies is available on detail and error states.
- Request Endorsement is a single, explicit action on detail. Navigation alone has no draft side effect.
- Retry reloads the relevant backend resource; it does not reuse stale policy data after an access or validation failure.
- After a successful route transition, update the document title and focus the new `h1` programmatically (`tabindex="-1"`). An inline Retry keeps focus on the Retry control until the result appears.

## Accessibility Floor

- Semantic page headings, links, buttons, and definition lists preserve a clear reading order.
- Focus remains visible on every interactive element. Route changes focus the new page heading.
- Badge text and the expired explanation communicate status without relying on color.
- Disabled action remains accompanied by readable reason text connected with `aria-describedby`. Asynchronous errors use `role="alert"`; Retry is keyboard accessible.
- Content reflows at mobile widths without horizontal scrolling or clipped monetary values.

## Responsive & Platform

The same information and actions appear on desktop and mobile. Policy cards may use a grid at wider widths and one column on phones. Detail facts can form paired columns on desktop and stack on mobile. The beneficiaries list remains a simple vertical list at all widths. Touch targets and focus targets use the app's shadcn defaults with adequate size and spacing.

## Key Flows

### AC-1 and AC-2: Find and inspect a policy

1. Arun, a synthetic demo policyholder, opens My Policies on a phone.
2. The page resolves to the policies his mock account may view; each card identifies a number, product, status, and dates.
3. Arun selects one policy and lands on its detail route.
4. He reads the policy facts and current beneficiary allocations.
5. **Climax:** the policy number and beneficiary information confirm that this is the policy he intended to use.

Failure: an API error shows a recoverable panel. An unauthorized or unknown ID shows a generic unavailable state without policy details.

### AC-3, AC-4, and AC-6: Decide whether to request an endorsement

1. Arun views an ACTIVE policy on a desktop browser.
2. The detail screen shows the backend status and an enabled Request Endorsement button.
3. He chooses the action and reaches the policy-specific intake route.
4. **Climax:** the intake route carries the selected policy ID while no endorsement draft has been created by navigation.

Failure: on an EXPIRED policy the button is disabled with a reason. If status changes after display, backend refusal is shown and the detail state refreshes. Eligibility follows stored status even when dates appear inconsistent.

### AC-4: Review an expired policy

1. Arun opens an EXPIRED policy from My Policies.
2. The detail heading, facts, and beneficiaries all belong to that expired policy.
3. He reaches the visible but disabled Request Endorsement control and reads its explanation.
4. **Climax:** Arun understands why he cannot proceed and returns to My Policies without starting an intake or draft.

### AC-5 and AC-7: Handle unavailable policy data

1. Mali, another synthetic demo user, opens a direct URL for Arun's policy.
2. The server rejects access and the page shows a generic unavailable state.
3. **Climax:** no policy or beneficiary data appears, and Mali can return to her own list.

Failure: malformed API data uses the same safe feedback pattern and offers Retry where useful.

## Open questions

- Confirm currency and locale for displaying sum assured and annual premium. Until resolved, mockups use labeled sample amounts without a currency symbol.
- Confirm the mock auth mechanism and whether backend eligibility is exposed as a response field or determined from the returned stored status. The UX behavior is the same; backend authority is required.
