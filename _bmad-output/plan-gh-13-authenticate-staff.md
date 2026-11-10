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
review_loop_iteration: 2
followup_review_recommended: false
context:
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-14-authenticate-staff/DESIGN.md
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-14-authenticate-staff/EXPERIENCE.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - docs/PRD.md
  - docs/ADR.md
  - docs/DESIGN_STANDARD.md
  - docs/VISUAL_UX_CONSTRAINTS.md
  - docs/API_DEVELOPMENT.md
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
- Given a transient API failure while loading the policy list or detail, when the error appears, then the user can retry the request without reloading the browser.
- Given the API is unavailable during the initial protected-route session check, when the check fails, then no protected content appears and the user sees an error with a retry action.
- Given two seeded staff assigned to one policy, when each signs in, then each receives their own expiring session and assigned policies.
- Given invalid, expired, or signed-out credentials, when a protected API is called, then it returns 401 and no protected data.
- Given an unassigned or unknown policy ID, when detail is requested, then both yield the same non-disclosing 404.
- Given a draft creator or another assigned staff actor, when the reusable review guard is checked, then only the other actor is allowed without policy mutation.
- Given sign-out or expiry in the browser, when navigation continues, then protected content disappears and sign-in is shown.

## Implementation Notes

- Follow-up review: protected layout now exposes an error and retry for non-401 session-check failures while hiding protected content. Policy list and detail requests now offer retry actions and ignore late responses. Heading focus runs on page entry or successful policy navigation, not every render.

- Created the Fastify and Next.js workspaces required by the previously empty app foundation. The API keeps synthetic accounts, hashed session tokens, assignments, and audit events in memory.
- Added cookie-backed sign-in, sign-out, session lookup, assigned-policy list/detail, and reusable no-self-review guard. Web pages display only backend-authorized policy IDs and statuses.
- Review fixes remount protected pages when the authenticated actor changes, retain a retryable state when sign-out fails, hydrate session notices safely, and use local shadcn/ui form primitives.
- Prior worktree changes remain in stash `ef708a8766d444c42440e8438f1f75fe3bc13c5a`; restore with `git stash apply ef708a8766d444c42440e8438f1f75fe3bc13c5a` after reviewing this branch.

## Plan Change Log

### 2026-11-10 - Policy request retry
- Post-fix review found that policy list and detail pages say "Try again" after request failure but provide no retry action.
- Require a visible retry control in `apps/web/src/app/policies/page.tsx` and `apps/web/src/app/policies/[id]/page.tsx` that repeats the failed request without showing stale policy data.
- KEEP the existing 401 redirect, generic 404 response, and actor-change remount behavior.

### 2026-11-10 - Session-check error recovery
- Follow-up review found that a non-401 failure of the initial `/auth/me` check leaves the protected layout on a loading message indefinitely.
- Require an actionable error and retry in `apps/web/src/app/policies/layout.tsx` while keeping protected content hidden. This avoids a stalled route when the API is unavailable.
- KEEP server-side session checks, the 401 redirect, account-switch remount, and sign-out retry behavior.

## Review Triage Log

### 2026-11-10 - Retry and focus review pass
- verdicts: 1 finding - high 0, medium 1, low 0, false 0, maybe-false 0
- findings:
  - `[medium]` `[patch]` Inline heading refs stole keyboard focus after policy request errors and retry clicks - replaced render-time focus with one-time page-entry focus and focus on successful policy navigation.

### 2026-11-10 - Post-fix review pass
- verdicts: 1 finding - high 0, medium 1, low 0, false 0, maybe-false 0
- findings:
  - `[medium]` `[bad_plan]` Policy list and detail error messages promise a retry but lack an action - their fetch effects run only on mount. Added explicit retry acceptance and task guidance.

### 2026-11-10 - Follow-up review pass
- verdicts: 1 finding - high 0, medium 1, low 0, false 0, maybe-false 0
- findings:
  - `[medium]` `[bad_plan]` Initial session check can stall on a non-401 error - `currentActor()` throws, the catch handles only 401, and `checking` becomes false while `actor` remains null. Added explicit error-and-retry acceptance.

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

