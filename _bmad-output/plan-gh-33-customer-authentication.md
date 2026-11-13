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
review_loop_iteration: 0
context:
  - docs/tickets/fr-01-authenticate-staff.md
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-01-authenticate-staff/DESIGN.md
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-01-authenticate-staff/EXPERIENCE.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** This checkout has no runnable API or web app, so synthetic customers cannot sign in or access their linked policies. FR-01 must establish authentication and an authorization boundary before later endorsement flows are built.

**Approach:** Create the smallest Fastify and Next.js foundation that supports synthetic customer accounts, expiring server sessions, protected policy list/detail reads, and the approved sign-in and sign-out experience. Keep future proposal decisions behind a reusable ownership guard.

## Boundaries & Constraints

**Always:** Use synthetic data; derive the actor from the server session on every protected request; return the same non-disclosing result for unknown and unowned policy IDs; document contracts; preserve non-binding coverage. Follow the linked DESIGN.md and EXPERIENCE.md. Keep credentials and session secrets out of logs, URLs, and browser storage.

**Never:** Add live insurer connections, production identity services, proposal review/history UI, endorsement issuance, or a client-side authorization decision. Do not restore the reverted staff-auth code as the current actor model.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Sign in | Valid seeded account credentials | Expiring server session; safe return to an internal destination or `/policies` | Generic rejection for invalid credentials |
| Session | Missing, expired, revoked, or forged cookie | Protected API returns `401`; web removes protected content and opens sign-in | No policy or session data in the response |
| Policy | Own, another customer's, or unknown policy ID | Own record is shown; other and unknown IDs yield identical `404` | No beneficiary or ownership hints |
| Decision guard | Owner or another customer and proposal owner ID | Guard permits only the owner for later FR-11 use | Deny forged client identity or policy claims |

</frozen-after-approval>

## Code Map

- `package.json`, `package-lock.json` — workspace scripts exist; packages and lock entries need a fresh root install. No Prettier configuration exists.
- `apps/api/`, `apps/web/` — absent; create only FR-01 routes, pages, and their runtime foundation. `apps/ai/` has no current need.
- `docs/tickets/fr-01-authenticate-staff.md` — local requirements and active Issue #33; `npm run ticket:preflight` passed on `test/create-ticket` with the handoff merge waiver.
- `design/page/sign-in.html`, `design/global.css` — visual reference; remove mockup-only preview controls from the app.
- `docs/API_DEVELOPMENT.md`, `README.md` — currently describe planned code and old token fixtures; update for real demo sessions and startup.
- Commit `bdb4433` — reverted historical staff implementation; inspect for lessons only.

## Tasks & Acceptance

**Execution:**
- [ ] `package.json`, `.prettierrc.json`, `.prettierignore`, `apps/api/package.json`, `apps/web/package.json` — establish runnable workspaces and root Prettier format scripts before app code.
- [ ] `apps/api/src/auth/*.test.ts` then `apps/api/src/auth/*` — red/green through Fastify `inject` for valid/invalid login, session expiry and revocation, forged identity, ownership guard, and sanitized audit events. Use seeded password hashes, opaque random session IDs, HttpOnly cookies, and a clock seam.
- [ ] `apps/api/src/policies/*.test.ts` then `apps/api/src/policies/*` — red/green through HTTP for linked list/detail access and indistinguishable unknown/unowned IDs; keep fixtures synthetic.
- [ ] `apps/api/src/app.ts`, `apps/api/src/server.ts`, route schemas — expose health, auth, policy routes and schema-derived OpenAPI; keep authorization before data reads and writes.
- [ ] `apps/web/src/app/sign-in/*.test.tsx` then sign-in page/components — red/green for labels, submit/error/busy/focus states and safe navigation. Compose the credential form as the meaningful client component; keep page copy in a server component.
- [ ] `apps/web/src/app/policies/*`, `apps/web/src/lib/api.ts` — protected policy list/detail and signed-in header; use server-validated session, safe sign-out, and contract-derived response types. Apply the linked React skill: no fetch-in-effect state copies or shared request state.
- [ ] `README.md`, `docs/API_DEVELOPMENT.md`, `docs/verification/fr-01.md` — document demo accounts, session lifetime, ports, contracts, and criterion-by-criterion evidence and deferred FR-11 integration checks.

**Acceptance Criteria:**
- Given two distinct seeded customers, when each signs in, then each sees only linked synthetic policies and can sign out.
- Given invalid credentials or any missing, expired, revoked, or forged session, when a protected route is called, then it returns `401` without data.
- Given an unowned or nonexistent policy ID, when it is requested, then both return the same `404` response.
- Given a forged client identity or a proposal owned by another customer, when authorization runs, then the session actor and owner guard reject the claim.
- Given a signed-out or expired browser session, when the customer navigates, then protected content disappears and sign-in shows the correct notice.

## Implementation Notes

## Plan Change Log

## Review Triage Log

| Verdict | Route | Evidence |
|---|---|---|
| low | patch | `apps/web/src/app/globals.css` now uses `font: inherit`; the browser applies the inherited interface font and the invalid shorthand is gone. |
| medium | patch | `package.json` format scripts now target app source and root JSON only, matching `docs/CODING_STANDARDS.md`'s exclusion of documents. |
| medium, unverified | defer | Cross-port browser sign-in, expiry, and sign-out remain unverified. CUA rejected the localhost origin approval; the API and component tests do not prove browser cookie/redirect behavior. A browser session with localhost permission would settle this. |
| medium | patch | The reported missing login POST was caused by a CORS origin mismatch (`127.0.0.1` web origin versus the API's `localhost` allowlist); the default now permits both exact local origins and API preflight tests cover each. |

## Design Notes

FR-01 needs a minimal policy read surface to demonstrate ownership, while endorsement and proposal screens remain in later tickets. API tests prove server enforcement; component tests prove display behavior; a browser check is needed to prove the cookie and redirect flow across ports. The guard test alone cannot prove FR-11's future endpoint calls it, so traceability must leave that integration open.

## Verification

**Commands:**
- `npm ci` — root lockfile installs both workspaces.
- `npm run test:api` — API tests show red then green per auth and policy slice.
- `npm run test:web` — sign-in and protected UI tests show red then green.
- `npm run build` — both workspaces compile.
- `npm run format:check` — in-scope application source and configuration meet Prettier formatting; documents are excluded by the coding standard.
- `npm run ticket:preflight -- docs/tickets/fr-01-authenticate-staff.md` — ticket/Issue gate remains satisfied.

**Manual checks (if no CLI):**
- On localhost, sign in as each demo customer, open another customer's policy URL, sign out, and reuse the prior cookie; confirm protected data never appears.
