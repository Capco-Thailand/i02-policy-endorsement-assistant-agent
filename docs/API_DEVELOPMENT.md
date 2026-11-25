# API development

The new project has no application API yet. This file is the place to record its runnable setup and public contracts once they exist. The previous project's routes, demo accounts, database, and ports are not contracts for the new project. The root `package.json` currently provides ticket commands and their unit tests only.

## Start and configuration

Before adding an API, record the selected runtime and server framework in [ADR.md](ADR.md) when the choice is a real architectural trade-off. Add the actual install, migration, seed, start, typecheck, build, and test commands here after implementing them. State required environment variables, safe local defaults, the API origin, allowed browser origin, and which configuration is server-only. Keep secrets out of the repository and browser bundle.

If the application has a database, make migrations and test-data setup explicit. Use an isolated test store and verify that test or reset commands cannot target the application database. Document startup dependencies and what happens when a required service is unavailable.

## Public contract

For each implemented route, record its method and path, purpose, authenticated actor, validated request, success response, and failure responses. Publish a machine-readable contract such as OpenAPI when the selected stack supports it. Generate or derive client types from the same validated schemas, and update consumers when a route changes. Do not document a route as available before it exists.

| Method and path | Actor and request | Success | Rejection and failure |
| --- | --- | --- | --- |
| Add each implemented route here | Required identity and validated input | Status and response schema | Authorization, validation, conflict, and dependency errors |

## Trust, state, and side effects

- Derive the actor from a validated session or token. Client-provided identity and role fields never grant access. Check ownership or other authorization before protected reads and writes.
- Give missing and unauthorized resources a deliberate error policy; document when responses must be indistinguishable to avoid disclosing another actor's data.
- Keep writes and their required audit records in a clear transaction boundary. A retry must not accidentally repeat a side effect; document the idempotency behavior of each mutating route.
- Keep downstream services, retrieval stores, and credentials behind the server boundary. Validate their responses before returning or persisting results. A dependency failure must not look like success.
- Record stable error codes and response shapes. Avoid leaking secrets, stack traces, or unnecessary personal data in responses or logs.

## Optional AI or retrieval contract

If a route uses retrieved evidence or a model, document the source and version of each cited item, the authorization and filtering order, the maximum result size, and the outcomes for missing, stale, conflicting, or unavailable evidence. State which decisions are deterministic and which model output is advisory. Require the ticket to define gates before a model result may lead to a side effect.

## Checks and handoff

Add tests for valid input, rejected input, authorization, missing and foreign resources, dependency failure, retries, and audit behavior. Use integration tests for database and service boundaries; use browser E2E for behavior visible through the UI. Keep example requests and responses aligned with the published contract. Record the actual commands and their results in the implementation handoff. [TESTING_STANDARD.md](TESTING_STANDARD.md) defines criterion coverage and evidence requirements.
