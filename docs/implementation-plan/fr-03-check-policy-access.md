---
title: 'FR-03 Check Policy Access'
type: feature
ticket: fr-03-check-policy-access
created: '2026-11-16'
status: draft
baseline_revision: '109736d48216a9568498ee531a387d88341fc68b'
route: full
route_source: auto
risk: high
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
context:
  - docs/tickets/fr-03-check-policy-access.md
  - _bmad-output/initiative-customer-authentication/ux-fr-03/DESIGN.md
  - _bmad-output/initiative-customer-authentication/ux-fr-03/EXPERIENCE.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent
**Problem:** FR-01 authenticates customers but exposes only minimal policy IDs and labels. Customers cannot select a policy and inspect the status and facts needed before FR-02 request capture.

**Approach:** Extend the existing session-authorized list/detail API with synthetic status and policy facts, then add a responsive list and detail UI using the reviewed FR-03 UX handoff.

## Boundaries & Constraints
**Always:** Derive identity from the session; filter list to that customer; authorize detail before returning facts; return the same `404` for unknown and unowned IDs; clear protected client data when a session ends; keep all policy data synthetic and read-only.

**Never:** Trust a client customer/role claim, expose unowned policy facts, add an endorsement action or write, or imply that browsing changes coverage.

## I/O & Edge-Case Matrix
| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Linked active policy | Authenticated customer and linked ID | List item with `ACTIVE`; detail with dates, frequency, beneficiaries | None |
| Linked expired policy | Authenticated customer and linked expired ID | `EXPIRED` list/detail, no request action | None |
| Unowned or unknown ID | Valid session, arbitrary ID or spoofed claims | Identical non-disclosing `404`; unavailable UI | No facts or writes |
| Invalid session | Missing, invalid, expired, or signed-out cookie | `401` on list and detail; return to sign-in | Clear protected cache |
| Empty or service failure | No linked records or failed API | Distinct empty or retry state | Do not invent policy data |

</frozen-after-approval>

## Code Map
- `apps/api/src/auth/data.ts` — extend existing synthetic `Policy` fixtures with status, dates, payment frequency, beneficiaries; preserve ownership key. Add an expired Narin record and distinct Mali record.
- `apps/api/src/app.ts` — extend existing TypeBox list/detail schemas and projections; retain `actorFor` and `ownsPolicy` checks, consistent `401`/`404`, and read audit.
- `apps/api/src/auth/auth.test.ts` — existing Fastify `inject` seam tests sessions and policy access; update Narin list expectation after adding fixture. Add FR-03 cases here or beside routes.
- `apps/api/src/export-openapi.ts`, `apps/web/src/lib/api-types.ts` — regenerate client contract after API schema changes; do not hand-edit generated types.
- `apps/web/src/lib/api.ts`, `queries.ts`, `routes.ts` — typed detail fetch and policy query key/route helper; distinguish detail `404` from service failure.
- `apps/web/src/policies/PolicyList.tsx`, `apps/web/src/app/policies/page.tsx`, `apps/web/src/app/policies/[policyId]/page.tsx` — list selection and detail states. Keep the existing `SessionGate` and sign-out flow. Extract only meaningful policy sections.
- `apps/web/src/app/styles.css` — responsive policy list/detail styling guided by the UX contracts and `design/page/policies.html`, `policy-detail.html`.
- `apps/web/src/policies/*.test.tsx` — component seam proves displayed status/facts and client states under mocked API results; API tests prove ownership and response contract. Browser integration remains a separate verification layer.

## Tasks & Acceptance
**Execution:**
- [ ] `apps/api/src/auth/auth.test.ts` — add focused failing FR-03 `inject` tests for active/expired list and detail, customer isolation, spoofing, `401` cases, identical `404`, and read-only behavior; run red.
- [ ] `apps/api/src/auth/data.ts`, `apps/api/src/app.ts` — add synthetic policy facts and TypeBox response schemas, preserving session/ownership guards; run API tests green and regenerate `apps/web/src/lib/api-types.ts` via the existing OpenAPI command.
- [ ] `apps/web/src/policies/PolicyList.test.tsx` and `PolicyDetail.test.tsx` — add focused failing UI state tests for links, status, facts, empty, unavailable, retry, and session-ended behavior; run red.
- [ ] `apps/web/src/lib/{api.ts,queries.ts,routes.ts}`, `apps/web/src/policies/`, `apps/web/src/app/policies/`, `apps/web/src/app/styles.css` — implement typed list/detail UI and states, then run component tests green.
- [ ] `docs/` — update behavior/API documentation affected by the implementation; record acceptance traceability and red/green evidence without changing FR-03 requirements to fit code.

**Acceptance Criteria:**
- Given Narin or Mali is signed in, when the list loads, then it shows only that customer's linked IDs, product labels, and statuses; Narin can open both active and expired records.
- Given a linked policy, when its detail opens, then status, effective/expiry dates, payment frequency, and beneficiary allocations are visible at desktop and narrow widths, with a working return link.
- Given a missing, invalid, expired, or signed-out session, when list or detail is requested, then the API returns `401` without policy data and the UI clears protected data and directs sign-in.
- Given an unknown or unowned ID, including forged customer or role claims, when detail is requested, then the API returns an identical `404` and the UI shows an unavailable state without facts.
- Given an expired policy, when viewed, then its status is explicit and no request action is offered; given any policy read, no request, quote, draft, policy update, or coverage binding occurs.
- Given the published OpenAPI contract and component/API tests, when verification runs, then response shapes and the above access/UI states are covered without manually duplicated client types.

## Implementation Notes

## Plan Change Log

## Review Triage Log

## Design Notes
The list item is one navigable record with a visible status word. The detail screen uses a facts section and beneficiary section because they serve distinct reading tasks. Reuse the existing session gate and query provider; avoid wrappers for single elements.

## Verification
**Commands:**
- `npm run test -w apps/api` — API red/green slices, then full policy access regression.
- `npm run test -w apps/web` — UI red/green slices and existing auth regression.
- `npm run typecheck` — API and web types align.
- `npm run format:check` — scoped source formatting passes.
- `npm test` — repository test suite passes.
- `npm run build` — Next.js production build succeeds.
- `npm run ticket:preflight -- docs/tickets/fr-03-check-policy-access.md` — Issue and handoff remain valid before PR.

**Manual checks (if no CLI):**
- Inspect list/detail at desktop and 320px against the UX spines and mockups; verify keyboard links, focus, status text, and synthetic boundary. Record browser availability and any unverified visual state.
