# Policy Endorsement Assistant

Synthetic insurance endorsement prototype with customer sign-in, linked policies, non-binding change requests, and cited policy evidence. No live insurer system is connected and no coverage can be bound.

## Run locally

Install from the root with `npm ci`. Set `DATABASE_URL` to a synthetic PostgreSQL database with pgvector installed. Run `npm run db:migrate -w apps/api`, `npm run db:seed -w apps/api`, `npm run db:load-corpus -w apps/api`, and `npm run db:load-rules -w apps/api`, then start `npm run dev:api` and `npm run dev:web` in separate terminals and open `http://localhost:3001`. Demo accounts are `narin` / `NarinDemo123!` and `mali` / `MaliDemo123!`. They have separate synthetic policy links. See [API development](docs/API_DEVELOPMENT.md) for contracts, session settings, and configuration.

Run `npm test`, `npm run typecheck`, `npm run build -w apps/web`, `npm run format:check`, and `npm run test:e2e` to verify the implementation. The root lockfile covers the `apps/api`, `apps/web`, and `apps/ai` workspaces.

## Ticket workflow

The local Markdown [FR-01 requirement](docs/tickets/fr-01-authenticate-customers.md) is the build specification. See [ticket workflow](docs/TICKETING.md) for delivery tracking.
