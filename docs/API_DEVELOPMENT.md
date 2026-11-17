# API development

FR-01, FR-02, and FR-03 run a Fastify API on `http://localhost:3000` and a Next.js web app on `http://localhost:3001`. All accounts and policies are synthetic. Policy reads do not change coverage or connect to an insurer.

## Start

From the repository root, run `npm ci`, set server-side `DATABASE_URL` to a PostgreSQL database, run `npm run db:migrate -w apps/api` and `npm run db:seed -w apps/api`, then start `npm run dev:api` and `npm run dev:web` in separate terminals. Open `http://localhost:3001`. The browser calls `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:3000`. The API accepts credentialed browser requests from `http://localhost:3001`.

Demo accounts:

| Account ID | Password        | Linked policy                    |
| ---------- | --------------- | -------------------------------- |
| `narin`    | `NarinDemo123!` | `POL-NARIN-001`, `POL-NARIN-002` |
| `mali`     | `MaliDemo123!`  | `POL-MALI-001`                   |

Passwords are stored as salted scrypt verifiers in PostgreSQL. Sessions use random 32-byte tokens; PostgreSQL stores only their SHA-256 digests and expiry. Sessions survive API restarts and are shared across instances. Run migration and seed explicitly; rerunning seed preserves customer activity. The `pea_session` cookie is HttpOnly, SameSite=Lax, scoped to `/api`, and uses Secure when `NODE_ENV=production`. Local HTTP development does not use Secure. Do not deploy this demo account setup as production authentication.

## Contract

`GET /openapi.json` publishes the Fastify schema-derived OpenAPI contract. The checked-in `apps/web/src/lib/api-types.ts` is generated from that contract with `openapi-typescript`; regenerate it after route schema changes. JSON requests and responses:

FR-06 adds `POST /api/policies/:policyId/mock-identity` for a signed-in customer who owns an active policy. The request body contains one documented synthetic `scenario` (`all-pass`, `identity-mismatch`, `id-expired`, `liveness-failed`, or `liveness-inconclusive`). A `200` response contains `status`, `reason`, and `disclosure`; `401`, `404`, and `409` follow the existing session, ownership, and expired-policy boundaries. The result is only a simulated identity check. Run the database migration before using this route because audit events now include structured metadata.

| Route                                   | Request                                       | Success                                                                                                                          | Authentication failure                                                                                                                |
| --------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/auth/sign-in`                | `{ "accountId": string, "password": string }` | `200 { "actor": { "id", "accountId", "name" }, "expiresAt": number }` and session cookie                                         | `401 { "error": "UNAUTHORIZED" }` for invalid credentials                                                                             |
| `GET /api/auth/session`                 | Session cookie                                | `200` with actor and Unix expiry time in milliseconds                                                                            | `401 { "error": "UNAUTHORIZED" }`                                                                                                     |
| `POST /api/auth/sign-out`               | Session cookie                                | `204`, cookie cleared                                                                                                            | `401 { "error": "UNAUTHORIZED" }`                                                                                                     |
| `GET /api/policies`                     | Session cookie                                | `200 { "policies": [{ "id", "label", "status" }] }` for linked policies                                                          | `401 { "error": "UNAUTHORIZED" }`                                                                                                     |
| `GET /api/policies/:policyId`           | Session cookie                                | `200 { "policy": { "id", "label", "status", "effectiveDate", "expiryDate", "paymentFrequency", "beneficiaries" } }`              | `401` for session failure; identical `404 { "error": "NOT_FOUND" }` for unknown and unowned IDs                                       |
| `POST /api/policies/:policyId/requests` | Session cookie and one strict change body     | `200 { "request": { "id", "requesterId", "policyId", "changeType", "requestedEffectiveDate", "createdAt", ...selectedFields } }` | `401` session; identical `404` unknown/unowned; `409 { "error": "POLICY_EXPIRED" }` expired; `400 { "error": string }` invalid fields |

All protected routes derive the actor from the validated session. Client identity or role fields have no authority. Authenticated actions create actor/action/time audit records without credentials or session tokens. The reusable `mayDecideProposal` guard checks the proposal actor and linked policy; FR-11 must call it from its decision endpoint. That route does not exist in FR-01.

Policy `status` is `ACTIVE` or `EXPIRED`. Dates are ISO calendar dates (`YYYY-MM-DD`); `paymentFrequency` is `MONTHLY` or `ANNUAL`; each beneficiary has `name` and numeric `allocationPercent`. Narin's second policy is expired; Mali's distinct policy is active. The web app presents status and facts as read-only data. Active policies offer a non-binding request action.

## Checks

Run `npm test`, `npm run typecheck`, `npm run build -w apps/web`, `npm run format:check`, and `npm run test:e2e`. API integration tests use Fastify injection with a separate synthetic `TEST_DATABASE_URL`; never point it to an application database. To reset test state, drop and recreate only that disposable test database with PostgreSQL admin tools, then run `DATABASE_URL="$TEST_DATABASE_URL" npm run db:migrate -w apps/api` and `DATABASE_URL="$TEST_DATABASE_URL" npm run db:seed -w apps/api`. Set both variables when running `npm test`. CI provisions a fresh `pea_test` database for each run. Web tests exercise components with simulated API responses. Browser E2E builds the web app locally, starts the API and production web server, runs Chromium against both, and writes a dated Playwright HTML report under `test-results/<ticket-id>/`; `test-results/index.html` opens the latest run across tickets. Install Chromium locally once with `npx playwright install chromium`. CI uploads each implementation PR's report as an artifact, including failed runs. Desktop and 375px visual comparisons use reviewed macOS Chromium baselines; the Linux CI job skips those two visual tests while its functional browser tests and screenshots still run.

## FR-02 request body

Send exactly one change type with `requestedEffectiveDate` as a real `YYYY-MM-DD` calendar date. `BENEFICIARY` requires a complete `beneficiaries` replacement array with non-empty names, positive numeric `allocationPercent`, and a total of exactly 100. `ADDRESS` requires non-empty `correspondenceAddress`. `PAYMENT_FREQUENCY` requires `paymentFrequency` set to `MONTHLY`, `QUARTERLY`, `SEMI_ANNUAL`, or `ANNUAL`. `ACCIDENTAL_DEATH_RIDER` requires `riderAction` set to `ADD` or `REMOVE`. Other type fields and client identity claims are rejected. Responses contain only the selected change's data. Requests and their audit events are written in one PostgreSQL transaction, separate from policy facts; restart preserves them. Recording a request does not approve a change, quote, draft, or bind coverage.
