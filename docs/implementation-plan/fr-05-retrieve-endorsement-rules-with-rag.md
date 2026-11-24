---
title: 'FR-05 Retrieve Endorsement Rules with RAG'
type: feature
ticket: 'gh-110'
created: '2026-11-19'
status: built
baseline_revision: 'b658bfc992b59458e34f080c29c07cabb3d085d5'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - AGENTS.md
  - docs/tickets/fr-05-retrieve-endorsement-rules-with-rag.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - docs/ADR.md
---

## Intent

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

**Problem:** The endorsement flow lacks cited, versioned rules and document guidance for its three demo products and four changes.

**Approach:** Add a synthetic rule corpus, repeatable loader, and Fastify retrieval route. Reuse Neon pgvector after exact product/change/date filtering and rule/version resolution.

## Boundaries & Constraints

**Always:** Check ownership before reading the selected FR-04 document's product ID; cite available evidence; require referral for unresolved or explicit-referral rules.

**Never:** Trust client product/identity, fall back across products/changes, obey source prose, index uploads, collect medical evidence, or create eligibility, quote, draft, policy, or binding writes.

## I/O & Edge-Case Matrix

| State | Observable result |
| --- | --- |
| Owned policy and valid input | `AVAILABLE` with cited rule/guidance, or `MISSING`/`CONFLICTING` with referral; historical date selects its version |
| Missing session, foreign policy, invalid input | `401`, identical `404`, `400`; no rule corpus access |
| Retrieval failure or result overflow | Sanitized `503` `UNAVAILABLE`; no partial success |
| Hostile text | Data only; no gate change or write |

</frozen-after-approval>

## Code Map

- Reuse loader, database, and test patterns in `apps/api/src/load-corpus.ts`, `apps/api/src/db.ts`, and `apps/api/src/evidence.integration.test.ts`; preserve FR-04 tables/encoder.
- In `apps/api/src/db.ts`, register `003_endorsement_rules.sql` and use selected `policy_documents.product_id` after ownership; no policy/seed change.
- Add rule corpus/encoder/service/route, regenerate `apps/web/src/lib/api-types.ts`, and update `README.md`, `docs/API_DEVELOPMENT.md`, and `docs/ADR.md`.

## Tasks & Acceptance

**Execution:**

- [x] **C1:** In `apps/ai/corpus/endorsement-rules.json`, `apps/api/src/load-rules.ts`, and `apps/api/src/rules.integration.test.ts`, add 12 synthetic pairs and an immutable transactional loader; prove repeat loads leave operational tables untouched.
- [x] **C2/C3:** In `apps/api/sql/003_endorsement_rules.sql`, `apps/api/src/db.ts`, and `apps/api/src/rules.ts`, resolve selected-document product, check version consistency, filter exact metadata, and choose highest applicable numeric rule version; test historical dates/conflicts first.
- [x] **C4/C5:** In `apps/ai/corpus/endorsement-rules.json` and `apps/api/src/rules.ts`, type conditions, referral, and guidance/`NONE`; detect gaps/conflicts and cite rider underwriting. `AVAILABLE` referral rules set `requiresHumanReferral`.
- [x] **C6/C7:** In `apps/api/src/app.ts`, `apps/ai/rule-retrieval.ts`, and `apps/api/src/rules.integration.test.ts`, add `GET /api/policies/:policyId/rules` with `changeType`/`requestedEffectiveDate`, TypeBox/OpenAPI, and fixed vectors. Test access, failures, hostile prose, and overflow first.
- [x] **C8:** In `apps/ai/eval/rule-retrieval-v2.json` and `apps/api/src/rules.eval.test.ts`, run ≥80 applicable fixed cases (≥20/change) for relevant-rule recall, plus separate missing, conflicting, and unauthorized safety cases; report metrics and complete traceability/docs.

**Acceptance Criteria:**

