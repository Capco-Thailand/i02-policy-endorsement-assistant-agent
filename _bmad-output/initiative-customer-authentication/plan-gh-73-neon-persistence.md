---
title: 'Persist prototype data in Neon PostgreSQL'
type: chore
ticket: 'chore-migrate-persistence-to-neon'
created: '2026-11-17'
status: draft
baseline_revision: '1f511c46a0d0df67de0a1b1f154d0d8c3ecc1215'
route: full
route_source: auto
risk: high
review: ''
review_source: ''
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/chore-migrate-persistence-to-neon.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - docs/ADR.md
---

---
title: 'Persist prototype data in Neon PostgreSQL'
type: chore
ticket: 'chore-migrate-persistence-to-neon'
created: '2026-11-17'
status: built
baseline_revision: '1f511c46a0d0df67de0a1b1f154d0d8c3ecc1215'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/chore-migrate-persistence-to-neon.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - docs/ADR.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Customers, policies, sessions, endorsement requests, and audit events currently live in source code or one API process. Restart and multiple API instances lose or disagree on authenticated state and customer activity.

**Approach:** Store these records in server-side PostgreSQL tables compatible with Neon. Migrate and seed synthetic demo data explicitly; make every route await durable reads and writes while preserving the current HTTP contracts.

## Boundaries & Constraints

**Always:** Keep all data synthetic, enforce account ownership in the API and database relationships, store password verifiers and only digests of session tokens, commit request and audit writes together, and return an error when database operations fail. Use a separate synthetic test database; keep credentials server-side.

**Never:** Bind coverage, mutate policy facts when creating a request, expose database credentials or session secrets, silently fall back to memory, or introduce a browser-to-database connection.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Seed | Fresh or previously used database | Exactly two demo accounts and three policies; rerun preserves requests and audit events | Abort on schema or connection error |
| Session | Valid, expired, revoked, or forged cookie across API instances | Valid cookie resolves same actor; others return 401 | Database failure returns a server error |
| Policy | Owned, foreign, or unknown ID | Current response shape; foreign and unknown share 404 | No cross-account details leak |
| Request | Valid or invalid payload/policy/session | One durable request and audit event for valid input; no request for invalid input | Transaction rollback and server error on write failure |

</frozen-after-approval>

## Code Map
- `apps/api/src/app.ts`: replace process-local state and synchronous hooks with awaited PostgreSQL repository calls; preserve route schemas and HTTP behavior.
- `apps/api/src/auth/data.ts`, `auth/session.ts`, `auth/guards.ts`: migrate seed data and sessions while retaining ownership guards.
- `apps/api/src/endorsement/schema.ts`: retain request validation and response types.
- `apps/api/src/auth/*.test.ts`, `apps/api/src/endorsement/request.test.ts`: adapt to isolated database integration.
- `.github/workflows/ticket-check.yml`, `playwright.config.ts`, `scripts/run-e2e.mjs`: provide isolated CI database and chore E2E ticket ID.
- `docs/API_DEVELOPMENT.md`, `docs/ADR.md`, `README.md`, `AGENTS.md`, `.gitignore`: update persistence setup and credential handling.

## Tasks & Acceptance
**Execution:**
- [ ] Add integration tests through API and migration/seed commands; capture red then green results.
- [ ] Add constrained SQL schema and repeatable migration and synthetic seed commands.
- [ ] Add server-only PostgreSQL repository; require database configuration and connectivity at startup.
- [ ] Move authentication, policy, request, and audit operations to PostgreSQL with transactional writes.
- [ ] Configure isolated CI database and E2E; update setup and operations documentation.

**Acceptance Criteria:**
- Given a fresh or reused database, when migration and seed run twice, then demo data appears once and activity remains intact.
- Given two API instances, when a session is created, revoked, or expires, then both instances agree and only its digest is stored.
- Given owned, foreign, or unknown policies, when API routes read or submit, then existing response shapes and access boundaries hold.
- Given a valid submission, when persisted, then one request and audit event survive restart without changing policy facts.
- Given invalid input or database failure, when a route is called, then no unauthorized request commits or reports success.

## Implementation Notes

## Plan Change Log

## Review Triage Log
- medium, patch: `apps/api/src/app.ts` sign-in persisted the session before the separate audit insert. A failed audit left a valid unaudited session; make both writes atomic.
- medium, patch: The same write ordering affected sign-out revocation and its audit event. Commit both together so audit failure preserves the session.
- medium, patch: `apps/api/src/persistence.integration.test.ts` checked request and audit before restart and migrated only once. Close/reopen before the durability check and rerun migration.
- false: The plan has one YAML frontmatter block on disk. The review diff included staged original content plus an unstaged metadata change, creating an apparent duplicate in patch text. A separate duplicate of the non-frozen plan sections was found on inspection and removed.
- low, patch: `docs/ADR.md` retained the pre-migration restart warning while describing PostgreSQL persistence; remove the stale warning.
- low, patch: `apps/api/src/app.ts` used `session!.expiresAt` against the coding standard; use the narrowed session value.

## Design Notes
Use the existing Fastify API boundary and a server-only PostgreSQL client. CI may use ephemeral PostgreSQL for synthetic integration; deployment uses Neon via `DATABASE_URL`. A live Neon connection is not configured here.

## Verification
**Commands:**
- `npm run ticket:preflight -- docs/tickets/chore-migrate-persistence-to-neon.md`
- `npm test`
- `npm run typecheck`
- `npm run format:check`
- `npm run build`
- `E2E_TICKET_ID=chore-migrate-persistence-to-neon npm run test:e2e`

**Manual checks (if no CLI):**
- Inspect schema, CI isolation, and client bundle for synthetic-only data and absent credentials.