### Follow-up review result - 2026-11-10
- Status: built. Session-check, policy-list, and policy-detail API failures now have actionable retry states without exposing protected data; keyboard focus stays on the user's action during retries.
- Files changed: `apps/web/src/app/policies/layout.tsx` adds session-check error and retry; `apps/web/src/app/policies/page.tsx` and `apps/web/src/app/policies/[id]/page.tsx` add request retry and focused heading behavior; this plan records the review.
- Review: two medium findings required plan-level corrections, then one medium finding was patched. No findings were deferred or rejected. Follow-up review recommended: false (zero high patches in this follow-up pass).
- Verification: six API tests passed during implementation; the API and web production builds passed after the final focus correction; `git diff --check` passed. Browser interaction checks remain pending.
- Residual risk: no automated browser test covers retry, sign-out failure, or cross-tab account switching. PR #15 is open; GitHub reports no CI checks on the branch yet.
- PO handoff: GitHub Issue #13 remains open and **In Review**; its Progress & Handover links implementation PR #15 and names `codex/gh-13-authenticate-staff` as the review branch.

- Status: built. FR-14 authentication, session revocation, assignment enforcement, review authorization guard, and sign-in UI are implemented.
- Files: `apps/api/` contains Fastify routes, stores, schemas, and six API tests; `apps/web/` contains sign-in and protected pages; `README.md`, `docs/API_DEVELOPMENT.md`, `docs/ADR.md`, and the root lockfile document and support the new workspaces.
- Review: four findings patched (two high, two medium); none deferred or rejected. Follow-up review recommended because high findings were patched; verify browser account switching and failed sign-out interaction in a future browser run.
- Verification: `npm ci --offline --no-audit --no-fund` passed after clean install; `npm run test:api` passed 6/6; `npm run build` passed API and web; `git diff --check` passed. No browser end-to-end suite was run.
- Residual risk: sessions are process-local and reset on API restart; browser interactions are not covered by automated UI tests.
- Preexisting work stash: `ef708a8766d444c42440e8438f1f75fe3bc13c5a`; restore with `git stash apply ef708a8766d444c42440e8438f1f75fe3bc13c5a`.
- PO handoff: GitHub Issue #13 Progress & Handover updated to **In Review** with branch, implementation commit, verification, and remaining PR/browser acceptance work. The issue remains open.

## Code Review

### 2026-11-10 � API group
2 decisions resolved; 10 patches applied; 0 deferred; 0 rejected. Remaining review groups: web UI and documentation/dependencies.
- [x] [Review][Patch] Require explicit demo passwords when listening beyond localhost [apps/api/src/server.ts:4]
- [x] [Review][Patch] Use asynchronous sign-in hashing and limit attempts [apps/api/src/auth.ts:31; apps/api/src/app.ts:49]
- [x] [Review][Patch] Bound session and audit memory [apps/api/src/auth.ts:13]
- [x] [Review][Patch] Include policy ID in access audit [apps/api/src/app.ts:97]
- [x] [Review][Patch] Assert successful current-session identity [apps/api/src/app.test.ts:30]
- [x] [Review][Patch] Assert policy list statuses [apps/api/src/app.test.ts:39]
- [x] [Review][Patch] Assert policy detail body [apps/api/src/app.test.ts:85]
- [x] [Review][Patch] Assert sign-out cookie expiration [apps/api/src/app.test.ts:70]
- [x] [Review][Patch] Document sign-in 400 response [apps/api/src/app.ts:42]
- [x] [Review][Patch] Record expired sign-out sessions accurately [apps/api/src/auth.ts:56]
Rejected: none.

### 2026-11-10 - Web and documentation groups
0 decision-needed; 7 patch; 0 defer; 9 rejected. The docs edge-case lens returned no findings; other docs lenses completed.
- [ ] [Review][Patch] Ignore stale overlapping session checks [apps/web/src/app/policies/layout.tsx:27]
- [ ] [Review][Patch] Do not label a first unauthenticated visit as an expired session [apps/web/src/app/policies/layout.tsx:35]
- [ ] [Review][Patch] Bound pending API requests and allow retry [apps/web/src/lib/api.ts:12]
- [ ] [Review][Patch] Preserve a safe requested destination for an already signed-in visitor [apps/web/src/app/sign-in/page.tsx:28]
- [ ] [Review][Patch] Cover session failure, sign-out failure, and list retry in browser tests [apps/web/src/app/policies/layout.tsx:22]
- [ ] [Review][Patch] Document the Node version required for Next.js [README.md:5]
- [ ] [Review][Patch] Remove machine-local stash restoration instructions from the plan [_bmad-output/plan-gh-13-authenticate-staff.md:145]
Rejected: failed sign-out deliberately hides protected content and offers retry; eight docs/source mismatch reports inspected the repository other local branch rather than this PR checkout.