- Given 12 pairs, when loaded twice, then identities and operational records remain unchanged.
- Given owned policy/change/date, when retrieving, then only matching rules return with rule/version/section/period/guidance citations.
- Given overlapping versions/conflicts, when selecting, then the highest applicable version per rule or safe conflict IDs return.
- Given missing, conflicting, `NONE`, or referral guidance, when retrieving, then status and referral flag reflect the evidence.
- Given rider rules, when retrieving, then underwriting follow-up appears without medical collection or upload-verification claims.
- Given invalid input or missing/foreign access, when requesting rules, then `400`/`401`/identical `404` return before corpus access.
- Given storage failure or overflow, when retrieving, then sanitized `503` `UNAVAILABLE` returns without partial rules.
- Given hostile prose, when retrieving, then no eligibility, quote, draft, policy, or coverage write occurs.
- Given ≥80 fixed cases, when evaluated, then version, denominator, pass count, percentage, failed IDs, false referrals, and retrieval failures are reported; recall below 95% fails.

## Implementation Notes

### Criterion traceability (2026-11-19)

| Criterion | Evidence and expected result | Latest result | Gap |
| --- | --- | --- | --- |
| C1 | `rules.integration.test.ts`: repeat load leaves 12 sources/24 sections and operational records unchanged; added section on an existing source rolls back | Passed with isolated PostgreSQL | Upload bytes have no storage table or loader input |
| C2 | `rules.integration.test.ts` owned route and `rules.eval.test.ts`: exact product/change/date with two cited sections and `NONE` guidance | Passed; 80 fixed cases | FR-07 UI consumption is separate |
| C3 | `rules.test.ts` and `rules.integration.test.ts`: historic v1, current v10, conflicting v10 peers yield safe IDs | Passed | None |
| C4 | `rules.test.ts`, `rules.integration.test.ts`: missing/contradictory guidance across rule IDs, invalid typed condition, and referral status | Passed | FR-08 eligibility integration is separate |
| C5 | `rules.integration.test.ts`: rider referral cites underwriting follow-up without medical collection claim | Passed | FR-07 display is separate |
| C6 | `rules.integration.test.ts`: 401, identical 404, 400 before rule store invocation | Passed | None |
| C7 | `rules.integration.test.ts`: sanitized referral 503 for failure/stale encoder/overflow; discriminated OpenAPI values; hostile prose remains data and request count unchanged | Passed | Later quote/draft/binding flows are outside FR-05 |
| C8 | `rule-retrieval-v2.json` and `rules.eval.test.ts`: 20 applicable cases per change with explicit relevant rule IDs, 80 recall denominator, plus 20 safety cases | Recall 80/80, 100%; failed IDs `[]`; contract failures `[]`; safety 20/20; false referrals 0; retrieval failures 0 | FR-07/FR-08 measures are separate |

PostgreSQL tests ran with isolated `TEST_DATABASE_URL=postgresql:///fr05_full2` after explicit migration and seed. No PostgreSQL skips count toward these results. The 21 existing Chromium E2E scenarios passed; FR-05 has no user-facing UI in this ticket. Latest report: `test-results/fr-05-retrieve-endorsement-rules-with-rag/report-20261119172039/e2e-20261119172039.html`.

## Plan Change Log

2026-11-19: Selected separate Neon pgvector rule tables/encoder; retained FR-04 product IDs.

## Review Triage Log

Resolved product identity, vector cap, evaluation, and acceptance gaps. Implementation review: quick; both findings patched and all verification rerun.

| Verdict | Route | Evidence |
| --- | --- | --- |
| medium | patch | Added eligible-case and attempted-retrieval denominators by change type to `rules.eval.test.ts`; full test suite passed. |
| medium | patch | Counted eligible 200 `MISSING` and `CONFLICTING` referrals as false referrals; 503 remains a retrieval failure. Focused classifier test and full suite passed. |

## Design Notes

Store IDs, metadata, typed values, text, vectors, and encoder version. Rank exact-filtered evidence using validated change/section-role vectors; check completeness/conflicts before the eight-section cap. Overflow is `UNAVAILABLE`, missing FR-04 document is `MISSING`, inconsistent products are `CONFLICTING`. No approximate index or external embedding service.

