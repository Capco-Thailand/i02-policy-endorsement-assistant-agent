---
title: 'FR-04 semantic policy evidence'
type: feature
ticket: fr-04-retrieve-policy-details-with-rag
created: '2026-11-19'
status: built
baseline_revision: 824476927f537014121443d64d2848ad28591b66
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - docs/ADR.md
  - _bmad-output/initiative-customer-authentication/ux-fr-04/DESIGN.md
  - _bmad-output/initiative-customer-authentication/ux-fr-04/EXPERIENCE.md
  - design/page/policy-evidence.html
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** An owner cannot inspect cited synthetic evidence for policy facts. Retrieval must not expose another owner's content, and policy evidence must support semantic vector queries.

**Approach:** Add a versioned synthetic corpus, owner-checked API, and detail-page evidence section. Create local domain-semantic embeddings and store them as `pgvector` values in the application PostgreSQL database. Filter authorized policy and selected document version in SQL, rank with pgvector cosine distance, then reconcile all decision fields with structured policy facts.

## Boundaries & Constraints

**Always:** Authorize before corpus reads; keep structured Neon facts authoritative; keep source instructions inert; return source IDs, version, section ID, and excerpt only for reconciled evidence; report storage failure separately. Use synthetic corpus only.

**Never:** Index uploads or real data; let retrieved content decide eligibility, quote, draft, or binding; reveal a foreign policy's product or document metadata; silently treat unknown semantic queries as verified evidence.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Owner asks a synonym query | “When does protection begin?” | Cited dates section from current owned document | No error |
| Owner asks another concept | “Who receives the benefit?” | Beneficiary section, bounded citations | No error |
| Missing session / foreign policy | Policy ID and query | No corpus read | `401` / same `404` as unknown policy |
| Missing, stale, contradictory document | Owned policy | Unresolved reason; facts unchanged | No invented citation |
| Vector store failure | Owned policy | Unavailable service state | Retry; no empty verified result |

</frozen-after-approval>

## Code Map

