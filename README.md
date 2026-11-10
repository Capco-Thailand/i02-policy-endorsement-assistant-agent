# Policy Endorsement Assistant

Prototype monorepo for synthetic insurance policy endorsements. FR-14 provides individual demo staff sign-in, expiring sessions, assigned-policy access, and a reusable no-self-review guard. The policy pages currently show ID and status only; endorsement workflows are separate future stories. No action creates or binds coverage.

## Run locally

Use Node.js 20.9 or newer and npm.

1. Run `npm ci` from the repository root.
2. Run `npm run dev:api` and `npm run dev:web` in separate terminals.
3. Open `http://localhost:3001` and sign in with a demo account from [API development](docs/API_DEVELOPMENT.md).

Run `npm run test:api` for API authentication and access tests, `npm run test:web` for browser component tests, and `npm run build` for API and web production builds. The API runs at `http://localhost:3000`; its OpenAPI UI is at `/docs`.

The root npm workspaces are `apps/api` (Fastify), `apps/web` (Next.js App Router), and the planned `apps/ai` retrieval workspace. The product scope and stack are in [PRD](docs/PRD.md) and [ADR](docs/ADR.md).
