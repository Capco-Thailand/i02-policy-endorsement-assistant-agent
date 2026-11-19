---
title: 'FR-04 semantic policy evidence'
type: feature
ticket: fr-04-retrieve-policy-details-with-rag
created: '2026-11-19'
status: draft
baseline_revision: 824476927f537014121443d64d2848ad28591b66
route: full
route_source: auto
risk: high
review: thorough
review_source: pinned
lenses_ran: []
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
- [ ] `apps/api/src/evidence.integration.test.ts`: write and run failing tests for owner-first access, cited paraphrase retrieval, selected-version isolation, idempotent load, stale/missing/conflicting evidence, hostile text and storage failure.
- [ ] `apps/ai/corpus/policies.json`, `apps/ai/retrieval.ts`, `apps/api/sql/002_policy_corpus.sql`, `apps/api/src/load-corpus.ts`, `apps/api/src/db.ts`, `apps/api/src/evidence.ts`, `apps/api/src/app.ts`: enable pgvector, implement the corpus, versioned embeddings in a `vector(n)` column, SQL policy/version filtering and cosine ranking, reconciliation and validated route; rerun focused tests green after each slice.
- [ ] `apps/web/src/policies/EvidenceSection.test.tsx`: write and run failing tests for available, loading, unresolved, failure, retry and session-ended states.
- [ ] `apps/web/src/lib/api.ts`, `apps/web/src/lib/queries.ts`, `apps/web/src/policies/EvidenceSection.tsx`, `apps/web/src/policies/PolicyDetail.tsx`: add typed evidence reads and accessible citation display; rerun component tests green.
- [ ] `e2e/policy-evidence.spec.ts`: add browser cases for owner access, foreign-policy rejection, unresolved, failure/retry, expired display and 320px screenshots.
- [ ] `docs/API_DEVELOPMENT.md`, `docs/ADR.md`, `README.md`, this plan: document the vector store, loading, API contract, verification and uncovered checks.

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

## Design Notes

Keep the evidence section after structured facts and before the request action per the reviewed UX handoff. Evidence is plain text data. Keep the existing active/expired action gate.

## Verification

**Commands:** `npm test`; `npm run typecheck`; `npm run format:check`; `npm run build`; `npm run test:e2e`.

**Manual checks:** Compare the generated HTML report's desktop and 320px screenshots to the reviewed mockup, and record any uncovered deployment checks.

## FR-04 acceptance traceability

| Criterion | Planned evidence | Latest result / gap |
| --- | --- | --- |
| Corpus | API integration: load twice, immutable versions and vectors, unchanged policy/activity tables | Pending |
| Retrieval | API integration: known citation, semantically related paraphrase, different concept, bound and selected version | Pending |
| Authorization | API integration and browser: `401`, same `404`, corpus spy/read count zero | Pending |
| Reconciliation | API integration: missing, stale, conflicting, expired, unchanged structured record | Pending |
| Hostile text / failure | API integration: prompt-like source and query; failed storage; no audit or fact change | Pending |
| UI states | Component and browser: loading, available, unresolved, service failure, session ended, retry, 320px | Pending |
| Coverage | Commands and dated browser HTML report with criterion mapping | Pending |
