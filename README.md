# Policy Endorsement Assistant

Prototype monorepo for synthetic insurance policy endorsements. Policy flows are tracked in GitHub issues. The application workspaces are planned; this checkout does not yet contain their implementation files.

## Workspaces

- `apps/api` — planned TypeScript Fastify API with schema-derived OpenAPI contracts.
- `apps/web` — planned React/Next.js App Router frontend with shadcn/ui.
- `apps/ai` — planned synthetic data and RAG retrieval code.

Once the workspaces are implemented, install dependencies from the repository root and run the API and web development scripts there. The target stack and container layout are in [the PRD](docs/PRD.md). See [API development](docs/API_DEVELOPMENT.md) for the planned API contract.

## Ticket workflow

The local Markdown ticket is the build specification. Commit and merge a ticket/UX PR first; automation creates its GitHub Issue after merge. Before building, run `npm run ticket:preflight -- docs/tickets/<file>.md`; use `npm run ticket:sync -- docs/tickets/<file>.md` to refresh an Issue's automated PR list. See [ticket workflow](docs/TICKETING.md) for PR fields, documentation updates, and human review gates.
