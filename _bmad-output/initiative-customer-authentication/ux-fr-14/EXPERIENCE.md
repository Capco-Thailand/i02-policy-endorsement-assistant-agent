---
status: final
updated: 2026-11-23
---

# FR-14 expanded policy detail — experience contract

## Foundation
Responsive customer web app using the existing Next.js and shadcn/ui system. The paired [visual contract](DESIGN.md) owns appearance. The [expanded policy detail mockup](../../../design/page/policy-detail-coverage.html) previews the accepted synthetic terms and states defined in the [FR-14 backlog](../../../docs/backlog/fr-14-expand-policy-detail-with-coverage.md#accepted-synthetic-product-terms).

## Information Architecture
| Surface | Entry | Outcome |
| --- | --- | --- |
| Expanded policy detail | Owned policy link or direct URL | Read product identity, cited coverage and exclusions, current facts, beneficiaries, and request availability. |
| Unavailable detail | Unknown or unowned ID | Read one non-disclosing message; no policy or source content. |
| Sign-in | Missing or ended session | Authenticate before protected content appears. |

## Voice and Tone
Use “Coverage listed in this synthetic policy”, “Key exclusions and limitations”, and “Source: [title], version [version], section [section]”. Say “We can't confirm this coverage detail from the available policy wording” for unresolved evidence. Never infer a missing amount or term. Avoid wording that suggests the page issues, binds, or updates coverage.

## Component Patterns
- The page retains policy ID, status, dates, payment frequency, beneficiaries, synthetic disclosure, and the active-policy request path.
- Insurer, policy type, product name, and plan or product version appear together. Each is sourced from the owned policy's versioned synthetic wording.
- Each coverage item presents name, amount, currency, and source. Each exclusion or limitation has its own source. Citation text is available without opening another control.
- Show only server-authorized policy data. Source passages and structured terms must describe the same `v1` version and exact section IDs in the FR-14 backlog. An expired policy's amount is historical information, not current coverage.

## State Patterns
| State | Behavior |
| --- | --- |
| Loading | Name the record being loaded without displaying stale protected facts. |
| Loaded active | Show all sourced details and the existing request action. |
| Loaded expired | Show details and expired status; explain that a request cannot start. |
| Unresolved evidence | Show the affected field as unresolved, explain missing, stale, or conflicting evidence, and show relevant citation when available. Keep unrelated confirmed fields. |
| Service unavailable | Distinguish retrieval failure from absent policy; offer retry. |
| Unknown or unowned | Same non-disclosing `404` message with no details or citations. |
| Session ended | Clear protected content and send the customer to sign-in. |

## Interaction Primitives
Back navigation, source links when available, retry, and request entry are keyboard reachable. Focus the main heading after navigation. Preserve {colors.focus} for focus indication. An expired policy has no active request link.

## Accessibility Floor
Use one `h1`, ordered section headings, definition lists for single facts, and lists for coverage and exclusions. Include status words and unresolved explanations, not color alone. Announce loading and failures with a live region. Ensure 320px reading width without horizontal scroll, and do not truncate citations.

## Key Flows
1. Narin opens his active synthetic policy, identifies its insurer and plan version, reads each amount with currency and source, checks key exclusions, then can enter the existing request flow. Viewing creates no change.
2. Narin opens his expired policy and reads the same categories; the page explains why he cannot start a request.
3. Mali opens Narin's policy URL and sees the same unavailable message as for an unknown ID, with no policy or source facts.
4. Narin sees a conflicting coverage source. The affected amount reads “Unresolved” with an explanation and relevant source; confirmed fields remain readable. He is not shown a guessed value.
5. Mali's session ends while the page loads; protected content clears and sign-in is required.

## Product Boundary
All data is synthetic; reading this page creates no request, quote, proposal, policy update, or coverage binding. The accepted terms and sections are listed in the FR-14 backlog; implementation must add matching versioned source fixtures before displaying them as sourced facts.