- `apps/api/src/app.ts`, `db.ts`, `sql/`: owner-check route, `CREATE EXTENSION IF NOT EXISTS vector`, corpus migration and filtered pgvector cosine query.
- `apps/ai/`: versioned synthetic documents and deterministic domain-semantic embedding. The four supported fact concepts are the bounded retrieval domain; no external model or network call is needed.
- `apps/api/src/evidence.ts`: reconcile every decision field before returning citations.
- `apps/web/src/lib/`, `apps/web/src/policies/`: typed API read, query states, citations and retry.
- `e2e/`, API integration and component tests: public boundary checks and browser report.

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/src/evidence.integration.test.ts`: write and run failing tests for owner-first access, cited paraphrase retrieval, selected-version isolation, idempotent load, stale/missing/conflicting evidence, hostile text and storage failure.
- [x] `apps/ai/corpus/policies.json`, `apps/ai/retrieval.ts`, `apps/api/sql/002_policy_corpus.sql`, `apps/api/src/load-corpus.ts`, `apps/api/src/db.ts`, `apps/api/src/evidence.ts`, `apps/api/src/app.ts`: enable pgvector, implement the corpus, versioned embeddings in a `vector(n)` column, SQL policy/version filtering and cosine ranking, reconciliation and validated route; rerun focused tests green after each slice.
- [x] `apps/web/src/policies/EvidenceSection.test.tsx`: write and run failing tests for available, loading, unresolved, failure, retry and session-ended states.
- [x] `apps/web/src/lib/api.ts`, `apps/web/src/lib/queries.ts`, `apps/web/src/policies/EvidenceSection.tsx`, `apps/web/src/policies/PolicyDetail.tsx`: add typed evidence reads and accessible citation display; rerun component tests green.
- [x] `e2e/policy-evidence.spec.ts`: add browser cases for owner access, foreign-policy rejection, unresolved, failure/retry, expired display and 320px screenshots.
- [x] `docs/API_DEVELOPMENT.md`, `docs/ADR.md`, `README.md`, this plan: document the vector store, loading, API contract, verification and uncovered checks.

**Acceptance Criteria:**
- Given three seeded policies, when the corpus loads twice, then each has one current immutable version with indexed vectors and no structured or historical record changes.
- Given an owned policy, when the customer asks two distinct paraphrased questions, then each returns at most three citations from the selected version and ranks the relevant concept without relying on exact source words.
- Given no session or an unknown/foreign policy, when evidence is requested, then the API returns `401` or indistinguishable `404` before any corpus read.
- Given matching, missing, stale, contradictory or failed source reads, when evidence is requested, then the response distinguishes available, unresolved and unavailable without changing policy facts or request eligibility.
- Given the existing detail page at 320px, when evidence loads or fails, then the customer sees readable citations or a distinct actionable state with keyboard access and no coverage claim.

## Implementation Notes

Use a fixed, versioned policy-domain concept encoder (status, dates, payment, beneficiaries, plus context dimensions) to produce normalized vectors from text. Enable `pgvector` in the migration and store each embedding in a `vector(n)` column with policy/document/version/section metadata. Use a B-tree index for the policy and version filter, then exact pgvector cosine ordering (`<=>`) and a fixed limit within that filtered set. Exact search keeps recall predictable for the tiny corpus; an approximate HNSW index is unnecessary. This supports semantic paraphrases within the documented policy domain, not arbitrary-language retrieval. Record the encoder version with each vector and reject a mismatched index instead of ranking stale embeddings. Migration and integration tests must fail clearly if the test or target PostgreSQL instance lacks pgvector.

## Plan Change Log

## Review Triage Log

- `medium / patch` `apps/ai/retrieval.ts`: `end\w*` also matches “endorsement,” so an unsupported question can receive a dates citation. Narrow the date vocabulary and test the unsupported question.
- `high / patch` `apps/api/src/evidence.ts`: an excerpt that negates the correct date strings passes the current date check and can be labeled matching. Reject a demonstrated negated source and test unresolved output.
- `high / patch` `apps/api/src/evidence.ts`: the same negation defect also affects status excerpts; a source saying “not active” still yielded an available citation. Reject negation across all four supported fact concepts; the focused test failed before and passed after the fix.
- `high / patch` `apps/api/src/app.ts` and `db.ts`: selection can change between document reconciliation and ranking because the second read selects by policy again. Bind ranking to the reconciled document ID and return no citation if that ID is no longer selected; test the intervening change.

## Design Notes

Keep the evidence section after structured facts and before the request action per the reviewed UX handoff. Evidence is plain text data. Keep the existing active/expired action gate.

## Verification

**Commands:** `npm test`; `npm run typecheck`; `npm run format:check`; `npm run build`; `npm run test:e2e`.

**Manual checks:** Compare the generated HTML report's desktop and 320px screenshots to the reviewed mockup, and record any uncovered deployment checks.

**2026-11-19 result:** `npm test`, `npm run typecheck`, `npm run format:check`, `npm run build`, and the full `npm run test:e2e` passed against an isolated local PostgreSQL 17 database with pgvector. Browser: 21/21 Chromium cases passed; [dated HTML report](../../test-results/fr-04-semantic-rag/report-20261119111326/e2e-20261119111326.html). Desktop and 320px captures were inspected against the reviewed evidence mockup; no horizontal overflow at 320px. Red/green additions covered missing product metadata (`product_id` absent), unsupported endorsement query (dates citation), negated source facts (available citation), and selected-version change between reads (unreconciled citation). Hosted Neon deployment and extension provisioning remain unchecked.

## FR-04 acceptance traceability

| Criterion | Planned evidence | Latest result / gap |
| --- | --- | --- |
| Corpus | API integration: load twice, immutable versions and vectors, stable product IDs, unchanged policy/activity tables | Passed: `evidence.integration.test.ts` validates three current versions with the required product IDs, four indexed sections each, immutable reload, and unchanged preexisting policy/activity rows. |
| Retrieval | API integration: known citation, semantically related paraphrase, different concept, bound and selected version | Passed: dates and beneficiary paraphrases rank the expected section; one citation from the selected version. |
| Authorization | API integration and browser: `401`, same `404`, corpus spy/read count zero | Passed: missing session `401`, foreign and unknown `404` identical, both corpus methods uncalled; browser confirms foreign page unavailable. |
| Reconciliation | API integration: missing, stale, conflicting, expired, unchanged structured record | Passed: missing document, stale snapshot or encoder, contradictory fact or excerpt, and expired read; no citation on unresolved results. |
| Hostile text / failure | API integration: prompt-like source and query; failed storage; no audit or fact change | Passed: hostile source remains text, unsupported query unresolved, storage exception `503`; structured policy row unchanged. No evidence-read audit writes occur. |
| UI states | Component and browser: loading, available, unresolved, service failure, session ended, retry, 320px | Passed: component 4/4 and browser 3/3; 320px evidence screenshot attached to the report. |
| Coverage | Commands and dated browser HTML report with criterion mapping | Passed: all five commands; full Chromium 21/21. Hosted Neon provisioning is not covered locally. |
