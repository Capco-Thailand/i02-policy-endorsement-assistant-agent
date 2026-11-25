---
name: FR-18 decision history experience
status: final
updated: 2026-11-25
sources:
  - docs/tickets/fr-18-redesign-decision-history.md
---

# FR-18 experience contract

## Foundation

Responsive web for synthetic demo customers. FR-12 owns the owner-scoped history API and approved-only records; FR-11 owns final proposal decisions. [DESIGN.md](DESIGN.md) owns the visual tokens. The customer chose approved-only history and accepted the reference layout on 2026-11-25.

## Information Architecture

| Surface | Customer answer | Next action |
| --- | --- | --- |
| History overview | What did I approve, for which policy and request, and when? | Open the exact recorded proposal or return to policies. |
| Recorded proposal | What was proposed and what decision was recorded? | Inspect the authorized proposal snapshot and its citations. |

The [history mockup](../../../design/page/fr-18-history.html) includes desktop, 320px, multiple, empty, loading, service-error, and session-ended previews. The spines win on conflict.

## Voice and Tone

Lead with “Customer change history” and explain beside the heading: “Approval records your decision on a synthetic proposal. Your policy and coverage did not change.” Use “Approved” as a text label. Say “No approved decisions yet” for empty history, with a path back to policies. Do not call a record an issued endorsement or describe rejected proposals as history entries.

## Component Patterns

| Part | Behavior |
| --- | --- |
| History entry | Reads the server-returned policy label/ID, request ID/change type, decision time, approved status, and proposal ID. Shows a concise summary derived from the change type and, where safe, a requested frequency or rider action. |
| Proposal link | Uses the entry's policy and proposal IDs to open the existing owner-checked detail. The accessible name distinguishes entries. |
| Boundary notice | Appears beside the heading before the list; repeats no policy/coverage change without suggesting the history is issued coverage. |
| State panel | Empty links to policies; service failure offers retry; ended session routes to sign-in without stale records. |

## State Patterns

| State | Visible outcome |
| --- | --- |
| Loading | Names that history is loading; no stale records. |
| Empty | “No approved decisions yet,” with a policies link. |
| One or multiple approved records | Newest first from the server, each with identity, request, date, status, and link. |
| Service error | “History unavailable,” with retry and no empty-history claim. |
| Session ended | Sign-in explanation; no protected record remains. |
| Rejected proposal | Not in history; its decision remains in its authorized proposal detail. |

## Interaction Primitives

Keep DOM and tab order aligned with heading, boundary, list count, each entry's summary, metadata, and link. Use the existing `useHistory` hook and owner-checked proposal route. No browser-side history filtering or policy mutation. A concise overview never reproduces the full requested address or beneficiary list.

## Accessibility Floor

Use semantic headings, an ordered list, text status, `<time dateTime>`, visible link focus, and status/alert regions for async states. At 320px, wrap identifiers and stack metadata without horizontal scroll. Keyboard users can reach every proposal link, retry action, and navigation link.

## Responsive & Platform

The content remains one column at desktop and mobile. A row can align status/date beside the summary at wider widths; at 320px it stacks without hiding identifiers, the non-binding notice, or proposal access.

## Key Flows

### Narin finds an approved request

1. Narin opens Customer change history from his policy navigation.
2. He scans the newest approved record's policy, concise change, request ID, and decision date.
3. **Climax:** The nearby notice makes clear his approval was recorded but coverage did not change.
4. He opens that record's exact proposal to review its original values and citations.

### Narin has no approved decisions

1. Narin opens history before approving any proposal.
2. He sees an explicit empty state, not a service failure or a rejected-record list.
3. **Climax:** He understands there is nothing to review yet and follows “View your policies.”

## Inspiration & Anti-patterns

Use FR-15's restrained status treatment and FR-17's bounded reading width. Avoid full personal details in rows, color-only state, celebratory approval styling, or a chart for discrete decisions.
