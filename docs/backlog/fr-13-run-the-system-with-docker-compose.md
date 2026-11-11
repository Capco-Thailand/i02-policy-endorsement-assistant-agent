# FR-13 — Run the System with Docker Compose

**Title:** [Story] Run the System with Docker Compose
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-13
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed Medium — faulty local setup could hide integration failures or use wrong data.
**State:** Backlog draft

## Summary and objective

Start FE, BE, RAG, and PostgreSQL/pgvector with seeded synthetic data.

## User story or requirement

System requirement: Start FE, BE, RAG, and PostgreSQL/pgvector with seeded synthetic data.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Run the frontend, backend, RAG service, and PostgreSQL/pgvector with seeded synthetic data.
- [ ] Keep application and storage boundaries consistent with `docs/ADR.md`.
- [ ] Provide separate frontend, backend, and RAG Dockerfiles, a root `compose.yaml`, health checks, and development environment configuration.
- [ ] The backend owns writes and internal RAG calls; the browser does not access RAG or storage directly.

## Scope and out of scope

In scope:
- The behavior in the draft criteria above, using synthetic data.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Further exclusions to confirm during refinement.

## Dependencies

- Determine prerequisites and sequencing with the Product Owner.

## Related subtasks

None identified; confirm during refinement.

## Accepted decisions and readiness

- Open question: Confirm precise inputs, error cases, dependencies, and any UX handoff before implementation.
- Status: Backlog draft; not ready for implementation or Issue creation.

## UX handoff references

- Not yet identified; add design documents and browser-viewable mockups if this ticket includes UI.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
