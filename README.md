# Policy Endorsement Assistant

Prototype monorepo for synthetic insurance policy endorsements. It currently contains an API foundation and a minimal web shell. Policy flows are tracked in GitHub issues.

## Workspaces

- `apps/api` — TypeScript Fastify API and OpenAPI documentation.
- `apps/web` — TypeScript React/Vite shell; policy screens are future work.
- `apps/ai` — reserved for synthetic data and retrieval code when needed.

Run `npm ci` from the repository root. Use `npm run dev:api` and `npm run dev:web` in separate terminals, or `podman compose up --build -d` to run both in containers. The web shell is at `http://localhost:5173`; API health and docs are at `http://localhost:3000/health` and `http://localhost:3000/docs`. Run `npm run build` to build implemented workspaces. See [API development](docs/API_DEVELOPMENT.md) for API details.
