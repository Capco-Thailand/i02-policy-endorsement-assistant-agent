---
title: FR-01 Customer authentication
type: feature
ticket: fr-01-authenticate-staff
created: '2026-11-12'
status: built
baseline_revision: a8a033f16e3a558a023d24d97402306e8061e579
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 1
context:
  - docs/tickets/fr-01-authenticate-staff.md
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-01-authenticate-staff/DESIGN.md
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-01-authenticate-staff/EXPERIENCE.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** This commit has no runnable API or web app. Customers cannot sign in or access only their linked policies.

**Approach:** Establish Fastify and Next.js foundations for demo credentials, expiring server sessions, ownership-checked policy reads, a proposal-decision guard, and sign-in/out UI.

## Boundaries & Constraints

**Always:** Use synthetic data; derive the actor from each validated session; return `401` for invalid sessions and identical `404` for unknown/unowned policies. Keep secrets out of logs, URLs, and browser storage. Follow UX contracts.

**Never:** Connect to live insurers, bind coverage, add production identity, or build later endorsement/review/history workflows. Client state never grants access.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Sign in | Valid or invalid credentials | Valid account gets expiring session; invalid input gets none | Generic error |
| Session | Missing, forged, expired, or revoked cookie | Protected API returns `401`; web shows sign-in | No data leak |
| Policy | Owned, unowned, unknown ID | Owned record available; others identical `404` | No detail leak |
| Decision guard | Own or other proposal; forged claims | Server actor can decide only on own proposal | No side effects |
| Redirect | Internal or external URL | Internal destination or `/policies` | No off-site redirect |

</frozen-after-approval>

## Code Map

- `package.json`, `package-lock.json` — workspace scripts exist; app packages and Prettier are absent.
- `apps/api/`, `apps/web/` — no tracked source; preserve untracked build output and `next-env.d.ts`.
- `docs/API_DEVELOPMENT.md` — obsolete token fixture; replace with session contracts.
- `docs/ADR.md`, `docs/PRD.md` — Fastify owns authorization; no live writes.
- `design/page/sign-in.html`, `design/global.css` — visual references. The stateful form is a feature component; shared account controls serve protected pages. Omit preview controls and trivial wrappers.
- `d7407b54dbc49df489ae3f5b3b6d19032f9430b5` — later customer-auth reference; browser flow and FR-11 integration unproven. Its seeded-proposal guard is insufficient for FR-11. `bdb4433` reverted staff auth.

## Tasks & Acceptance

**Execution:**
- [ ] Root config and `apps/{api,web}/package.json` — install workspaces and Prettier with format scripts before app code.
- [ ] `apps/api/src/auth/*.test.ts`, then `apps/api/src/auth/*` — red/green Fastify `inject` tests for credentials, expiry/revocation, actor, audit. Use clock injection, opaque HttpOnly cookies, and hashed passwords.
- [ ] `apps/api/src/policies/*.test.ts`, then `apps/api/src/policies/*` — red/green HTTP tests for own list/detail, forged claims, identical `404`, and an owner-only proposal guard that receives a server-loaded proposal record. Test own, other, and missing records; do not bind the guard to seeded IDs or trust client-supplied owner/policy claims.
- [ ] `apps/api/src/app.ts`, `apps/api/src/server.ts`, route schemas — expose health/auth/policy routes and schema-derived OpenAPI; authorize before reads/writes.
- [ ] `apps/web/src/app/sign-in/*.test.tsx`, then `apps/web/src/app/sign-in/*` — red/green form tests for labels, submit, busy/error/focus, notice, redirects.
- [ ] `apps/web/src/app/policies/*`, `apps/web/src/components/*`, `apps/web/src/lib/api.ts` — test first, then render validated policy data and header; clear client state on sign-out. Use TanStack Query and contract-derived types.
- [ ] `README.md`, `docs/API_DEVELOPMENT.md`, `docs/verification/fr-01.md` — document credentials, config, lifetime, contracts, AC evidence, and deferred integrations.

**Acceptance Criteria:**
- Given two seeded customers with distinct linked policies, when either signs in, then the customer can see only their own policies and can sign out.
- Given invalid credentials or a missing, forged, expired, or revoked session, when a protected API route is called, then it returns `401` without protected data.
- Given an unowned or unknown policy ID, when it is requested, then the same non-disclosing `404` is returned.
- Given client-supplied identity claims or another customer's proposal, when authorization runs, then only the server-session actor and proposal owner determine access.
- Given expiry or sign-out in the browser, when protected content is requested, then it disappears and the appropriate sign-in notice appears.

## Implementation Notes

## Plan Change Log

- Review 1 found that the proposed decision guard was tied to immutable seeded proposal IDs. The policies task now requires a guard over a proposal record loaded by the server so future FR-11 proposals can be authorized. This avoids rejecting every newly created proposal. KEEP the working sign-in/session/policy tests, schema-derived API contract, browser-verified sign-out flow, and explicit POST form method during re-derivation.

## Review Triage Log

| Verdict | Route | Evidence |
|---|---|---|
| medium | patch (moot on loopback) | Default CORS allows `127.0.0.1:3001`, but the browser API defaults to `localhost:3000` and its SameSite cookie cannot be sent from the alternate site. Remove the misleading alternate origin or make the browser API host match it. |
| medium | bad_plan | `canDecideProposal` reads only two fixed proposal records in `apps/api/src/policies/service.ts`; FR-11-created proposals can never pass. The non-frozen plan task omitted a server-loaded record contract, so the task now specifies it. |
| medium | patch | `apps/api/src/app.ts` disables Fastify request logging, contrary to the coding standard; the audit array does not record requests or errors. Enable redacted Fastify logging. |
| medium | patch | `docs/verification/fr-01.md` labels AC1 passed while Bob's required browser walkthrough is open. Run that check and record it, or mark the criterion partial. |
| medium | patch | `docs/verification/fr-01.md` labels AC2 passed while natural browser expiry is open. Run a live expiry check and record it, or mark browser verification partial. |

Patch results: Fastify request and error logging now redacts cookie and authorization headers; the auth suite verifies that secrets stay out of logs. Bob's live browser flow, clock-advanced live expiry, and 320px reflow were verified and recorded in `docs/verification/fr-01.md`. The full API and web suites, build, formatting, and ticket preflight passed after the patches.

## Design Notes

API `inject` tests prove the server boundary, while component tests prove form and display states. A browser check across ports 3001 and 3000 must prove cookie, redirect, and sign-out behavior together. The FR-11 decision endpoint and evidence/draft actions are outside this ticket's implementation; traceability must identify their missing integration checks rather than marking them passed.

## Verification

**Commands:**
- `npm ci` — both workspaces install from the root lockfile.
- `npm run test:api` — focused API red/green cycles, then full auth and policy tests pass.
- `npm run test:web` — focused UI red/green cycles, then full web tests pass.
- `npm run build` — API and web compile.
- `npm run format:check` — in-scope source and configuration pass Prettier.
- `npm run ticket:preflight -- docs/tickets/fr-01-authenticate-staff.md` — existing Issue and UX handoff gate passes.

**Manual checks:**
- In a browser at localhost:3001, sign in as each customer, test direct and cross-account policy URLs, let a session expire, sign out, and reuse the old cookie against the API. Confirm no protected data appears after expiry or sign-out, and verify focus, error announcements, keyboard use, and 320px reflow.
