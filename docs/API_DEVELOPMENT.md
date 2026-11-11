# API development

The planned API uses TypeScript and Fastify. Route schemas validate requests and responses and produce OpenAPI documentation and frontend client types. This checkout does not yet contain the API implementation.

## Local

Once implemented, install from the repository root and run the API through the root workspace script. Reserve port 3000 for Fastify and port 3001 for the Next.js development server so both can run locally.

## Podman Compose

The planned Compose setup exposes Fastify on port 3000 and Next.js on port 3001. The browser calls only the Fastify REST API; it does not access RAG or the database directly.

The planned API exposes `GET /health`, Swagger UI at `/docs`, and OpenAPI JSON at `/docs/json`. Route schemas should keep runtime validation, documentation, and client types aligned.

## Synthetic policy API

The earlier API plan named these synthetic fixtures and routes; they are not implemented in this checkout:

- `demo-alice` owns `SYN-POL-1001` (active) and `SYN-POL-1002` (expired).
- `demo-bob` owns `SYN-POL-2001` (active).
- `demo-empty` has no policies.

The in-memory records and token-to-user mapping are deterministic fixtures, not authentication. Missing or invalid tokens return `401`. A policy that is missing or belongs to another user returns the same `404`. Initiation returns `204` for an owned active policy and `409` for an owned expired policy. It never creates a draft. Eligibility uses the stored status even when its dates disagree. Monetary values are decimal strings to preserve their exact values.

Use synthetic data only. This setup does not connect to insurer systems or create endorsements.
