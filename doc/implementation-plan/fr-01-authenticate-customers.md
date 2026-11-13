---
title: 'FR-01 — Authenticate Customers'
type: feature
ticket: fr-01-authenticate-staff
created: '2026-11-13'
status: draft
baseline_revision: fa3a21ddeb97183f55da922884ec7c94afff111c
route: full
route_source: auto
risk: high
review: thorough
review_source: auto
lenses_ran: []
review_loop_iteration: 0
context:
  - docs/tickets/fr-01-authenticate-staff.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - docs/ADR.md
  - docs/DESIGN_STANDARD.md
  - docs/VISUAL_UX_CONSTRAINTS.md
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-01-customer-authentication/DESIGN.md
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-01-customer-authentication/EXPERIENCE.md
  - design/page/sign-in.html
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The current checkout has no API or web runtime. Customers cannot establish an attributable session or access only their own synthetic policies; later decisions have no reusable ownership gate.

**Approach:** Create the minimum Fastify and Next.js workspaces, seeded customer fixtures, expiring server sessions, protected read-only policy views, and a customer-owned proposal guard. Implement the sign-in, session recovery, and sign-out experience from the current UX handoff.

## Boundaries & Constraints

**Always:** Derive actor identity from a validated server session on every protected API call; authorize before policy or proposal lookup returns details; give unknown and inaccessible IDs the same response. Use synthetic data, validated schemas and derived OpenAPI/client types, accessible UI, and non-secret audit events.

**Never:** Restore the reverted staff reviewer rule; trust identity or role fields from a client; expose session tokens to browser JavaScript or audit logs; add FR-02/FR-11/FR-12 workflows or bind coverage.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Sign-in | Alice or Bob demo credentials | Distinct expiring, HttpOnly session; current customer and own policy list | Wrong or unknown credentials: generic `401`, no session |
| Protected request | Missing, forged, expired, or signed-out cookie; forged identity headers/body | No protected content or action | `401`; web clears cached content and returns to sign-in |
| Policy read | Own, other customer's, or unknown ID | Own data only; list filtered by session actor | Other/unknown: identical `404` status and body |
| Proposal decision guard | Own, another customer's, or unknown synthetic proposal; forged customer/policy ID | Own proposal permitted by guard only | Other/unknown denied identically; no decision endpoint or policy write |
| Sign-out | Valid session then direct API replay | Session revoked immediately; cookie cleared | Replayed cookie: `401` |

</frozen-after-approval>

## Code Map

- `package.json`, `package-lock.json`, `apps/ai/package.json` — root has only the AI placeholder workspace and Prettier; add API/web workspaces and root scripts without replacing the lockfile.
- `apps/api/`, `apps/web/` — absent; create the minimum runtime. `docs/API_DEVELOPMENT.md` and `README.md` currently describe their absence.
- `design/page/sign-in.html`, `design/page/sign-in.js`, `design/global.css` — UX preview, not application code; behavior spine is `EXPERIENCE.md`.
- `docs/ADR.md`, `docs/PRD.md`, `docs/tickets/fr-01-authenticate-staff.md` — stack, product boundary, and authoritative acceptance criteria.
- Commit `bdb4433` — reverted staff implementation; prior `canReviewDraft` allowed a different staff reviewer and must not be reused for customer decisions.

## Tasks & Acceptance

**Execution:** Complete as test-first vertical slices; run each focused public-seam test red for the intended missing behavior, then green before the next slice.

