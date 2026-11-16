# API development

FR-01 runs a Fastify API on `http://localhost:3000` and a Next.js web app on `http://localhost:3001`. All accounts and policies are synthetic. No route changes coverage or connects to an insurer.

## Start

From the repository root, run `npm ci`, then start `npm run dev:api` and `npm run dev:web` in separate terminals. Open `http://localhost:3001`. The browser calls `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:3000`. The API accepts credentialed browser requests from `http://localhost:3001`.

Demo accounts:

| Account ID | Password | Linked policy |
| --- | --- | --- |
| `narin` | `NarinDemo123!` | `POL-NARIN-001` |
| `mali` | `MaliDemo123!` | `POL-MALI-001` |

Passwords are hashed with scrypt in process memory. Sessions are random 32-byte tokens stored in the API process and expire after 30 minutes. Restarting the API invalidates every session. The `pea_session` cookie is HttpOnly, SameSite=Lax, scoped to `/api`, and uses Secure when `NODE_ENV=production`. Local HTTP development does not use Secure. Do not deploy this demo account setup as production authentication.

## Contract

`GET /openapi.json` publishes the Fastify schema-derived OpenAPI contract. The checked-in `apps/web/src/lib/api-types.ts` is generated from that contract with `openapi-typescript`; regenerate it after route schema changes. JSON requests and responses:

| Route | Request | Success | Authentication failure |
| --- | --- | --- | --- |
| `POST /api/auth/sign-in` | `{ "accountId": string, "password": string }` | `200 { "actor": { "id", "accountId", "name" }, "expiresAt": number }` and session cookie | `401 { "error": "UNAUTHORIZED" }` for invalid credentials |
| `GET /api/auth/session` | Session cookie | `200` with actor and Unix expiry time in milliseconds | `401 { "error": "UNAUTHORIZED" }` |
| `POST /api/auth/sign-out` | Session cookie | `204`, cookie cleared | `401 { "error": "UNAUTHORIZED" }` |
| `GET /api/policies` | Session cookie | `200 { "policies": [{ "id", "label" }] }` for linked policies | `401 { "error": "UNAUTHORIZED" }` |
| `GET /api/policies/:policyId` | Session cookie | `200 { "policy": { "id", "label" } }` | `401` for session failure; identical `404 { "error": "NOT_FOUND" }` for unknown and unowned IDs |

All protected routes derive the actor from the validated session. Client identity or role fields have no authority. Authenticated actions create actor/action/time audit records without credentials or session tokens. The reusable `mayDecideProposal` guard checks the proposal actor and linked policy; FR-11 must call it from its decision endpoint. That route does not exist in FR-01.

## Checks

Run `npm test`, `npm run typecheck`, `npm run build -w apps/web`, and `npm run format:check`. API tests use Fastify injection. Web tests exercise components with simulated API responses. An automated browser run is not included in FR-01 implementation evidence.
