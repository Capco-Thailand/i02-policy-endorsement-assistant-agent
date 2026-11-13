# FR-01 — Authenticate Customers
**Title:** [Story] Authenticate customers with synthetic demo accounts
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-01
**Product context:** [PRD](../PRD.md)
**Risk:** High — a failed session or ownership check could expose another customer's policy or permit a decision on their proposal.
**State:** Selected; ticket/UX handoff in review
**Requirements owner:** This file.

## Summary and objective
Each synthetic demo customer can sign in, reach only their linked policy data, and sign out. The API derives identity from an expiring server-validated session and supplies ownership guards for later policy, endorsement, and proposal-decision routes.

## User story or requirement
As a customer, I can sign in with my own demo account and access only my synthetic policies, so later requests and decisions are attributable to me.

## Business or technical context
- [PRD authentication and access](../PRD.md#authentication-and-access) defines the customer role and non-binding prototype boundary. Mock eKYC belongs to a later request step; it does not establish a sign-in session.
- [ADR-001](../ADR.md) places authentication, access control, and writes in Fastify. The browser uses the API; neither app exists yet in this checkout.
- [API development](../API_DEVELOPMENT.md) records the missing runtime. Establish the minimum runnable Fastify and Next.js foundations needed for this ticket, using the root npm workspace and lockfile.
- Use synthetic customer, credential, and policy fixtures only. No live insurer connection, coverage write, or binding decision is permitted.

## Acceptance criteria
- [ ] **AC1 — Demo accounts.** At least two seeded customer accounts have distinct linked synthetic policies. Each can sign in with its own documented local credentials. Unknown account and wrong password return the same generic failure and create no usable session.
- [ ] **AC2 — Session boundary.** Sign-in creates an expiring, server-validated session in an HTTP-only cookie. A current-session endpoint returns only safe display identity. Every protected API request derives the actor from that session, ignores client-supplied identity and role claims, and returns `401` for missing, invalid, expired, or signed-out sessions.
- [ ] **AC3 — Sign-out and browser state.** Sign-out invalidates the old session immediately, including direct API reuse. The UI directs unauthenticated users to sign in, shows a clear session-expired message when applicable, and does not display protected data after sign-out or expiry.
- [ ] **AC4 — Policy ownership.** A reusable backend guard verifies that the session actor owns the policy before retrieval or writes. Another customer's policy ID and an unknown ID return the same non-disclosing result, without policy or beneficiary detail. FR-03 and later policy/evidence/endorsement routes integrate this guard before they ship.
- [ ] **AC5 — Proposal ownership.** A reusable backend guard permits the owning customer and rejects another customer even when the client forges a customer or policy ID. FR-11 integrates the guard with its decision endpoint and proves both allowed own-proposal and blocked cross-account decisions. FR-11 owns review and decision UI; FR-12 owns history. No decision binds coverage.
- [ ] **AC6 — Audit and contract.** Authenticated actions record actor ID, action, outcome, and time without credentials or session secrets. Validated API schemas and OpenAPI document sign-in, sign-out, current session, and authentication errors. Local credentials, session lifetime, and startup configuration are documented.
- [ ] **AC7 — Verification.** Automated checks cover invalid credentials, sign-out, expiry, policy and proposal guard allow/deny paths, cross-account access, client identity spoofing, and audit redaction. UI checks cover sign-out and expiry. FR-03 and FR-11 add route-level integration checks when those endpoints exist; maintain traceability to those later checks.

## Scope and out of scope
In scope:
- Synthetic accounts and policy links; authentication API; session lifecycle; customer sign-in/out UI; reusable policy and proposal ownership guards; focused tests and documentation.
- The minimum runnable API and web foundation needed for FR-01.

Out of scope:
- Production accounts, password recovery, SSO, external identity providers, live systems, and coverage binding.
- The full policy list/detail and evidence flows (FR-03/FR-04), endorsement requests (FR-02), proposal review and decision endpoint (FR-11), and history UI (FR-12). Those routes must integrate the guards before they ship.

## Dependencies
- No earlier feature is required. The minimum Fastify and Next.js foundations are part of this implementation.
- FR-03 and FR-11 depend on the ownership guards established here and own their route-level integration checks.

## Related subtasks
None.

## Accepted decisions and readiness
- 2026-11-12: The primary actor is the customer. Customers request changes to their own synthetic policies, review proposed updated-policy views, and record their own decisions. Approval adds a non-binding history record without issuance or a later reviewer.
- 2026-11-13: FR-01 owns reusable ownership guards; FR-03 and FR-11 own integration with their later routes. The minimum app foundation is included because no API or web runtime exists.
- Requirements are selected. UX handoff and ticket/UX PR review must complete before implementation; create the tracking Issue after that PR merges.

## UX handoff references
[DESIGN.md](../../_bmad-output/initiative-customer-authentication/ux-authenticate-customers/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-customer-authentication/ux-authenticate-customers/EXPERIENCE.md), [sign-in mockup](../../design/page/sign-in.html), and [signed-in preview](../../design/page/session.html) (both linked from [design previews](../../design/page/index.html)). Use neutral customer wording; display names are synthetic implementation fixtures.

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
