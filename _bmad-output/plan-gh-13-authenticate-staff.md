---
title: 'FR-14 Authenticate Staff'
type: feature
ticket: ''
created: '2026-11-10'
status: built
baseline_revision: 'e300572f453cbb756572aea58f408b41a122b217'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
followup_review_recommended: true
context:
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-14-authenticate-staff/DESIGN.md
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-14-authenticate-staff/EXPERIENCE.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** Issue #13 requires individual synthetic staff authentication, assigned-policy access, and a no-self-review rule. The repository currently has no application source, so the sign-in and API surfaces must be created.

**Approach:** Build the minimal Fastify and Next.js workspace foundation needed for session-backed sign-in, protected policy access, sign-out, and reusable review authorization. Keep all records synthetic and drafts non-binding.

## Boundaries & Constraints

**Always:** Validate sessions and policy assignment on the server; return the same result for unknown and unassigned policies; keep browser credentials out of storage and audit records; follow the UX handoff and document the contract.

**Never:** Connect to insurer systems, implement production identity, create or bind coverage, or invent draft-review endpoints outside this story.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Sign in | Valid seeded credentials | Expiring server session; current actor returned | Generic rejection for invalid credentials |
| Protected request | Missing, expired, revoked, or forged session | No protected data | 401 |
| Policy access | Assigned vs unassigned or unknown policy ID | Assigned data only | Same 404 for unassigned and unknown |
| Review authorization | Creator vs other assigned staff | Creator blocked; other staff allowed | No policy mutation |

</intent-contract>

## Code Map

- `package.json` — root workspaces exist; app folders and lockfile are absent.
- `docs/API_DEVELOPMENT.md` — old token fixture plan must be replaced by the session contract.
- `docs/ADR.md` — Fastify and Next.js App Router boundary.
- `design/page/sign-in.html` — browser-viewable UX reference; spines in context take precedence.
- `apps/api/`, `apps/web/` — create only the code needed for this story.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/api/package.json`, `apps/api/src/*` — implement synthetic accounts, password verification, expiring revocable sessions, cookie auth, assigned-policy guards, audit, and documented Fastify routes.
- [ ] `apps/api/src/*.test.ts` — verify invalid credentials, expiry, sign-out replay, spoofed actor, policy isolation, and review guard with both accounts.
- [ ] `apps/web/package.json`, `apps/web/src/app/*` — implement Next.js sign-in, protected route shell, session expiry handling, and sign-out per UX handoff.
- [ ] `package-lock.json`, `README.md`, `docs/API_DEVELOPMENT.md` — install from root and document credentials, session lifetime, commands, and API behavior.

**Acceptance Criteria:**
- Given two seeded staff assigned to one policy, when each signs in, then each receives their own expiring session and assigned policies.
- Given invalid, expired, or signed-out credentials, when a protected API is called, then it returns 401 and no protected data.
- Given an unassigned or unknown policy ID, when detail is requested, then both yield the same non-disclosing 404.
- Given a draft creator or another assigned staff actor, when the reusable review guard is checked, then only the other actor is allowed without policy mutation.
- Given sign-out or expiry in the browser, when navigation continues, then protected content disappears and sign-in is shown.

## Implementation Notes

- Created the Fastify and Next.js workspaces required by the previously empty app foundation. The API keeps synthetic accounts, hashed session tokens, assignments, and audit events in memory.
- Added cookie-backed sign-in, sign-out, session lookup, assigned-policy list/detail, and reusable no-self-review guard. Web pages display only backend-authorized policy IDs and statuses.
- Review fixes remount protected pages when the authenticated actor changes, retain a retryable state when sign-out fails, hydrate session notices safely, and use local shadcn/ui form primitives.
- Prior worktree changes remain in stash `ef708a8766d444c42440e8438f1f75fe3bc13c5a`; restore with `git stash apply ef708a8766d444c42440e8438f1f75fe3bc13c5a` after reviewing this branch.

## Plan Change Log

## Review Triage Log

### 2026-11-10 — Review pass
- verdicts: 4 findings — high 2, medium 2, low 0, false 0, maybe-false 0
- findings:
  - `[high]` `[patch]` Protected list could retain another account's data after session change — keyed the protected subtree by actor ID so pages remount and refetch.
  - `[high]` `[patch]` Network failure could be presented as successful sign-out — hide protected data, show a retry action, and report signed out only after confirmed revocation or known invalid session.
  - `[medium]` `[patch]` URL-based notice could mismatch server-rendered markup — derive the notice after hydration in an effect.
  - `[medium]` `[patch]` Sign-in form omitted required shadcn/ui primitives — added focused Button, Input, and Radix-backed Label components.

## Verification

**Commands:**
- `npm ci` — root workspaces install from one lockfile.
- `npm run test:api` — authentication and authorization scenarios pass.
- `npm run build` — API and web compile.

## Auto Run Result

- Status: built. FR-14 authentication, session revocation, assignment enforcement, review authorization guard, and sign-in UI are implemented.
- Files: `apps/api/` contains Fastify routes, stores, schemas, and six API tests; `apps/web/` contains sign-in and protected pages; `README.md`, `docs/API_DEVELOPMENT.md`, `docs/ADR.md`, and the root lockfile document and support the new workspaces.
- Review: four findings patched (two high, two medium); none deferred or rejected. Follow-up review recommended because high findings were patched; verify browser account switching and failed sign-out interaction in a future browser run.
- Verification: `npm ci --offline --no-audit --no-fund` passed after clean install; `npm run test:api` passed 6/6; `npm run build` passed API and web; `git diff --check` passed. No browser end-to-end suite was run.
- Residual risk: sessions are process-local and reset on API restart; browser interactions are not covered by automated UI tests.
- Preexisting work stash: `ef708a8766d444c42440e8438f1f75fe3bc13c5a`; restore with `git stash apply ef708a8766d444c42440e8438f1f75fe3bc13c5a`.
