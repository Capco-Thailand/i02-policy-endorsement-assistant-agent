---
status: final
updated: 2026-11-16
---
# FR-03 experience contract

## Foundation
Responsive customer web app. Next.js follows shadcn/ui and the paired [visual contract](DESIGN.md). Fastify derives customer identity from the session and authorizes every policy read. [List](../../../design/page/policies.html) and [detail](../../../design/page/policy-detail.html) mockups preview the surfaces; contracts govern if they differ.

## Information Architecture
| Surface | Entry | Outcome |
| --- | --- | --- |
| Policy list | Successful sign-in or return | Find only linked policies and select one. |
| Policy detail | Selected policy or direct URL | Read status, dates, payment frequency, and beneficiaries. |
| Unavailable detail | Unknown or unowned ID | See the same non-disclosing message and return link. |
| Sign-in | Missing or ended session | Reauthenticate before protected data appears. |

## Voice and Tone
Use “Your policies”, “View policy”, and “Back to policies”. Write status as “Active” or “Expired”. Empty: “No policies are linked to this account.” Unavailable: “This policy is unavailable.” Failure: “We couldn't load your policies. Try again.” Say “Synthetic policy data for this prototype”.

## Component Patterns
- Each list item shows product, ID, and status without hover. Detail URLs contain an ID, but identity and ownership come only from the server session.
- Detail shows effective and expiry dates, payment frequency, and each beneficiary allocation. If none exist, say so.
- Keep the return link on expired and unavailable pages. FR-02 adds request entry only for active policies.

## State Patterns
| State | Behavior |
| --- | --- |
| Loading | Name content being loaded; no stale policy facts. |
| Empty list | Show the empty message and no invented records. |
| Loaded | Show only linked policies and server-provided status. |
| Unknown or unowned detail | Same unavailable text and return path; no facts. |
| API failure | Offer retry without claiming an empty list. |
| Session ended | Clear protected content and route to sign-in. |

## Interaction Primitives
Policy links and back navigation work with keyboard and pointer. Focus route heading after navigation. Retry makes a fresh read. Use {colors.focus}; clear data on sign-out.

## Accessibility Floor
One page heading, semantic links, definition lists for facts, beneficiary list. Status and errors have words, not color alone. Announce loading and errors. Respect reduced-motion preferences.

## Key Flows
1. Narin signs in, sees only his synthetic policies, selects an active policy, reads its facts and returns.
2. Narin opens an expired linked policy and sees its status and facts, without a request action.
3. Mali opens Narin's URL and sees the same unavailable message as an unknown ID, without facts.
4. Mali's session ends during detail loading; protected data clears and she returns to sign-in.

## Prototype Boundary
Browsing synthetic records creates no request, policy change, or coverage binding.
