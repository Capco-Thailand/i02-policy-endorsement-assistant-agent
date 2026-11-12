# API development

The API is a TypeScript Fastify workspace. TypeBox request and response schemas validate each route and produce the OpenAPI document. The web workspace imports response types derived from those schemas in `apps/api/src/contracts.ts`.

## Local runtime

Install dependencies from the repository root with `npm ci`. Start the API with `npm run dev:api`; it listens on port `3000` by default. Start Next.js separately with `npm run dev:web` on port `3001`.

Configuration:

| Variable              | Default                 | Purpose                                    |
| --------------------- | ----------------------- | ------------------------------------------ |
| `API_PORT`            | `3000`                  | Fastify listen port                        |
| `API_HOST`            | `0.0.0.0`               | Fastify listen host                        |
| `WEB_ORIGIN`          | `http://localhost:3001,http://127.0.0.1:3001` | Comma-separated credentialed CORS origins |
| `API_INTERNAL_URL`    | `http://localhost:3000` | API origin used by Next.js server requests |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | API origin used by browser requests        |

The API exposes `GET /health`, Swagger UI at `/docs`, and OpenAPI JSON at `/docs/json`. Sensitive authentication and policy responses use `Cache-Control: no-store`. Secure cookies are enabled when `NODE_ENV=production`; local HTTP uses `HttpOnly; SameSite=Lax`.

## Customer session contract

- `POST /auth/sign-in` accepts `{ "accountId", "password" }`. Success returns the customer display identity and `expiresInSeconds: 1800`, and sets an opaque `pea_session` cookie. Rejections return the same generic `401` response for unknown accounts and incorrect passwords.
- `GET /auth/me` returns the customer identity only when the cookie maps to a current server session.
- `POST /auth/sign-out` revokes the session and clears the cookie. Replaying the old cookie fails with `401`.
- Sessions expire after 30 minutes and live in API memory. Restarting the API revokes all sessions.

The seeded local demo accounts are `demo-alice` / `alice-demo-password` (Alice Morgan) and `demo-bob` / `bob-demo-password` (Bob Chen). Passwords are stored as seeded scrypt hashes. Do not use these credentials outside the synthetic prototype.

## Synthetic policy reads

| Account      | Linked synthetic policies                         |
| ------------ | ------------------------------------------------- |
| `demo-alice` | `SYN-POL-1001` (active), `SYN-POL-1002` (expired) |
| `demo-bob`   | `SYN-POL-2001` (active)                           |

`GET /policies` and `GET /policies/:id` derive the customer from the session cookie. Client-supplied identity headers or fields do not change ownership. An unlinked or unknown ID returns the same `404 { "error": "Policy unavailable" }`. Policy evidence, endorsement drafts, decisions, history, and live insurer access are outside FR-01 and are not implemented here.

Use synthetic data only. No route creates or binds an endorsement.
