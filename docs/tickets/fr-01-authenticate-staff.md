# FR-01 — Authenticate Staff

**Title:** [Story] Authenticate staff with synthetic demo accounts
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/33
**Feature ID:** FR-01
**Product context:** [PRD](../PRD.md)
**Risk:** High — an authentication failure could expose another account's policy or allow unauthorized review.
**State:** Selected for ticket handoff
**Requirements owner:** This file; historical [Issue #13](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/13) is closed.

## Summary and objective
Deliver FR-01 so each synthetic demo staff member can sign in, use only their assigned policies, and sign out; the API rejects expired or invalid sessions and prevents a draft creator from reviewing their own draft.

## User story or requirement
As a policy-service staff member, I can sign in with my own demo account and work only on assigned synthetic policies, so policy details and endorsement actions are attributable to the correct person.

## Business or technical context
- Product context: `docs/PRD.md`, Authentication and access, staff journey, evaluation, and definition of done. This ticket owns the FR-01 detail.
- Architecture: `docs/ADR.md` puts authentication, access control, and writes in Fastify; the browser uses the API.
- Existing `docs/API_DEVELOPMENT.md` describes a deterministic token-to-user fixture as a prior API plan and explicitly says it is not authentication. FR-01 replaces that proposed identity mechanism.
- UX handoff: the new visual and behavior contracts and sign-in mockup are linked below.
- Risk: high. A failure could expose another account's policy or allow unauthorized review. Verify the rejection paths against every protected route as those routes are added.

## Acceptance criteria
- [ ] Each seeded synthetic staff account can sign in with its own local demo credentials. Invalid credentials fail without creating a usable session. At least two staff accounts are assigned to the same synthetic policy.
- [ ] Sign-in establishes a server-validated, expiring session. Every protected API request derives the actor from that session, ignores client-supplied identity or role claims, and returns `401` for missing, invalid, expired, or signed-out sessions.
- [ ] A signed-in staff member can sign out. The old session is invalid immediately, including when reused directly against the API. The UI directs unauthenticated users to sign in and does not display protected data after sign-out or expiry.
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
- A runnable Fastify API and Next.js web foundation is required. Historical Issues #4 and #9 are retired and do not prove that the current checkout has those applications. Establish the minimum foundation in the FR-01 implementation or merge it first.
- FR-11 provides the draft review endpoint; its implementation must call the no-self-review guard established here.

## Related subtasks
N/A

## Accepted decisions and readiness
- 2026-11-11: Moved back to backlog for the ticket workflow test; historical Issue #13 was closed.
- 2026-11-12: Selected FR-01 from backlog for a new ticket and UX handoff. Labeled historical Issues and PRs are retired evidence. New Issue #33 tracks this selected ticket; the handoff still needs review before implementation.
- No scope decision has superseded the acceptance criteria above.
- Historical UX PR #14 merged, but its design artifacts were removed during the reset. Implementation PR #15 merged and was reverted by commit `bdb4433`; the replacement implementation decision and acceptance checks are pending. Review the revert before a new build.

## UX handoff references
- Visual contract: [DESIGN.md](../../_bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-01-authenticate-staff/DESIGN.md)
- Behavior contract: [EXPERIENCE.md](../../_bmad-output/initiative-pea-001-policy-list-and-detail/ux-fr-01-authenticate-staff/EXPERIENCE.md)
- Browser-viewable mockup: [sign-in.html](../../design/page/sign-in.html), linked from [design index](../../design/page/index.html). Shared styles: [global.css](../../design/global.css).
- Open UX wording question: confirm account display names when demo fixtures are seeded.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
