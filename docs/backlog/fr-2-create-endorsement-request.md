# Ticket 2 — FR-02: Create Endorsement Request

**Title:** [Story] Create an endorsement request for an assigned policy
**Labels:** `type:story`, `role:fe-data-rag`, `role:be-infra`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/24
**Feature ID:** FR-02
**Product context:** [PRD](../PRD.md)
**Risk:** High — a request against an unassigned policy could disclose data or start an unauthorized workflow.

## Summary and objective

An authenticated staff member selects an assigned synthetic policy and records one supported change request with enough information for later evidence retrieval and validation. This ticket stops at request capture; downstream checks decide whether a quote or draft can be created.

## User story or requirement

As policy-service staff, I can submit a change request for a policy assigned to me, so the endorsement workflow has a traceable description of what the customer asked to change.

## Business or technical context

- The [PRD](../PRD.md) defines the four supported changes, assigned-policy access, synthetic-data boundary, and non-binding workflow.
- [ADR](../ADR.md) places authorization and writes in Fastify, with schema-defined API contracts. The browser uses that API.
- FR-14 [ticket 1](fr-1-authenticate-staff.md) owns session identity and assigned-policy authorization. FR-01 policy list/detail and FR-03 policy access predate this ticket.
- The request is an input to FR-04 through FR-10. Saving it is not an eligibility decision, quote, draft, approval, or policy update.

## Request rules and data

- The server derives the requester from the authenticated session and records the selected policy ID, one change type, requested effective date, change-specific inputs, creation time, and a request ID. It does not accept a client-supplied requester as authority.
- Supported change types are beneficiary, correspondence address, payment frequency, and accidental-death rider. The UI presents only these four options; the API rejects any other value.
- Beneficiary requests capture the requested beneficiary name and intended allocation; address requests capture the requested correspondence address; frequency requests capture the requested payment frequency; rider requests capture whether the rider is to be added or removed. The precise field schema and permitted frequency/allocation values must be settled against the synthetic fixtures before implementation.
- Required information is collected before the request advances to later validation. An incomplete form can remain in the browser, but it is not a submitted request.
- The API checks the session and assigned-policy access before returning policy data or accepting a request. An unknown policy and an unassigned policy receive the same non-disclosing response.

## Acceptance criteria

- [ ] From an assigned policy's detail view, staff can start a request; the selected policy is visible throughout entry. The four supported change types show their relevant inputs and required-field guidance.
- [ ] Submitting complete, valid input creates one request with a server-generated ID, session-derived requester, selected policy, change type, requested effective date, change-specific data, and creation time; the UI confirms that the request was recorded and remains pending checks.
- [ ] Missing required data, malformed dates, invalid change-specific data, or unsupported change types produce field-level or API errors and create no request. The entered values remain available for correction.
- [ ] Missing or expired sessions are rejected. Unknown or unassigned policy IDs are rejected without disclosing policy details or creating a request. A forged requester field cannot change the recorded actor.
- [ ] A request may be recorded for an `EXPIRED` policy for traceability, but it cannot advance to eligibility, quote, or draft; the UI identifies that block. Eligibility is decided by FR-08.
- [ ] Creating a request never updates a policy, binds coverage, creates a quote or draft, or presents the change as approved. Synthetic data only is used.
- [ ] The API contract documents request and error shapes; meaningful checks cover successful capture for all four types, invalid input, missing session, cross-account access, and the no-policy-write boundary.

## Scope and out of scope

In scope:
- Request entry UI, server-side input validation and persistence, session-based requester identity, assigned-policy access, user feedback, and API documentation.

Out of scope:
- RAG evidence, mock eKYC, document bypass, eligibility decisions, premium calculations, draft generation, review, approval, policy updates, and coverage binding.

## Dependencies

- FR-14 ticket 1 session and assigned-policy authorization must be usable before implementation.
- FR-01 policy list/detail and FR-03 policy access provide the policy selection flow and data boundary; verify their current code state before building.
- UI handoff for this ticket is drafted below; resolve its open questions before implementation.

## Related subtasks

None.

## Accepted decisions and readiness

- 2026-11-11: Moved back to backlog for the ticket workflow test; historical Issue #24 was closed. Reconfirm scope and UX through a new ticket/UX handoff before implementation.
- 2026-11-11: FR-02 was selected as implementation-order ticket 2. Request capture is separate from downstream eligibility, quote, and draft work.
- Open question: Confirm the precise synthetic field schema and permitted values for each change type before implementation.
- Open question: Confirm whether an `EXPIRED` policy request should be recorded for audit or blocked at submission. The proposed behavior above records it and blocks advancement.
- Status: Requirements and UX handoff drafted; dependency verification pending. Do not start implementation until the open questions are settled.

## UX handoff references

- Visual contract: `_bmad-output/ux-fr-02-create-endorsement-request/DESIGN.md` (draft)
- Behavior contract: `_bmad-output/ux-fr-02-create-endorsement-request/EXPERIENCE.md` (draft)
- Browser-viewable mockup: `design/page/create-endorsement-request.html` (linked from `design/page/index.html`)

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers

## Progress & Handover

- **Status:** Not Started
- **Completed:** Requirements draft
- **Remaining:** Settle open questions, finalize UX handoff, implement
- **Branch:** N/A
- **PR:** N/A
- **Latest Test/CI Result:** N/A
- **Blockers:** Open request-schema and expired-policy decisions; UX review
- **Dependencies:** FR-14, FR-01, FR-03
- **Next Action:** Finalize product decisions and UX handoff
- **Context Links:** PRD, ADR, ticket 1
- **Last Updated:** 2026-11-11
