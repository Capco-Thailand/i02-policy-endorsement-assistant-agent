# ADR-001: Application stack and API boundary

**Status:** Accepted

**Date:** 2026-11-10

**Scope:** Policy Endorsement Assistant prototype

## Context

The frontend, API, and retrieval workspaces need one consistent stack and contract boundary. The product uses synthetic insurance data and must keep authorization, eligibility, quoting, and draft decisions on the server. The repository currently has workspace declarations but no application implementation files in this checkout.

## Decision

- Build `apps/web` with React, Next.js App Router, and shadcn/ui. Use `@tanstack/react-query` for client-side server state and API reads or mutations; use Next.js Server Components for appropriate server-rendered data fetching.
- Build `apps/api` with TypeScript and Fastify. Fastify owns the REST API, authentication, policy access, workflow decisions, and writes.
- Define request and response schemas at Fastify route boundaries. Derive OpenAPI documentation and frontend client types from those schemas so runtime validation and TypeScript contracts stay aligned.
- Keep RAG retrieval behind the API. Authorize policy access before retrieval; verify decision fields against structured records. The browser does not access RAG or storage directly.
- Keep synthetic data and retrieval work in `apps/ai`; use PostgreSQL with pgvector for the planned containerized MVP.

## Consequences

- Next.js and Fastify run as separate services; local development reserves port 3001 for Next.js and port 3000 for Fastify.
- The web app displays server results and does not recalculate eligibility or premiums.
- Changes to route schemas require regenerated or rederived client types and updated API consumers.
- The planned Next.js app replaces the earlier Vite shell direction. No application migration is required in this checkout because the workspace implementation files are absent.

## Alternatives considered

- **React with Vite:** simpler frontend runtime, but the selected stack is Next.js App Router.
- **FastAPI:** appeared in an earlier PRD draft; TypeScript/Fastify matches the selected API stack and supports one language across the web and API workspaces.

This record captures the stack decision. Product behavior and safety boundaries remain in [PRD.md](PRD.md); implementation rules remain in [CODING_STANDARDS.md](CODING_STANDARDS.md).
