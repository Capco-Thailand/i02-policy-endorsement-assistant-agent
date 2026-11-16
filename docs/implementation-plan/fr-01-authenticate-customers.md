---
title: FR-01 customer authentication
type: feature
ticket: fr-01-authenticate-customers
created: '2026-11-16'
status: draft
baseline_revision: d5ac6d9cd5037b815dbaa49c3618e8054434637c
route: full
route_source: auto
risk: high
review: thorough
review_source: auto
lenses_ran: []
review_loop_iteration: 0
context:
  - docs/tickets/fr-01-authenticate-customers.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - docs/ADR.md
  - _bmad-output/initiative-customer-authentication/ux-fr-01/DESIGN.md
  - _bmad-output/initiative-customer-authentication/ux-fr-01/EXPERIENCE.md
  - design/page/sign-in.html
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent
**Problem:** Synthetic customers need separate, expiring sessions to access only their linked policies. The current checkout has no API or web runtime.

**Approach:** Establish the minimum Fastify and Next.js workspaces. Seed two customer accounts and distinct synthetic policy links, add server-owned sessions and reusable ownership guards, then deliver sign-in and sign-out UI against documented API routes.

## Boundaries & Constraints
**Always:** Derive the actor from the validated session on every protected request. Reject absent, invalid, expired, and signed-out sessions with `401`; return the same non-disclosing response for unknown and another customer's policy. Log actor and action without secrets. Keep synthetic fixtures and non-binding behavior.

**Never:** Connect to a live insurer, mutate policy coverage, accept a client-supplied identity as authority, or build FR-11 proposal review or FR-12 history UI. The FR-11 decision endpoint must later call the ownership guard; its integration check remains open until that endpoint exists.

## I/O & Edge-Case Matrix
| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Sign-in | Seeded account credentials | Server-validated expiring session; current-session returns actor | Invalid credentials create no session |
| Protected read | Valid session and linked policy | Only linked synthetic policy is accessible | Unknown or another customer's ID share one non-disclosing response |
| Session invalidation | Sign-out or clock expiry | Old session immediately fails on direct API reuse | Protected UI clears data and routes to sign-in |
| Forged identity | Client sends customer or role claim | Server ignores claim and uses session actor | Cross-account request is rejected |
| Proposal decision | FR-11 endpoint is absent | Reusable guard accepts owner and rejects non-owner in isolated tests | Full route integration is deferred to FR-11 |

</frozen-after-approval>

## Code Map
- `package.json`, `package-lock.json` — extend root npm workspace and scripts; retain one lockfile.
- `apps/api/` — new Fastify TypeScript app, schema-defined auth routes, synthetic fixtures, session repository, ownership guards, and audit records. Use injection tests at the public HTTP boundary.
- `apps/web/` — new Next.js App Router app. Use route constants, a narrow API client, TanStack Query hooks, and focused sign-in, session gate, and sign-out components. The existing static mockup supplies visual direction.
- `docs/API_DEVELOPMENT.md`, `README.md` — document runtime, demo credentials, session lifetime, auth contract, and commands.
- `docs/tickets/fr-01-authenticate-customers.md` — preserve requirements; record any accepted scope change and sync Issue #51.

## Tasks & Acceptance
**Execution:**
- [ ] `apps/api/src/auth/*.test.ts` — write failing Fastify injection tests for sign-in, current-session, sign-out, expiry, spoofing, and ownership; prove HTTP behavior before code.
- [ ] `apps/api/src/` — implement schema-defined routes, secure cookie handling, expiring server sessions, synthetic account/policy links, audit, and reusable guards.
- [ ] `apps/web/src/**/*.test.tsx` — write failing UI tests for credential errors, sign-out, and protected-state clearing at the component/API boundary.
- [ ] `apps/web/src/` — implement App Router screens, API client, TanStack Query hooks, focused components, and typed route map. Separate form, protected gate, and policy list by their distinct state responsibilities.
- [ ] `README.md`, `docs/API_DEVELOPMENT.md`, `docs/implementation-plan/fr-01-authenticate-customers.md` — document startup, credentials, API shapes, traceability, and red/green evidence.

**Acceptance Criteria:**
- Given two seeded customers with separate policies, when each signs in, then each receives a valid session and only their own policy link.
- Given bad credentials or a missing, expired, invalid, or signed-out session, when a protected API is called, then it returns `401` without data.
- Given another customer's policy ID or forged actor claim, when a customer calls a protected policy action, then the response discloses no policy details and creates no action.
- Given sign-out or expiry, when the browser returns to protected content, then cached policy data is cleared and sign-in is shown.
- Given a proposal owner and non-owner, when the reusable guard is called, then only the owner passes; FR-11 later proves endpoint wiring.
- Given any authenticated action, when audit is recorded, then actor and action appear without credentials or session secrets.

## Implementation Notes
Use in-memory server sessions for this single-process synthetic prototype; restart invalidates them. Hash seeded demo passwords. Cookie must be HttpOnly, SameSite, and scoped to the API; document local HTTP settings and production Secure behavior. The policy list is a minimal linked-policy landing surface; FR-03 owns full list/detail access and selection. Keep request and response schemas as the source for OpenAPI and frontend types.

## Plan Change Log
- 2026-11-16: Initial draft from merged ticket, Issue #51, ADR, and UX handoff.

## Review Triage Log
Pending implementation review.

## Design Notes
The sign-in form, protected route gate, and compact policy list are separate components because they own different interaction states. Use `design/global.css` and the reviewed sign-in mockup for visual decisions; keep public sign-in free of policy details.

## Verification
**Commands:**
- `npm run test -w @pea/api` — Fastify auth, ownership, audit, and schema tests pass, with red/green evidence recorded.
- `npm run test -w @pea/web` — UI auth and protected-state tests pass, with red/green evidence recorded.
- `npm run typecheck` — both workspaces typecheck.
- `npm run format:check` — in-scope source passes Prettier.
- `npm run build` — API and Next.js build.
- `npm run ticket:preflight -- docs/tickets/fr-01-authenticate-customers.md` — active Issue and handoff remain valid.

**Manual checks:**
- Compare desktop and narrow sign-in states with the UX contracts and browser mockup; keyboard and screen-reader error behavior remain usable.
- Verify FR-11 proposal endpoint is absent and record its integration coverage as deferred, not passed.
