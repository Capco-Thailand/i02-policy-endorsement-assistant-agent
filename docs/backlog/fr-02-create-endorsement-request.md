# FR-02 — Create Endorsement Request

**Title:** [Story] Create an endorsement request for a customer's policy
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-02
**Product context:** [PRD](../PRD.md)
**Risk:** High — a request against another customer's policy could disclose data or start an unauthorized workflow.
**State:** Backlog draft; depends on FR-01 and FR-03

## Summary and objective

An authenticated customer selects a synthetic policy linked to their account and records one supported change request with enough information for later evidence retrieval and validation. This ticket stops at request capture; downstream checks decide whether a quote or draft can be created.

## User story or requirement

As a customer, I can submit a change request for one of my policies, so the endorsement workflow records exactly what I asked to change.

## Business or technical context

- The [PRD](../PRD.md) defines the four supported changes, assigned-policy access, synthetic-data boundary, and non-binding workflow.
- [ADR](../ADR.md) places authorization and writes in Fastify, with schema-defined API contracts. The browser uses that API.
- FR-01 [authentication draft](fr-01-authenticate-staff.md) owns customer session identity and policy ownership authorization. [FR-03](fr-03-check-policy-access.md) covers policy access and selection.
- The request is an input to FR-04 through FR-10. Saving it is not an eligibility decision, quote, draft, approval, or policy update.

## Request rules and data

- The server derives the requester from the authenticated session and records the selected policy ID, one change type, requested effective date, change-specific inputs, creation time, and a request ID. It does not accept a client-supplied requester as authority.
- Supported change types are beneficiary, correspondence address, payment frequency, and accidental-death rider. The UI presents only these four options; the API rejects any other value.
- Beneficiary requests submit a complete replacement list with at least one beneficiary. Each entry has a non-empty name and an allocation percentage greater than zero; percentages total exactly 100. Address requests capture a non-empty correspondence address. Frequency requests select one of `MONTHLY`, `QUARTERLY`, `SEMI_ANNUAL`, or `ANNUAL`. Rider requests specify `ADD` or `REMOVE` for accidental-death coverage. The API validates the fields for the selected change type and rejects fields for another type.
- The requested effective date is a valid calendar date in `YYYY-MM-DD` format. The server records the submitted date without making an eligibility decision in this ticket.
- Required information is collected before the request advances to later validation. An incomplete form can remain in the browser, but it is not a submitted request.
- The API checks the session and policy ownership before returning policy data or accepting a request. An unknown policy and another customer's policy receive the same non-disclosing response.
- Only an `ACTIVE` policy can start or submit an endorsement request. An `EXPIRED` policy shows an unavailable state in the UI; a direct API submission is rejected without creating a request.

## Acceptance criteria

- [ ] From an `ACTIVE` policy detail view, customers can start a request; the selected policy is visible throughout entry. The four supported change types show only their relevant inputs and required-field guidance. A beneficiary change replaces the full list, and its allocations must total 100%.
- [ ] Submitting complete, valid input creates one request with a server-generated ID, session-derived requester, selected policy, change type, requested effective date, change-specific data, and creation time; the UI confirms that the request was recorded and remains pending checks.
- [ ] Missing required data, malformed dates, invalid change-specific data, or unsupported change types produce field-level or API errors and create no request. The entered values remain available for correction.
- [ ] Missing or expired sessions are rejected. Unknown policy IDs or policies linked to another customer are rejected without disclosing policy details or creating a request. A forged requester field cannot change the recorded actor.
- [ ] An `EXPIRED` policy cannot start an endorsement request in the UI. A direct API submission for it is rejected and creates no request, quote, or draft. The UI explains that the policy is expired.
- [ ] Creating a request never updates a policy, binds coverage, creates a quote or draft, or presents the change as approved. Synthetic data only is used.
- [ ] The API contract documents request and error shapes; meaningful checks cover successful capture for all four types, invalid input, missing session, cross-account access, and the no-policy-write boundary.

## Scope and out of scope

In scope:
- Request entry UI, server-side input validation and persistence, session-based requester identity, assigned-policy access, user feedback, and API documentation.

Out of scope:
- RAG evidence, mock eKYC, document bypass, eligibility decisions, premium calculations, draft generation, review, approval, policy updates, and coverage binding.

## Dependencies

- FR-01 authentication and assigned-policy authorization must be usable before implementation.
- FR-03 policy access provides the policy selection flow and data boundary; verify its implementation before building.
- Create a fresh FR-02 UX handoff and confirm FR-01 and FR-03 are usable before implementation.

## Related subtasks

None.

## Accepted decisions and readiness

- 2026-11-12: The customer requests changes to a policy linked to their account.
- Request capture is separate from downstream eligibility, quote, and draft work. FR-03 policy access is required first.
- 2026-11-13: Only `ACTIVE` policies may start or submit an endorsement request. `EXPIRED` policies cannot create a request, including through direct API calls.
- 2026-11-13: Beneficiary requests replace the complete beneficiary list; the submitted allocations must total 100%.
- Status: Backlog draft. FR-01 and FR-03 dependency verification is pending; do not start implementation until they are usable.

## UX handoff

No current design. Create fresh `DESIGN.md`, `EXPERIENCE.md`, and browser mockups for request entry and expired policies when this draft is selected.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
