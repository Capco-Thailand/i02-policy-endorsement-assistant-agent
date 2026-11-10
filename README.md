# Policy Endorsement Assistant

Prototype monorepo for synthetic insurance policy endorsements. Policy flows are tracked in GitHub issues. The application workspaces are planned; this checkout does not yet contain their implementation files.

## Workspaces

- `apps/api` — planned TypeScript Fastify API with schema-derived OpenAPI contracts.
- `apps/web` — planned React/Next.js App Router frontend with shadcn/ui.
- `apps/ai` — planned synthetic data and RAG retrieval code.

Once the workspaces are implemented, install dependencies from the repository root and run the API and web development scripts there. The target stack and container layout are in [the PRD](docs/PRD.md). See [API development](docs/API_DEVELOPMENT.md) for the planned API contract.
