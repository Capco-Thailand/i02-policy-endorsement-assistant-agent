# FR-01 — Authenticate Customers

**Title:** [Story] Authenticate customers with synthetic demo accounts
**Labels:** `type:story`, `role:dev`, `role:be-infra`, `role:fe-data-rag`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-01
**Product context:** [PRD](../PRD.md)
**Risk:** High — an authentication failure could expose another customer's policy or let someone approve their request.
**State:** Ticket and UX handoff in review; implementation pending
**Requirements owner:** This file.

## Summary and objective
Deliver FR-01 so each synthetic demo customer can sign in, access only policies linked to their account, and sign out. The API rejects expired or invalid sessions and provides an ownership guard for later endorsement requests and customer decisions.

## User story or requirement
As a customer, I can sign in with my own demo account and access only my synthetic policies, so later requests and decisions are attributable to me.

## Business or technical context
- Product context: `docs/PRD.md`, Authentication and access, customer journey, evaluation, and definition of done. This ticket owns the FR-01 detail.
- Architecture: `docs/ADR.md` puts authentication, access control, and writes in Fastify; the browser uses the API.
- The prior API and web implementation was removed. `docs/API_DEVELOPMENT.md` records the current absence of a runtime.
- The linked UX handoff and sign-in mockup define the customer-facing sign-in states.
- Risk: high. A failure could expose another customer's policy or allow approval of that customer's request. Verify the rejection paths against every protected route as those routes are added.

## Acceptance criteria
- [ ] Each seeded synthetic customer account can sign in with its own local demo credentials. Invalid credentials fail without creating a usable session. At least two customer accounts have distinct linked policies so cross-account access can be checked.
- [ ] Sign-in establishes a server-validated, expiring session. Every protected API request derives the actor from that session, ignores client-supplied identity or role claims, and returns `401` for missing, invalid, expired, or signed-out sessions.
- [ ] A signed-in customer can sign out. The old session is invalid immediately, including when reused directly against the API. The UI directs unauthenticated users to sign in and does not display protected data after sign-out or expiry.
- [ ] Policy list, detail, evidence retrieval, and endorsement request/draft actions enforce the customer's policy link on the backend when those endpoints exist. Inaccessible policy IDs return the same non-disclosing result as unknown IDs. No policy or beneficiary details leak.
- [ ] The reusable authorization guard permits only the owning customer to decide on a proposal when FR-11 adds the decision endpoint. It rejects another customer's request, even if the client supplies a forged customer or policy ID. FR-11 owns the proposed-policy review and decision UI; FR-12 owns the history page. No customer decision binds live coverage.
- [ ] Audit records for authenticated actions include the actor and action without credentials or session secrets. Local demo credentials, session lifetime, and startup configuration are documented.
- [ ] API contracts document customer sign-in, sign-out, current-session and authentication error responses; automated coverage demonstrates invalid credentials, sign-out, expiry, cross-account access, client identity spoofing, blocked cross-account decisions, and an allowed decision on the customer's own proposal at the applicable integration points.

## Scope and out of scope
In scope:
- Synthetic customer demo accounts, backend sessions and ownership rules, authentication API, customer sign-in/out UI, configuration, documentation, and tests.
- A reusable backend proposal-decision authorization guard that permits only the owning customer and is called by the eventual decision endpoint. The proposal review and history UIs belong to FR-11 and FR-12.

Out of scope:
- Production account management, password recovery, SSO, external identity providers, live policy systems, and binding or issuing coverage.
- Building policy, RAG, endorsement, or draft workflows beyond the authorization integration they require.

## Dependencies
- A runnable Fastify API and Next.js web foundation is required. Establish the minimum foundation in the FR-01 implementation or merge it first.
- FR-11 provides the customer review and decision endpoint; its implementation must use the ownership guard established here.

## Related subtasks
N/A

## Accepted decisions and readiness
- 2026-11-12: Corrected the primary actor from policy-service staff to the customer. Customers request changes to their own synthetic policies, review the proposed updated-policy view, and record their own decisions. Approval adds a record to the customer's history page without a later review or issuance step. This supersedes the previous staff sign-in and separate-reviewer model.
- The customer-facing criteria above are the current FR-01 scope; the proposal review and history screens belong to later tickets.

## UX handoff references

- Visual contract: [DESIGN.md](../../_bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-01-customer-authentication/DESIGN.md).
- Behavior contract: [EXPERIENCE.md](../../_bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-01-customer-authentication/EXPERIENCE.md).
- Browser preview: [sign-in.html](../../design/page/sign-in.html), linked from the [design index](../../design/page/index.html).
- Confirm account display names when synthetic demo fixtures are seeded; do not expose credentials in the UI by default.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
