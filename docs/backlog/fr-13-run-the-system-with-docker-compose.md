# FR-13 — Run the System with Docker Compose

**State:** Backlog draft
**GitHub Issue:** Not filed
**Feature ID:** FR-13
**Product context:** [PRD](../PRD.md)

## Outcome

Start FE, BE, RAG, and PostgreSQL/pgvector with seeded synthetic data.

## Requirements to refine

- Confirm the user or system outcome, business rules, required inputs, error cases, and safety boundaries before implementation.
- Add observable acceptance criteria using [TICKET_TEMPLATE.md](../TICKET_TEMPLATE.md) and the matching GitHub Issue form.
- Preserve traceability to FR-13 and link any relevant UX or architecture documents.

## Known product rules

- Run the frontend, backend, RAG service, and PostgreSQL/pgvector with seeded synthetic data.
- Keep application and storage boundaries consistent with `docs/ADR.md`.
- Provide separate frontend, backend, and RAG Dockerfiles, a root `compose.yaml`, health checks, and development environment configuration.
- The backend owns writes and internal RAG calls; the browser does not access RAG or storage directly.

## Dependencies and open questions

- Determine prerequisites and sequencing with the Product Owner.
