# API development

The Fastify API runs on port 3000. Next.js runs on port 3001. Install dependencies from the repository root with `npm ci`; use `npm run dev:api`, `npm run dev:web`, `npm run test:api`, and `npm run build`.

All records are synthetic. The API stores accounts, session hashes, and policy assignments in memory. Restarting the API revokes all sessions. This prototype does not connect to an insurer system or create or bind coverage.

## Demo accounts

| Account ID | Default password | Assigned policies |
|---|---|---|
| `demo-alice` | `alice-demo-password` | `SYN-POL-1001`, `SYN-POL-1002` |
| `demo-bob` | `bob-demo-password` | `SYN-POL-1001`, `SYN-POL-2001` |

Set `DEMO_ALICE_PASSWORD` and `DEMO_BOB_PASSWORD` on the API process to replace the defaults. `WEB_ORIGIN` defaults to `http://localhost:3001`; `NEXT_PUBLIC_API_URL` defaults to `http://localhost:3000`. Both should use the same hostname in a local browser. Cookies are Secure when `NODE_ENV=production`; production deployments require HTTPS. Password reset, production identity, and persistent sessions are outside this story.

## Session and authorization contract

`POST /auth/sign-in` accepts `{ "accountId": "...", "password": "..." }`. Valid credentials return `{ "actor": { "id": "...", "displayName": "..." }, "expiresInSeconds": 1800 }` and an HttpOnly, SameSite=Lax `pea_session` cookie. Invalid credentials return the same `401 { "error": "Invalid credentials" }` for known and unknown accounts. Sessions expire after 30 minutes and are revoked by `POST /auth/sign-out`, which returns 204 and clears the cookie even when the session is already invalid. Session tokens are random and only their SHA-256 hashes are retained by the server. Passwords and session secrets are absent from audit events.

`GET /auth/me`, `GET /policies`, and `GET /policies/:id` require the cookie. Missing, expired, revoked, or forged sessions return `401 { "error": "Authentication required" }`. The API ignores browser-provided actor headers. `GET /policies` returns `{ "policies": [{ "id": "...", "status": "ACTIVE" | "EXPIRED" }] }` for the authenticated actor's assignments. `GET /policies/:id` returns an assigned policy's ID and status; unassigned and unknown IDs both return `404 { "error": "Policy unavailable" }`.

`canReviewDraft(actor, policyId, creatorId)` is an exported server guard for future draft-review routes. It returns true only for another staff member assigned to that policy and makes no mutation. This story adds no draft or review endpoint.

Route schemas validate requests and responses and generate OpenAPI JSON at `/docs/json` and Swagger UI at `/docs`. Web client response types derive from those shared schemas. `GET /health` returns `{ "status": "ok" }`.