## Verification

**Observable seams and limits:**

- Selector unit tests prove date/version/conflicts; PostgreSQL loader/API tests prove filtering, idempotency, access order, safe responses, and no writes. FR-07 UI and FR-08 eligibility remain uncovered.

**Commands and results (2026-11-19):**

- Selector: `rules.test.ts` red (module missing), green 2/2; contradictory guidance red (`MISSING`), green 3/3.
- Loader: `rules.integration.test.ts` red (loader missing), green 1/1; added-section immutability red (resolved unexpectedly), green 1/1.
- Route: `rules.integration.test.ts` red (404 route missing), green 2/2; expanded integration 12/12.
- Review fixes: cross-rule contradiction red (`AVAILABLE`), green `CONFLICTING`; discriminated OpenAPI red (missing variants), green; stale encoder red (`MISSING`), green referral 503; v2 fixture red (missing applicable cases), green 80/80 recall and 20/20 safety.
- `npm test` passed with isolated PostgreSQL after migration and seed. API Vitest files run sequentially because they share `TEST_DATABASE_URL`; a parallel run exposed migration races.
- `npm run ticket:preflight -- docs/tickets/fr-05-retrieve-endorsement-rules-with-rag.md` passed: Issue #110 open, handoff PRs #109 and #111 merged.
- `npm run typecheck`, `npm run format:check`, `npm run build`, and `npm run test:e2e` passed; the E2E report path is above.

**Manual checks:** All 12 authored sources are synthetic; the rider rule states underwriting follow-up and says not to collect medical evidence. Populated PostgreSQL `EXPLAIN` used `endorsement_rule_filter_idx` with product, change, and date conditions.

## 2026-11-23 requirement reconciliation

FR-05 now treats stale source or section encoders as unresolved `MISSING`; storage failures remain `UNAVAILABLE`. The immutable v1 corpus remains loaded. A separate v2 corpus adds six address and rider source versions with real-world guidance and no mock-receipt instruction from 2026-11-23. The selector keeps exact product/change/date filtering and supersedes overlapping v1 sources for current dates. The v3 evaluation fixture records the expected source version for each historical or current case.

| Current criterion | Evidence | Local result and gap |
| --- | --- | --- |
| 12 pairs, repeat load, no operational mutation | `rules.integration.test.ts` expects 18 source versions across 12 pairs and unchanged operational rows | PostgreSQL integration pending: `TEST_DATABASE_URL` unset |
| Exact filter, citations, versions, historical selection | `rules.test.ts`; `rules.integration.test.ts` v1/v2 date case | Selector unit passed; PostgreSQL integration pending |
| Missing, conflicting, stale, unavailable | `rules.test.ts`; `rules.integration.test.ts` stale and failure cases | Unit passed; PostgreSQL integration pending |
| Rider real-world caveat, no medical collection | v2 corpus; `rules.integration.test.ts` | Static corpus inspection passed; API integration pending |
| Ownership, bounded ranking, hostile text | Existing route and integration tests | PostgreSQL integration and browser pending |

Focused API tests: 23 passed, 1 skipped (database evaluation) across the FR-05 selector and FR-08 consumers; `npm run typecheck -w apps/api` passed. The new source count and pair count were checked from both JSON files: 18 unique versions, 12 pairs. Previous CI evidence above predates this revision.

**Merged verification:** [CI run 45135833676](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/actions/runs/45135833676) on 2026-11-23 passed 77 API tests with PostgreSQL, including the versioned `rule-retrieval-v3` evaluation: 80/80 applicable cases, 100% recall, no failed contract IDs, and 20/20 safety cases. Web tests 39/39, typecheck, formatting, build, and Chromium E2E also passed. The browser run reported 25 passed and two macOS-only visual cases skipped on Linux; its FR-08 Linux visual baselines passed. The dated HTML report is in the run artifact under `test-results/fr-08-check-endorsement-eligibility/report-20261123150643/`.
