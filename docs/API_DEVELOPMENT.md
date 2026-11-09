# API development

The prototype API uses Fastify and TypeScript. It has no policy endpoints or database yet.

## Local

From the repository root, run `npm ci`, then `npm run dev:api`. Use `npm run build --workspace @pea/api` for a type check and compiled output, and `npm run test:api` for the route smoke test. The API listens on `127.0.0.1:3000` by default. Set `HOST` and `PORT` to change the address; `PORT` must be an integer from 1 to 65535. No configuration values are required.

## Podman Compose

Start the Podman machine if needed with `podman machine start`. From the repository root, run `podman compose up --build -d`. Compose exposes the API on port 3000 and the web shell on port 5173, with live reload for both. Use `podman compose logs -f` to watch output and `podman compose down` to stop the services. Podman Compose needs a Compose provider installed; on this Windows setup it uses the installed Docker Compose CLI with the Podman engine.

Check `GET http://localhost:3000/health` for `{ "status": "ok" }`. Open `http://localhost:3000/docs` for Swagger UI or `http://localhost:3000/docs/json` for OpenAPI JSON. Unknown routes return a JSON 404. Schema validation errors on future routes return JSON 400 responses.

## Synthetic policy API

Use these demo bearer tokens with `GET /policies`, `GET /policies/:policyId`, and `POST /policies/:policyId/endorsements/initiate`:

- `demo-alice` owns `SYN-POL-1001` (active) and `SYN-POL-1002` (expired).
- `demo-bob` owns `SYN-POL-2001` (active).
- `demo-empty` has no policies.

The in-memory records and token-to-user mapping are deterministic fixtures, not authentication. Missing or invalid tokens return `401`. A policy that is missing or belongs to another user returns the same `404`. Initiation returns `204` for an owned active policy and `409` for an owned expired policy. It never creates a draft. Eligibility uses the stored status even when its dates disagree. Monetary values are decimal strings to preserve their exact values.

Use synthetic data only. This setup does not connect to insurer systems or create endorsements.
