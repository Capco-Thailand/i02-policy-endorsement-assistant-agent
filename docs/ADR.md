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
- Keep retrieval work in `apps/ai`, behind the API. FR-04 and FR-05 will define their retrieval storage and any pgvector use separately; Neon application persistence does not imply that RAG is implemented.

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

2026-11-23: The product flow now requires an assistant assessment grounded in vector-retrieved policy wording and endorsement rules. Fastify continues to enforce ownership, active status, structured-field reconciliation, tool access, and persistence. A separate deterministic internal HTTP calculation service supplies revised premium or benefit values when the assessed change requires them. FR-09 owns its versioned contract and synthetic rating fixtures; FR-13 runs it as an internal Compose service. This supersedes the earlier description of backend-only eligibility decisions.

The API uses the `pg` server-side client, explicit SQL migration, and synthetic seed commands. The browser receives data only through Fastify. Session token digests, requests, and audit events persist in PostgreSQL.
