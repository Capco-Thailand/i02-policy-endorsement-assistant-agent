# FR-03 — Check Policy Access
**Title:** [Story] View only policies linked to the signed-in customer
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-03
**Product context:** [PRD](../PRD.md)
**Risk:** High — a policy read could expose another customer's details or enable an unauthorized request.
**State:** Selected for ticket/UX handoff

## Summary and objective
An authenticated customer can select and inspect only synthetic policies linked to their account. The API owns every access decision; the list and detail UI show policy status and facts needed to select a policy for FR-02.

## User story or requirement
As a customer, I can find and inspect my own synthetic policies, so I can choose the right policy before requesting a change.

## Business or technical context
- The [PRD](../PRD.md) requires customer-linked access and distinguishes `ACTIVE` from `EXPIRED` policies. Only an `ACTIVE` policy may start an endorsement request; FR-02 enforces that rule when it adds request entry.
- [ADR](../ADR.md) places policy authorization and REST responses in Fastify. [FR-01](fr-01-authenticate-customers.md) supplies session identity, a linked-policy list, a minimal detail endpoint, and reusable ownership checks. Extend those surfaces rather than creating a second identity or access path.
- Historical Issue #3 is unavailable in the current repository; its retired implementation is not readiness evidence. Current code and this ticket govern the build.
- Policy details are synthetic. This ticket does not add RAG evidence, endorsement capture, eligibility, a quote, a draft, or any policy write.

## Policy data and access rules
- Seed at least two customers with distinct linked policies and provide both `ACTIVE` and `EXPIRED` policy examples. Each list item returns policy ID, product label, and status. Detail returns those fields plus effective and expiry dates, payment frequency, and the current beneficiary names and allocations.
- `GET /api/policies` returns only policies linked to the session actor. `GET /api/policies/:policyId` derives the actor from the session and authorizes before returning any detail. Client-supplied customer, role, or policy-owner claims cannot grant access.
- Missing, invalid, expired, or signed-out sessions return `401`. Unknown and another customer's policy IDs return the same `404` response, without status, beneficiary, or other policy details. Rejected reads write no policy data.
- The list and detail UI use the API's result, handle loading, empty, unavailable, and session-ended states, and show the synthetic-data boundary. FR-02 adds the request action to the active detail page later; this ticket supplies the selected policy and status context.

## Acceptance criteria
- [ ] Given a valid customer session, the policy list shows only linked synthetic policies with ID, product label, and `ACTIVE` or `EXPIRED` status. The customer can select an item and open its detail page; an empty list has a clear message.
- [ ] Given a linked policy ID, the detail page and API show its status, effective and expiry dates, payment frequency, and current beneficiaries with allocation percentages. The customer can return to the list. The detail remains usable at desktop and narrow widths.
- [ ] Given a missing, invalid, expired, or signed-out session, list and detail API calls return `401` without policy data. The UI clears protected data and directs the customer to sign in.
- [ ] Given an unknown or another customer's policy ID, the detail API returns the same non-disclosing `404`; direct URL access shows the same unavailable state. Forged customer or role claims do not change the actor.
- [ ] Given an `EXPIRED` policy, the UI clearly identifies its status. This ticket offers no request action; FR-02 later enforces the active-only request rule in UI and API.
- [ ] Reading or selecting a policy creates no endorsement request, quote, draft, approval, policy update, or coverage binding. Only synthetic data is used.
- [ ] Route schemas and generated client types document list, detail, and error shapes. Tests cover both customers, active and expired records, direct cross-account access, spoofed identity, session failures, and the no-write boundary.

## Scope and out of scope
In scope:
- Linked-policy list and detail API/UI, synthetic policy facts and status, backend ownership enforcement, accessible loading/error states, API documentation, and tests.

Out of scope:
- FR-02 request entry or active-only submission, FR-04 RAG evidence, eligibility, quotes, drafts, customer decisions, history, live insurer integration, and coverage binding.

## Dependencies
- FR-01 authentication and ownership guard are merged in [implementation PR #54](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/pull/54). This ticket extends its minimal policy routes.
- FR-02 depends on this detail and selection flow. FR-02 owns the request action and expired-policy submission rejection.

## Related subtasks
None.

## Accepted decisions and readiness
- 2026-11-12: Customer account ownership replaces staff assignment as the access boundary.
- 2026-11-16: FR-01's merged API establishes session-derived ownership and minimal list/detail routes. FR-03 adds policy facts, status, and a usable selection/detail UI for FR-02. Historical Issue #3 is not available or a current dependency.
- The current ticket and UX handoff are ready for review. Implementation waits for the merged handoff and active Issue.

## UX handoff references
- [Visual contract](../../_bmad-output/initiative-customer-authentication/ux-fr-03/DESIGN.md)
- [Behavior contract](../../_bmad-output/initiative-customer-authentication/ux-fr-03/EXPERIENCE.md)
- [Policy list mockup](../../design/page/policies.html), [detail mockup](../../design/page/policy-detail.html), and [mockup index](../../design/page/index.html)

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
