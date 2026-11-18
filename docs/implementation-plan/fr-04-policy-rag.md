---
title: 'FR-04 cited synthetic policy evidence'
type: feature
ticket: fr-04-retrieve-policy-details-with-rag
created: '2026-11-18'
status: built
baseline_revision: e6c2128fca3093353d1896f6b41d9f019ddacbf8
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

**Problem:** Customers cannot inspect cited source sections behind their synthetic policy details. Retrieval must not expose another customer's text or override the structured policy record.

**Approach:** Load a versioned synthetic policy corpus for the three seeded policies, retrieve bounded relevant sections after owner authorization, compare decision facts with structured records, and show cited or unresolved evidence on the existing detail page.

## Boundaries & Constraints

**Always:** Keep ownership and policy facts in the API and Neon. Return document ID, version, section ID, and excerpt for a valid citation. Keep source text untrusted and the page accessible at 320px.

**Never:** Index real or uploaded data; create policies; let retrieved text alter policy facts, eligibility, quote, draft, or binding; reveal another customer's metadata; present retrieval failures as verified emptiness.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Current source | Owner asks about dates or beneficiaries | Relevant sections and matching citation | None |
| No session / wrong owner | Policy ID and query | No corpus read | `401` / indistinguishable `404` |
| Missing, stale, conflicting source | Owned policy | Unresolved with reason, facts unchanged | No invented citation |
| Storage failure | Owned policy | Unavailable service state | Retry, no false verified result |
| Expired policy | Owner opens detail | Evidence may show | Existing request action stays unavailable |

</frozen-after-approval>

## Code Map

