# Policy Endorsement Assistant

Prototype monorepo for synthetic insurance policy endorsements. FR-01 provides customer demo sessions and protected reads for linked synthetic policies. The app never connects to insurer systems or changes coverage.

## Workspaces

- `apps/api` — TypeScript Fastify API for sessions, policy ownership, and schema-derived OpenAPI at `/docs`.
- `apps/web` — React and Next.js App Router sign-in and protected policy pages.
- `apps/ai` — reserved for future synthetic data and retrieval work; it has no runtime dependencies yet.

## Run locally

Use Node.js 20.9 or newer. From the repository root, install the single npm workspace lockfile:

```sh
npm ci
```

Start the API and web app in separate terminals:

```sh
npm run dev:api
npm run dev:web
```

The API listens on `http://localhost:3000`; Next.js listens on `http://localhost:3001`. Browse to `http://localhost:3001/sign-in`. API and web tests run with `npm run test:api` and `npm run test:web`; `npm run build` builds both apps, and `npm run format:check` checks application formatting.

## Demo accounts

| Account ID   | Password              | Display name |
| ------------ | --------------------- | ------------ |
| `demo-alice` | `alice-demo-password` | Alice Morgan |
| `demo-bob`   | `bob-demo-password`   | Bob Chen     |

These fixed credentials are for local synthetic demonstrations only. Sessions use an opaque HttpOnly cookie and expire after 30 minutes. Sessions are held in memory; restarting the API revokes them. See [API development](docs/API_DEVELOPMENT.md) for route and configuration details.

## Ticket workflow

The local Markdown ticket is the build specification. Commit and merge a ticket/UX PR first; automation creates its GitHub Issue after merge. Before building, run `npm run ticket:preflight -- docs/tickets/<file>.md`; use `npm run ticket:sync -- docs/tickets/<file>.md` to refresh an Issue's automated PR list. See [ticket workflow](docs/TICKETING.md) for PR fields, documentation updates, and human review gates.
