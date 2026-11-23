# FR-13 — Run the System with Docker Compose

**Title:** [Story] Run the System with Docker Compose
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-13
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed Medium — faulty local setup could hide integration failures or use wrong data.
**State:** Backlog draft

## Summary and objective

Start the frontend, API, and internal calculator service with Docker Compose; connect the API to hosted Neon PostgreSQL containing seeded synthetic application data and vector indexes.

## User story or requirement

System requirement: Start the frontend, API, and FR-09 calculator through Docker Compose, with the API using hosted Neon PostgreSQL for application persistence and vector retrieval.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Run the frontend, API, and internal FR-09 calculator with Docker Compose; the API connects to a configured Neon database with seeded synthetic application data and versioned vector corpora. Load the versioned synthetic rating fixtures required by the calculator.
- [ ] Provide frontend, API, and calculator Dockerfiles, a root `compose.yaml`, health checks, and development environment configuration. Run repeatable corpus and rating-fixture load commands without requiring a separate RAG container.
- [ ] The API owns authorization, writes, vector retrieval, and calls to the calculator's versioned internal HTTP contract. The calculator is reachable from the API network, not exposed as a browser-facing port; the browser does not access it or storage directly.
- [ ] A healthy calculator accepts a known FR-09 synthetic fixture and returns the expected deterministic quote through the API. If the calculator is unavailable or unhealthy, the API reports a calculation service failure and creates no proposal.
- [ ] Compose does not start a second application database. Missing or invalid Neon configuration fails clearly; no database credential is exposed to the browser or committed to the repository.

## Scope and out of scope

In scope:
- The behavior in the draft criteria above, using synthetic data.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Further exclusions to confirm during refinement.

## Dependencies

- The [Neon migration ticket](../tickets/chore-migrate-persistence-to-neon.md) provides the application schema, seed process, and connection configuration before this Compose integration is built.
- FR-04 uses pgvector in Neon through the API; FR-05 adds the rule corpus and retrieval. FR-09 defines the separate internal HTTP calculator and synthetic rating fixtures; FR-13 packages and connects that service.

## Related subtasks

None identified; confirm during refinement.

## Accepted decisions and readiness
- 2026-11-17: Use hosted Neon PostgreSQL for application persistence; Compose runs the application services, not a local PostgreSQL/pgvector container. See the [ADR](../ADR.md).
- 2026-11-23: Align Compose with the ADR's API-owned pgvector retrieval; a separate RAG container is not required. Run the FR-09 calculator as a separate internal Compose service reached only through the API.

- Open question: Confirm precise inputs, error cases, dependencies, and any UX handoff before implementation.
- Status: Backlog draft; not ready for implementation or Issue creation.

## UX handoff references

- N/A — infrastructure-only feature; no customer-facing UI or UX handoff is required.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
