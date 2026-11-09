# API development

The prototype API uses Fastify and TypeScript. It has no policy endpoints or database yet.

## Local

From the repository root, run `npm ci`, then `npm run dev:api`. Use `npm run build --workspace @pea/api` for a type check and compiled output, and `npm run test:api` for the route smoke test. The API listens on `127.0.0.1:3000` by default. Set `HOST` and `PORT` to change the address; `PORT` must be an integer from 1 to 65535. No configuration values are required.

## Docker Compose

From the repository root, run `docker compose up --build`. Compose exposes the API on port 3000 and the web shell on port 5173, with live reload for both. Stop it with `docker compose down`.

Check `GET http://localhost:3000/health` for `{ "status": "ok" }`. Open `http://localhost:3000/docs` for Swagger UI or `http://localhost:3000/docs/json` for OpenAPI JSON. Unknown routes return a JSON 404. Schema validation errors on future routes return JSON 400 responses.

Use synthetic data only. This setup does not connect to insurer systems or create endorsements.
