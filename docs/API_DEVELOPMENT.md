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

The current checkout still exposes `POST /api/policies/:policyId/mock-identity` for synthetic scenarios. FR-06 was removed from the MVP journey on 2026-11-18; later quote and draft flows must not depend on this route. Its removal from the runtime is separate implementation work.

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

## Planned FR-04 and FR-05 retrieval development

FR-04 and FR-05 remain backlog drafts. The RAG runtime, retrieval tables, vector extension, configuration, and endpoints described in this section are the proposed development direction, not implemented API behavior. Refinement must finalize their names and schemas before implementation and update this document with the delivered contract.

Use Neon PostgreSQL with `pgvector` as the retrieval store. Keep versioned policy evidence and endorsement rules in retrieval-specific tables rather than adding unstructured content to the application policy tables. Apply deterministic metadata filters before similarity or full-text search:

- FR-04 filters policy evidence by authorized `policyId` and `policyVersion` and returns the original document, section, and version for every excerpt.
- FR-05 filters rules by product, change type, requested effective date, and rule version or effective period.
- Missing or contradictory evidence returns an explicit `MISSING` or `CONFLICTING` outcome. Retrieval never resolves a conflict, determines eligibility, calculates premium, or creates a draft.

Implement the retrieval runtime in `apps/ai` with TypeScript and Fastify, provisionally on port `3002`. `apps/api` is its only application caller: the browser must not call `apps/ai`, Neon, or an embedding provider directly. The API authenticates the session, authorizes policy access, and validates request ownership before making an internal retrieval request. The retrieval service accepts only the already-authorized identifiers and query fields it needs; client-supplied customer or role claims have no authority.

The proposed internal routes are:

| Route | Purpose | Required result states |
| --- | --- | --- |
| `POST /internal/retrieval/policy-evidence` | Retrieve versioned sections for an authorized policy; `apps/api` verifies decision fields against structured policy records | `FOUND`, `MISSING`, or `CONFLICTING`, with citations |
| `POST /internal/retrieval/endorsement-rules` | Retrieve rules applicable to the product, change type, and requested effective date | `FOUND`, `MISSING`, or `CONFLICTING`, with citations |
| `GET /health` | Report retrieval runtime readiness without exposing documents, credentials, or policy data | Service status only |

Every `FOUND` or `CONFLICTING` item must identify `sourceId`, `version`, `sectionId`, `sectionTitle`, and the supporting excerpt. Similarity scores may support ranking but must not be treated as a workflow decision. Treat indexed text and retrieved excerpts as untrusted input, and never place credentials, session tokens, or identity documents in the retrieval index.

Keep embedding generation behind an `Embedder` interface. Unit and integration tests use a deterministic fake embedder and fixed synthetic fixtures; they must not call a hosted embedding API. A hosted provider can be configured for development or deployment after refinement without changing retrieval or workflow contracts. Record the provider, embedding model or fixture version, ingestion checksum, and source version so evaluation results and citations are reproducible.

FR-04 should deliver the shared ingestion and retrieval foundation first. FR-05 should reuse it and add deterministic rule selection and conflict handling. Before either implementation begins, update the applicable ADR with the accepted storage and internal-service decision, move its backlog draft into `docs/tickets/`, merge the requirement handoff, create its tracking Issue, and run ticket preflight.

## Checks

Run `npm test`, `npm run typecheck`, `npm run build -w apps/web`, `npm run format:check`, and `npm run test:e2e`. API integration tests use Fastify injection with a separate synthetic `TEST_DATABASE_URL`; never point it to an application database. To reset test state, drop and recreate only that disposable test database with PostgreSQL admin tools, then run `DATABASE_URL="$TEST_DATABASE_URL" npm run db:migrate -w apps/api` and `DATABASE_URL="$TEST_DATABASE_URL" npm run db:seed -w apps/api`. Set both variables when running `npm test`. CI provisions a fresh `pea_test` database for each run. Web tests exercise components with simulated API responses. Browser E2E builds the web app locally, starts the API and production web server, runs Chromium against both, and writes a dated Playwright HTML report under `test-results/<ticket-id>/`; `test-results/index.html` opens the latest run across tickets. Install Chromium locally once with `npx playwright install chromium`. CI uploads each implementation PR's report as an artifact, including failed runs. Desktop and 375px visual comparisons use reviewed macOS Chromium baselines; the Linux CI job skips those two visual tests while its functional browser tests and screenshots still run.

## FR-07 mock document bypass
This section describes the current checkout, not the revised FR-07 target. The 2026-11-18 requirement changes FR-07 to a synthetic file upload returning `RECEIVED_MOCK` after technical checks; the route, schema, generated web types, UI, and tests still need implementation. The current bypass does not satisfy the revised ticket.


`POST /api/policies/:policyId/document-bypass` requires the session cookie and `{ "requestId": "<existing request UUID>" }`. The request must belong to the session actor and policy. The route accepts no document. It returns `200` with `status: BYPASSED_MOCK` and an explanation that document verification was skipped. Missing sessions return `401`, unknown or unowned policies or requests return the same `404`, malformed bodies return `400`, and expired policies return `409`. The API records the request ID and bypass in the audit trail before reporting success. This simulation does not inspect a file, verify authenticity, or bind coverage.

## FR-02 request body

Send exactly one change type with `requestedEffectiveDate` as a real `YYYY-MM-DD` calendar date. `BENEFICIARY` requires a complete `beneficiaries` replacement array with non-empty names, positive numeric `allocationPercent`, and a total of exactly 100. `ADDRESS` requires non-empty `correspondenceAddress`. `PAYMENT_FREQUENCY` requires `paymentFrequency` set to `MONTHLY`, `QUARTERLY`, `SEMI_ANNUAL`, or `ANNUAL`. `ACCIDENTAL_DEATH_RIDER` requires `riderAction` set to `ADD` or `REMOVE`. Other type fields and client identity claims are rejected. Responses contain only the selected change's data. Requests and their audit events are written in one PostgreSQL transaction, separate from policy facts; restart preserves them. Recording a request does not approve a change, quote, draft, or bind coverage.