- `apps/api/src/db.ts`, `apps/api/sql/001_initial.sql`, `apps/api/src/seed.ts`: explicit SQL migration and transactionally seeded policies. Add a separate idempotent versioned corpus without mutating structured records.
- `apps/api/src/app.ts`: Fastify policy route uses `actorFor`, `db.policy`, `ownsPolicy`, and TypeBox responses. Add owner-checked evidence route here or a small feature plugin; authorize before retrieval.
- `apps/api/src/auth/data.ts`: structured policy shape to compare against source decision fields.
- `apps/ai/`: placeholder; house synthetic corpus and bounded retrieval logic here, behind API only.
- `apps/web/src/lib/api.ts`, `apps/web/src/lib/queries.ts`: generated OpenAPI client types and TanStack Query seams. Add typed evidence read and retry.
- `apps/web/src/policies/PolicyDetail.tsx`: existing focused facts and beneficiaries sections and active/expired action; add one meaningful evidence section, retaining the existing policy flow.
- `apps/api/src/persistence.integration.test.ts`, `apps/web/src/policies/PolicyDetail.test.tsx`, `e2e/`: existing public test seams. Reuse isolated database and browser harness.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/api/src/*evidence*.test.ts`, `apps/api/src/persistence.integration.test.ts`: write focused failing tests for idempotent corpus, bounded relevance, authorization before retrieval, missing/stale/conflict, injection, failure, and unchanged records; record red/green runs.
- [ ] `apps/ai/`, `apps/api/sql/`, `apps/api/src/db.ts`, `apps/api/src/app.ts`: implement authored fixtures, versioned storage/load, deterministic relevant section retrieval, server comparison, and validated API/OpenAPI response.
- [ ] `apps/web/src/policies/PolicyDetail.test.tsx`: write failing component tests for available/unresolved/loading/error/session/expired states and retry; record red/green runs.
- [ ] `apps/web/src/lib/api.ts`, `apps/web/src/lib/queries.ts`, `apps/web/src/policies/PolicyDetail.tsx`: implement typed query and evidence section matching UX handoff.
- [ ] `e2e/`: add browser scenarios for owner access, citations, failure boundaries and narrow viewport; capture screenshots and HTML report.
- [ ] `docs/API_DEVELOPMENT.md`, local ticket, traceability record: document contract, corpus commands, test evidence and uncovered criteria; sync Issue #97 if ticket requirements change.

**Acceptance Criteria:**
- Given a seeded synthetic database, when the corpus load repeats, then exactly one current version per seeded policy remains and structured records are unchanged.
- Given an owned policy, when the customer queries different topics, then relevant cited sections differ and carry stable source identity.
- Given missing session or unowned ID, when evidence is requested, then `401` or identical `404` occurs before corpus access.
- Given absent, old, or contradictory passages, when evidence is read, then the result is unresolved with a reason and structured facts remain authoritative.
- Given injected source instructions or storage failure, when retrieval runs, then authorization and facts remain unchanged and failure is not shown as verified evidence.
- Given the detail page at desktop or 320px, when evidence changes state, then the customer sees readable citations or actionable state messaging while FR-02 action and expired-policy restriction persist.

## Implementation Notes

## Plan Change Log

## Review Triage Log

- medium / patch — `load-corpus.ts` retains removed sections when reloading the same version; `sourceDocument` reads them and can return stale citations. Confirmed from the upsert loop and unrestricted section select. Make same-version reload compare the complete stored document and reject changed content.
- medium / patch — `load-corpus.ts` overwrites title, product ID, and section text under an existing version; a past citation can change meaning. Confirmed by both `ON CONFLICT DO UPDATE` statements. Preserve immutable versions and require a new version for changed content.

## Design Notes

Use the existing policy detail component for the page shell and facts. Extract a dedicated evidence section because it owns asynchronous states, citation display and retry; keep request action in the existing parent. Use source metadata and parsed decision fields for comparison, never execute or obey document instructions.

## Verification

**Commands:**
- Focused API and web red/green tests as each slice lands.
- `npm test`
- `npm run typecheck`
- `npm run format:check`
- `npm run build`
- `npm run test:e2e`

**Manual checks:**
- Check OpenAPI evidence schema and citation fields against the typed client; compare 320px/desktop screenshots with the UX mockup.
- Map every FR-04 acceptance bullet to passing test and dated report evidence; record gaps explicitly.

## FR-04 acceptance traceability

Verified on 2026-11-18 against an isolated synthetic PostgreSQL database. `npm test`, `npm run typecheck`, `npm run format:check`, and `npm run build` passed. Chromium E2E: 24/24 passed; [HTML report](../../test-results/fr-04-retrieve-policy-details-with-rag/report-20261118113849/e2e-20261118113849.html). The report is a local generated artifact and is not committed.

| Criterion | Evidence and expected result | Result / gap |
| --- | --- | --- |
| AC1 corpus | `apps/api/src/evidence.integration.test.ts` repeat load, immutable version tests; one current document per seeded policy, activity and policy facts unchanged | Passed 11/11 API integration suite; no live Neon check |
| AC2 retrieval | API integration owned queries; `e2e/policy-evidence.spec.ts` owner citation; different topics produce bounded sections with source IDs | Passed |
| AC3 authorization | API integration missing/foreign session before corpus access; browser foreign policy case | Passed |
| AC4 reconciliation | API integration missing, stale, conflicting, incomplete and unselected-section conflicts; browser unresolved and expired policy cases | Passed |
| AC5 hostile text/failure | API integration source instruction and contradictory passage checks; browser failure/retry | Passed for synthetic injection and simulated storage failure; no real outage drill |
| AC6 UI states | `EvidenceSection.test.tsx`, `PolicyDetail.test.tsx`, browser owner/unresolved/failure/session/expired cases, `visual.spec.ts` at 320px | Passed; screenshots attached to HTML report |
| AC7 coverage | API, component, browser and visual checks above; report includes browser screenshots | Passed for implemented seams; live Neon deployment not exercised |

Red/green slices: corpus loader missing, evidence route missing, UI heading missing, contradictory passage, conflict in an unselected section, and incomplete document each failed at its public seam before the corresponding implementation passed. Review found same-version corpus mutation and retained-section defects; both were fixed with immutable-version checks and three new integration cases, then the full verification above passed.
