# ADR-001: Application stack and API boundary

**Status:** Accepted

**Date:** 2026-11-10

**Scope:** Policy Endorsement Assistant prototype

## Context

The frontend, API, and retrieval workspaces need one consistent stack and contract boundary. The product uses synthetic insurance data and must keep authorization, eligibility, quoting, and draft decisions on the server. FR-01 through FR-03 use server-side PostgreSQL persistence described in the [Neon ticket](tickets/chore-migrate-persistence-to-neon.md).

## Decision

- Build `apps/web` with React, Next.js App Router, and shadcn/ui. Use `@tanstack/react-query` for client-side server state and API reads or mutations; use Next.js Server Components for appropriate server-rendered data fetching.
- Build `apps/api` with TypeScript and Fastify. Fastify owns the REST API, authentication, policy access, workflow decisions, and writes.
- Define request and response schemas at Fastify route boundaries. Derive OpenAPI documentation and frontend client types from those schemas so runtime validation and TypeScript contracts stay aligned.
- Keep RAG retrieval behind the API. Authorize policy access before retrieval; verify decision fields against structured records. The browser does not access RAG or storage directly.
- Use hosted Neon PostgreSQL for synthetic customers, policies, sessions, endorsement requests, and audit events. The API workspace owns database connections, migrations, and seeding; Fastify owns application reads, authorization, and writes. The browser never connects directly.
- Keep the synthetic FR-04 corpus and fixed domain encoder in `apps/ai`; `apps/api` owns corpus loading, filtered vector queries, reconciliation, and the public evidence route. FR-05 rule retrieval remains separately scoped.

## Consequences

- Next.js and Fastify run as separate services; local development reserves port 3001 for Next.js and port 3000 for Fastify.
- The web app displays server results and does not recalculate eligibility or premiums.
- Changes to route schemas require regenerated or rederived client types and updated API consumers.
- Neon credentials stay in server-side configuration. Local and CI tests use isolated synthetic databases. FR-13 Compose starts the application services and connects them to Neon rather than launching a local PostgreSQL service.
- The API requires database configuration and connectivity at startup. Sessions, requests, and audit events survive API restarts; migrations and synthetic seeding run explicitly.
- The planned Next.js app replaced the earlier Vite shell direction.

## Alternatives considered

- **React with Vite:** simpler frontend runtime, but the selected stack is Next.js App Router.
- **FastAPI:** appeared in an earlier PRD draft; TypeScript/Fastify matches the selected API stack and supports one language across the web and API workspaces.
- **Local PostgreSQL container:** was planned for the MVP, but hosted Neon PostgreSQL is now the selected application database. Compose still runs the application services.

## Decision update
2026-11-17: Selected Neon PostgreSQL for all API-owned persistence. The [migration ticket](tickets/chore-migrate-persistence-to-neon.md) owns the implementation; this ADR records the target architecture.

This record captures the stack decision. Product behavior and safety boundaries remain in [PRD.md](PRD.md); implementation rules remain in [CODING_STANDARDS.md](CODING_STANDARDS.md).

The API uses the `pg` server-side client, explicit SQL migration, and synthetic seed commands. The browser receives data only through Fastify. Session token digests, requests, and audit events persist in PostgreSQL.

2026-11-19: FR-04 uses pgvector in the same PostgreSQL database as the structured synthetic policy records. A versioned document selection and B-tree document filter precede exact cosine ranking over eight-dimensional, normalized `policy-concepts-v1` vectors. The small corpus does not warrant an approximate index. The API authorizes the policy before reading corpus tables and reconciles status, dates, payment frequency, and beneficiaries with structured records before issuing a citation. Unknown queries, missing or stale documents, and contradictions remain unresolved. Storage errors return a separate service failure. No external embedding service or additional retrieval server is used for FR-04.
