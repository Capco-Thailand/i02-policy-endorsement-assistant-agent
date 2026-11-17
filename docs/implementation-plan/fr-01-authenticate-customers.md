---
title: FR-01 customer authentication
type: feature
ticket: fr-01-authenticate-customers
created: '2026-11-16'
status: built
baseline_revision: d5ac6d9cd5037b815dbaa49c3618e8054434637c
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
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
- 2026-11-16: Browser follow-up: `npm run test:e2e` passed 17/17 Chromium scenarios twice; latest local HTML: `test-results/report-20261116135708/e2e-20261116135708.html`. `e2e/customer-flows.spec.ts` verifies both account sign-ins, invalid credentials, sign-out, and protected data removal; `e2e/api-boundaries.spec.ts` verifies missing/signed-out sessions and policy ownership. `e2e/visual.spec.ts` compares sign-in at desktop and 375px against reviewed macOS Chromium baselines. Remaining unverified: timed browser expiry, audit redaction in a running server, and FR-11 decision integration.
- 2026-11-16: Initial draft from merged ticket, Issue #51, ADR, and UX handoff.
- 2026-11-16: User approved the plan and authorized implementation.

## Review Triage Log
- High, patch, fixed — `apps/web/src/lib/api.ts`: JSON Content-Type on an empty sign-out POST made Fastify return 400 before invalidation. The client now omits it; client test and direct API sign-out/reuse check pass.
- Medium, patch, fixed — `apps/api/src/auth/data.ts`: unknown account IDs skipped scrypt. Both paths now hash and compare; `data.test.ts` passes.
- Medium, patch, fixed — `apps/web/src/auth/SignInForm.tsx`: missing fields lacked linked errors. Both fields now show associated text and focus; component test passes.

## Design Notes
The sign-in form, protected route gate, and compact policy list are separate components because they own different interaction states. Use `design/global.css` and the reviewed sign-in mockup for visual decisions; keep public sign-in free of policy details.

## Verification
**Commands:**
- `npm test` — API injection and web component tests.
- `npm run typecheck` — both workspaces.
- `npm run build` — Next.js production build; API TypeScript is checked with `tsc --noEmit`.
- `npm run format:check` — in-scope code passes Prettier.

**Red/green evidence:**
- API seeded sign-in: `npm run test -w apps/api` failed because the app boundary was absent, then passed after the Fastify route and session implementation.
- UI credential error, protected gate, and sign-out: `npm run test -w apps/web` failed on each missing component before its implementation, then passed after each slice.
- API expiry timestamp: `npm run test -w apps/api -- -t 'publishes the server expiry'` failed with `expected undefined to be 1801000`, then passed after the response schema and session change.
- UI expiry clearing: `npm run test -w apps/web -- -t 'server expiry time'` failed with cached policy data still present, then passed after the timer-based gate change.
- Review fixes: bodyless sign-out header, unknown-account hashing, and missing-field errors each failed focused tests before the correction and passed afterward.

**Traceability:**

| FR-01 criterion | Evidence and layer | Expected result | Status / gap |
| --- | --- | --- | --- |
| Seeded accounts and distinct policies | `apps/api/src/auth/auth.test.ts`, API injection: seeded sign-in and linked policy | Only actor's policy returned | Passed for Narin and Mali. Browser integration not run. |
| Invalid, missing, expired, signed-out sessions | `apps/api/src/auth/auth.test.ts`, API injection: rejection and invalidation cases; `apps/web/src/lib/api.test.ts` client request | `401` and no policy data; bodyless sign-out reaches API | Passed. Direct API sign-out returned `204`, reuse `401`. |
| Forged identity and policy isolation | `apps/api/src/auth/auth.test.ts`, API injection: spoofed actor and unknown/unowned IDs | Same `404`, no details | Passed for policy detail. Future actions remain with their owning tickets. |
| UI sign-out and expiry | `apps/web/src/auth/SessionGate.test.tsx`, `SignOutButton.test.tsx`, component/API mock | Cache cleared and sign-in navigation | Passed at component boundary; browser integration not run. |
| Generic credentials and field errors | `apps/api/src/auth/data.test.ts`, `apps/web/src/auth/SignInForm.test.tsx` | Unknown account follows hashing path; missing fields show linked errors | Passed. |
| Proposal decision owner guard | `apps/api/src/auth/auth.test.ts`, guard test | Owner allowed, non-owner blocked | Guard passed; FR-11 owns endpoint wiring and integration test. |
| Actor/action audit without secrets | `apps/api/src/auth/auth.test.ts`, API injection | Actor and action, no credentials/token | Passed. |

**Manual checks:**
- Desktop and narrow browser visual comparison could not run: no browser was available in this environment. UI component checks cover field association and focus, but do not prove rendered layout or full screen-reader behavior.
- Verify FR-11 proposal endpoint is absent and record its integration coverage as deferred, not passed.
