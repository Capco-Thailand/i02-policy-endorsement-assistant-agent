---
status: final
updated: 2026-11-16
---
# FR-02 experience contract

## Foundation
Responsive customer web app. The Next.js UI uses shadcn/ui and the paired [visual contract](DESIGN.md). Fastify owns session validation, policy ownership, status checks, input validation, and persistence. The [request mockup](../../../design/page/create-endorsement-request.html) previews states; the contracts govern if it differs.

## Information Architecture
| Surface | Entry | Outcome |
| --- | --- | --- |
| Active policy detail | FR-03 policy selection | Start one request for this policy. |
| Request entry | Active policy action | Select one change type, enter its fields and effective date, submit. |
| Recorded confirmation | Successful submission | Show request ID and pending-checks status. |
| Expired policy state | Expired policy detail | Explain why a request cannot start; omit submission. |
| Sign-in | Missing or expired session | Reauthenticate before any protected data appears. |

## Voice and Tone
Use “Request a policy change” and “Record request.” Confirmation: “Your request was recorded and is pending checks.” Expired state: “This policy has expired. You can't request a change for it.” Never call the request approved, eligible, quoted, or active coverage.

## Component Patterns
- Keep policy ID and status visible throughout entry. Show only fields for the selected type and retain previously entered values if switching types in the browser; submit only the selected type's fields.
- Beneficiary input replaces the complete list. Show each name and percentage, support adding and removing rows, and show the total as text. Submission requires at least one row and exactly 100%.
- Date accepts a calendar date in `YYYY-MM-DD` form. Frequency is one of `MONTHLY`, `QUARTERLY`, `SEMI_ANNUAL`, or `ANNUAL`; rider operation is `ADD` or `REMOVE`.
- Submit once per action. Preserve form values on validation or API errors. Use the server's field errors when provided; never rely only on browser validation.

## State Patterns
| State | Behavior |
| --- | --- |
| Initial | No change type; policy context visible; submit unavailable until required fields complete. |
| Incomplete or invalid | Show field-level text, focus the first error, retain values, record no request. |
| Submitting | Prevent duplicate submission; keep context and values visible. |
| Recorded | Replace form with request ID and pending-checks confirmation. |
| Unknown or another customer's policy | Show the same non-disclosing unavailable state. |
| Expired policy | Explain unavailability; no request action. |
| Missing or expired session | Clear protected data and route to sign-in. |
| API unavailable | Keep entries and offer retry without claiming request was recorded. |

## Interaction Primitives
Tab order follows the form. Changing type reveals a labeled fieldset and moves focus to its heading. On validation failure, focus the first invalid field. On success, focus the confirmation heading. Use {colors.focus} for keyboard focus.

## Accessibility Floor
Use semantic form, fieldsets, legends, explicit labels, status text, and `aria-describedby` for errors. Announce submission and confirmation with a live region. Do not rely on color, hover, or motion; respect reduced-motion settings.

## Key Flows
1. Narin opens his active synthetic policy, chooses beneficiary change, enters a complete replacement list totaling 100%, sets an effective date, and records a request. He sees its ID and pending-checks status.
2. Mali chooses an address change, leaves the address blank, and receives a field error. Her date and other entries remain for correction.
3. Narin opens an expired policy. He sees why change requests are unavailable and no submit action appears.
4. Mali's session expires during entry. Protected policy data clears, and she returns to sign-in. A forged requester or another customer's policy cannot create a request through the API.

## Prototype Boundary
Request capture writes only a synthetic request record. It does not change a policy, create a quote or draft, bind coverage, or record an approval.
