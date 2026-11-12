# FR-01 — Authenticate Staff

**Title:** [Story] Authenticate staff with synthetic demo accounts
**Labels:** `type:story`, `role:be-infra`, `role:fe-data-rag`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-01
**Product context:** [PRD](../PRD.md)
**Risk:** High — an authentication failure could expose another account's policy or allow unauthorized review.
**State:** Selected requirement
**Requirements owner:** This file; historical [Issue #13](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/13) is closed.

## Summary and objective
Deliver FR-01 so each synthetic demo staff member can sign in, use only their assigned policies, and sign out; the API rejects expired or invalid sessions and prevents a draft creator from reviewing their own draft.

## User story or requirement
As a policy-service staff member, I can sign in with my own demo account and work only on assigned synthetic policies, so policy details and endorsement actions are attributable to the correct person.

## Business or technical context
- Product context: [PRD](../PRD.md), Authentication and access, staff journey, evaluation, and definition of done. This ticket owns the FR-01 detail.
- Architecture: [ADR](../ADR.md) puts authentication, access control, and writes in Fastify; the browser uses the API.
- Existing [API development guidance](../API_DEVELOPMENT.md) describes a deterministic token-to-user fixture as a prior API plan and explicitly says it is not authentication. FR-01 replaces that proposed identity mechanism. Its one-policy-per-staff example must also change to include two assigned staff on one policy.
- UX handoff: see the visual contract, behavior contract, and sign-in mockup below.
- Risk: high. A failure could expose another account's policy or allow unauthorized review. Verify the rejection paths against every protected route as those routes are added.

## Acceptance criteria
- [ ] Each seeded synthetic staff account can sign in with its own local demo credentials. Invalid credentials return a generic failure without creating a usable session or revealing which credential was wrong. At least two staff accounts are assigned to the same synthetic policy.
- [ ] Sign-in establishes a server-validated, expiring session. Every protected API request derives the actor from that session, ignores client-supplied identity or role claims, and returns `401` for missing, invalid, expired, or signed-out sessions.
- [ ] A signed-in staff member can sign out. The old session is invalid immediately, including when reused directly against the API. The UI directs unauthenticated users to `/sign-in`, clears protected client data after sign-out or expiry, and never renders protected data while checking a direct protected URL.
- [ ] Sign-in accepts Account ID and Password, prevents duplicate submission, and returns to a safe requested internal page when available or `/policies` otherwise. It never follows an external return URL or stores a password in a URL or browser storage. Session expiry and sign-out show the distinct messages in the UX handoff.
- [ ] Policy list, detail, evidence retrieval, endorsement request/draft actions, and draft review enforce assigned-policy access on the backend when those endpoints exist. Inaccessible policy IDs return the same non-disclosing result as unknown IDs. No policy or beneficiary details leak.
- [ ] A draft creator cannot approve or reject their own submitted draft. Another signed-in staff member assigned to that policy can record a review decision when the review endpoint exists. Review never binds or changes coverage.
- [ ] Audit records for authenticated actions include the actor and action without credentials or session secrets. Local demo credentials, session lifetime, and startup configuration are documented.
- [ ] API contracts document sign-in, sign-out, current-session and authentication error responses; automated coverage demonstrates invalid credentials, sign-out, expiry, cross-account access, client identity spoofing, blocked self-review, and allowed review by a different assigned account at the applicable integration points.

## Scope and out of scope
In scope:
- Synthetic demo accounts, backend sessions and access rules, authentication API, sign-in/out UI, configuration, documentation, and tests.
- A reusable backend review authorization guard that the eventual review endpoint calls.

Out of scope:
- Production account management, password recovery, SSO, external identity providers, live policy systems, and binding or issuing coverage.
- Building policy, RAG, endorsement, or draft workflows beyond the authorization integration they require.

## Dependencies
- Historical `#4` and `#9` describe the API and web foundations, but the current checkout has no application source. The FR-01 build must establish the minimum runnable Fastify and Next.js foundations needed for sign-in, or use foundations merged before its implementation PR. This handoff does not claim those foundations already exist.
- FR-11 provides the draft review endpoint; its implementation must call the no-self-review guard established here.

## Related subtasks
N/A

## Accepted decisions and readiness
- 2026-11-11: Moved back to backlog for the ticket workflow test; historical Issue #13 was closed. A new ticket handoff and Issue are required before implementation.
- 2026-11-12: Selected FR-01 for a new ticket handoff. The previously merged UX handoff remains the visual and behavior reference. The current checkout has no application implementation; the build dependency is stated above.
- No scope decision has superseded the acceptance criteria above.
- [UX PR #14](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/pull/14) merged. [Implementation PR #15](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/pull/15) merged and was reverted by commit `bdb4433`; the replacement build must inspect that revert and start from current code, not assume PR #15 is present.

## UX handoff references
- Visual contract: [DESIGN.md](../../_bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-01-authenticate-staff/DESIGN.md)
- Behavior contract: [EXPERIENCE.md](../../_bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-01-authenticate-staff/EXPERIENCE.md)
- Browser-viewable mockup: [sign-in.html](../../design/page/sign-in.html), linked from [mockup index](../../design/page/index.html)
- The UI labels the credential field “Account ID” and shows each seeded staff member's display name in the signed-in header. Fixture names are documented with local demo credentials during implementation.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
