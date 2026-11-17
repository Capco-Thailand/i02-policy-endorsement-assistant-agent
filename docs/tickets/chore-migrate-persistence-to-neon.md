# [Story] Persist prototype data in Neon
**Title:** [Story] Move prototype persistence to Neon PostgreSQL
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/73
**Product context:** [PRD](../PRD.md)
**Risk:** High — incorrect migration could expose another customer's data or lose requests and audit records.
**Requirements owner:** This file.

## Summary and objective
Replace the API's process-local data stores with Neon PostgreSQL so synthetic customer and policy data, sessions, endorsement requests, and audit events survive API restarts and work across API instances.

## Requirement
The API reads and writes these records through server-side Neon connections while preserving the existing customer-facing flows and non-binding policy boundary.

## Business and technical context
- The [PRD](../PRD.md) requires synthetic data, account-scoped access, an audit trail, and no policy or coverage binding. The [ADR](../ADR.md) selects hosted Neon PostgreSQL for application persistence; this ticket delivers that decision.
- Current API state includes seeded customers and policies in code, a process-local session map, and process-local request and audit arrays. Existing FR-01, FR-03, and FR-02 contracts remain the behavioral baseline.
- Store password verifiers and session tokens securely. The browser must continue to use the API boundary; it must never receive a database credential or connect to Neon directly.

## Acceptance criteria
- [ ] A repeatable schema migration creates tables and constraints for synthetic customers, policies and their beneficiaries, sessions, endorsement requests, and audit events. Referential integrity prevents orphaned records; the schema does not provide a path to bind coverage.
- [ ] An idempotent seed command creates only the documented synthetic demo accounts and policies in a fresh Neon database. Re-running it does not duplicate or overwrite customer activity. No real customer or insurer data is imported.
- [ ] Sign-in checks the stored password verifier. Session creation, lookup, expiry, and sign-out use Neon; an active session remains usable after an API restart or across two API instances, while an expired or signed-out session is rejected everywhere. Store only a one-way digest of the session token and never expose it in logs or audit data.
- [ ] Policy list and detail reads come from Neon and keep the existing owner-only access, active/expired behavior, response shapes, and cross-account rejection semantics.
- [ ] A valid endorsement submission writes exactly one request with its server-generated ID, session-derived requester, policy ID, payload, and creation time. The record remains available after restart. Invalid, expired-policy, unauthenticated, and cross-account submissions write no request.
- [ ] Audit events for the existing authenticated actions persist in Neon with actor, action, and time. A database write failure cannot be reported as a successful request or decision. Credentials, session secrets, and unnecessary personal data are absent from audit records.
- [ ] The API fails clearly when database configuration or connectivity is unavailable; it does not silently fall back to process-local storage or report a successful write that did not commit. Database credentials are supplied server-side through environment configuration and excluded from the repository, client bundle, logs, and error responses.
- [ ] Automated integration checks against an isolated test database cover restart and multi-instance persistence, session expiry/revocation, seed idempotency, cross-account isolation, request durability, audit durability, and unchanged policy data after request creation. Existing API and browser behavior remains green.
- [ ] Setup and operations documentation explains Neon connection configuration, migrations, seeding, local/test isolation, and reset of synthetic test data. API/OpenAPI docs are updated only if a public contract changes.

## Scope and out of scope
In scope:
- Neon PostgreSQL persistence for every data group currently held by the API: customers, policies, sessions, endorsement requests, and audit events.
- Server-side schema migrations, synthetic seed data, connection configuration, and integration verification.

Out of scope:
- Real insurer or policy-system data and connections, coverage binding, policy mutation, and production identity integration.
- New customer UI, new endorsement workflow stages, RAG storage, and pgvector retrieval. FR-04, FR-05, and FR-13 own their later integration details.

## Dependencies
- FR-01, FR-03, and FR-02 provide the current authentication, policy, and request behavior to preserve.
- A Neon project and database connection string are required for deployment and live integration verification. Local and CI tests must use isolated synthetic databases.
- FR-13 follows the Neon application database decision recorded in the ADR and its updated backlog draft.

## Related subtasks
None. Split only if implementation planning shows independently reviewable migration stages.

## Accepted decisions and readiness
- 2026-11-17: Move customers, policies, sessions, endorsement requests, and audit records to Neon; no API-owned persistence remains process-local.
- 2026-11-17: The ADR and FR-13 backlog draft now describe the Neon target. This does not mean the migration has been implemented.
- The database driver, migration tool, and credential delivery mechanism are implementation choices, subject to repository standards and server-only credential handling.
- Ticket is ready for review. Implementation begins after the ticket/UX PR merges, its GitHub Issue is linked, and the required Neon test connection is available.

## UX handoff references
N/A — no UI change.

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
