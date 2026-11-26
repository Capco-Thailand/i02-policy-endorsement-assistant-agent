---
title: 'FR-20 Fix history data fetch'
type: bugfix
ticket: fr-20-fix-history-data-fetch
created: '2026-11-26'
status: in-review
baseline_revision: 'e7f5610a736833aec510b835e429c2f10bd54a4e'
route: oneshot
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/fr-20-fix-history-data-fetch.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
---

<frozen-after-approval reason="customer selected FR-20 and the failure was reproduced">

## Intent

**Problem:** Authenticated `GET /api/history` returns 503 when an approved historical proposal lacks `payload.current.label`. On the synthetic database, sign-in returned 200, history returned 503, and the API logged a TypeError at `db.ts:432`; 6 of 56 approved records lack that label.

**Approach:** Read the owner-authorized policy label from the policy row when the proposal snapshot lacks a label. Keep proposal ordering, authorization, empty-state behavior, and non-binding records unchanged.

</frozen-after-approval>

## Tasks & Acceptance

- [ ] `apps/api/src/history.test.ts` — add a focused failing repository test for an approved legacy payload missing `current.label`.
- [ ] `apps/api/src/db.ts` — join the customer's policy by ID and return a valid label without dropping otherwise valid approved records; keep owner filtering.
- [ ] `docs/tickets/fr-20-fix-history-data-fetch.md` — record confirmed cause and verification evidence, then sync existing Issue #170.

Given an authenticated customer with approved legacy proposals, when history loads, then the response is 200 with readable policy labels and only that customer's records. Given no approved proposals, then history is empty. Given storage failure, then API still reports 503 and the client offers retry.

## Implementation Notes

- Reproduced authenticated `GET /api/history` 503 against synthetic Neon, with six incomplete legacy proposal payloads among 56 approved rows.
- Added owner-scoped policy/request joins; valid linked request payloads can fill missing snapshots. Approved records with incomplete change details retain identity, date, and status; the UI names the missing detail without inventing values.
- Focused API and web regressions red before the fixes and green after; live endpoint returned 200 with all 56 approved records, six with unavailable change detail. No stored row was mutated.
- Full API suite without `DATABASE_URL` reported 14 existing auth/request failures; integration cases requiring disposable `TEST_DATABASE_URL` were skipped. Local browser E2E cannot safely use the application database as a test database.

## Plan Change Log

## Review Triage Log

- Quick review: **high**, `apps/api/src/db.ts` dropped six approved decisions after failing change validation. Confirmed against the live 56-row synthetic dataset; changed the history contract to make change detail optional while retaining every approved decision with request ID and a readable unavailable-details state.
- Quick review: **medium**, `apps/api/src/db.ts` used an incomplete proposal change object before a complete linked request. Confirmed with a red regression; now validates the proposal snapshot first and falls back to the linked request when needed.
- Quick review: **high**, the policy join could include a proposal referencing another customer's policy. A red SQL regression confirmed the left join; changed it to an owner-matched inner join.
- Quick review: **medium**, incomplete legacy records linked to a proposal detail page that cannot render. A red UI regression confirmed the link; these records now explain that proposal details are unavailable.

## Verification

- `npm run test -w apps/api -- history.test.ts` — new missing-label regression passes.
- `npm run typecheck -w apps/api` — API types pass.
- `npm run format:check` — formatting passes.
- Authenticated local sign-in and `GET /api/history` against the supplied synthetic database return 200; no credentials or personal data in evidence.