- [ ] `package.json`, `package-lock.json`, `apps/api/package.json`, `apps/web/package.json` — establish runnable TypeScript/Fastify and Next.js App Router workspaces, root commands, and scoped Prettier coverage; keep the existing npm workspace and root lockfile.
- [ ] `apps/api/src/auth/*.test.ts` then `apps/api/src/auth/*` — test sign-in, generic rejection, current-session, expiry with an injected clock, sign-out and replay through `app.inject`; implement server-side sessions with random opaque cookie tokens, stored as digests, bounded lifetime, credential hashing, and immediate revocation. Document single-process demo session behavior.
- [ ] `apps/api/src/policies/*.test.ts` then `apps/api/src/policies/*` — test filtered list, own detail, identical cross-account/unknown `404`, and spoofed identity through HTTP; seed at least Alice and Bob with distinct linked synthetic policies; authorize at the API boundary before returning details.
- [ ] `apps/api/src/authorization/*.test.ts` then `apps/api/src/authorization/*` — test a public guard with synthetic proposal records: owner allowed, other/unknown denied identically despite forged IDs. Expose it for FR-11; do not create a decision route. Record the missing FR-11 route integration check in traceability.
- [ ] `apps/api/src/app.ts`, route schemas, and adjacent tests — derive request/response types and OpenAPI from validated schemas; document sign-in, sign-out, current-session, cookie security and `400`/`401`/`404` responses; check safe cookie flags, CORS origin, and mutation origin/CSRF protection for cookie authentication. Audit actor/action without credentials, cookie values, or unnecessary policy data.
- [ ] `apps/web/src/lib/*` and adjacent tests — centralize typed routes and API client, use `credentials: include`, derive client types from the API contract, and use TanStack Query hooks for client reads/mutations; clear protected cache on sign-out or `401`.
- [ ] `apps/web/src/app/*`, focused components, and adjacent tests — build sign-in form, authenticated policy list/detail, and sign-out header. Extract form and policy rows/detail only where they own meaningful behavior; use shadcn/ui controls. Verify pending, generic invalid credentials, network error, expiry, refresh/session check, keyboard submission, error focus/announcement, mobile layout, and synthetic/non-binding copy against UX handoff.
- [ ] `README.md`, `docs/API_DEVELOPMENT.md`, ticket traceability record — document demo credentials and display names, session lifetime/configuration, startup, OpenAPI, test commands, and criterion-by-criterion evidence. Update other docs only if implementation actually changes their documented contracts.

**Acceptance Criteria:**

- Given two seeded customers, each signs in and sees only their linked policies; a URL or API request for another customer's policy reveals no details.
- Given a missing, invalid, expired, or revoked session, every implemented protected route returns `401`; forged client identity does not change the actor.
- Given sign-out or expiry, the UI removes protected data and returns to sign-in; replay against the API remains denied.
- Given a proposal owned by the session customer, the reusable guard allows the future decision; all other/unknown proposals are denied without revealing ownership. FR-11 must prove the route-level decision outcome when its endpoint exists.
- Given successful or rejected authenticated actions, audit output contains actor/action and no credentials or session secrets; the published contract matches runtime responses.

## Implementation Notes

## Plan Change Log

## Review Triage Log

## Design Notes

Use a server-side, expiring opaque session cookie because the ticket requires immediate sign-out invalidation. An in-memory repository is sufficient for the current single-process synthetic demo; restarting the API invalidates sessions. Keep account/policy/proposal repositories injectable so API tests can use fixed fixtures. No evidence, request, draft, or decision endpoint exists now: expose ownership checks for those future routes and require each future route to add rejection tests before release. The old staff rule in `bdb4433^` is historical code only.

**Open questions recorded for implementation:** Confirm seeded account display names against the UX wording note before publishing credentials. FR-11 must define its proposal identifier and decision route, then add actual allowed/blocked decision and unchanged-policy integration tests. FR-02/FR-03 and evidence/draft owners must attach the policy guard to their routes and add per-route cross-account checks. These dependent checks remain uncovered until those routes exist; guard tests alone cannot mark the corresponding ticket criteria verified.

## Verification

**Commands:**

- `npm run ticket:preflight -- docs/tickets/fr-01-authenticate-staff.md` — implementation readiness before coding; the merged handoff is PR #36.
- Focused API test command established by the new API workspace — each named auth, policy, and proposal scenario fails first for missing behavior, then passes; retain red/green output in handoff.
- Focused web component test command established by the new web workspace — sign-in, session recovery, protected-content clearing, and accessibility states pass after their red cycles.
- `npm test` and `npm run build` — all implemented workspace tests and builds pass; inspect generated `/docs/json` against route responses and cookie security.
- `npm run format:check` — all application source and configuration in scope pass Prettier.

**Manual checks:** Run API and web locally; sign in as Alice and Bob, verify their distinct policy lists, change a policy URL across accounts, refresh a protected page, sign out then replay the old cookie directly, and expire a test session. Check keyboard/focus behavior and narrow viewport. Record each criterion's test file, expected result, run evidence, and missing future-route integration in ticket traceability; do not claim full verification for endpoints that do not exist.
