# Chore — Remove FR-07 mock upload from the endorsement MVP

**Title:** [Chore] Remove FR-07 mock upload code and flow dependencies
**Labels:** `type:chore`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/120
**Product context:** [PRD](../PRD.md)
**Risk:** Medium — removing the upload must not weaken request authorization or change assessment behavior.
**State:** Ready for ticket review

## Summary and objective

Remove the FR-07 mock document upload capability and its remaining dependencies from the endorsement application. The [PRD](../PRD.md) excludes document upload from this flow; FR-08 assessment, FR-09 calculation, and FR-10 proposal must work without a receipt.

## System requirement

The customer can complete the endorsement journey without an upload step, upload prompt, or upload-linked eligibility result. The application no longer exposes an unused mock-upload API or client contract.

## Business and technical context

- FR-07 was implemented before the endorsement flow changed in PR #118. The current request UI still renders `DocumentUpload`, and the eligibility UI still links to its heading.
- The API still exposes `/api/policies/{policyId}/document-upload`; client types, tests, and an eligibility receipt lookup also remain. Remove only code that belongs to FR-07. Preserve FR-05 rule retrieval and FR-08 authorization, assessment, and audit boundaries.
- Existing audit records are historical data. Do not delete them or run a destructive migration solely for this cleanup.

## Acceptance criteria

- [ ] The request and assessment UI contain no upload control, upload guidance, receipt status, or link to upload. All four supported change types remain usable without a file.
- [ ] FR-08 does not read or require a `RECEIVED_MOCK` audit event. A missing or existing historical receipt cannot change an assessment result or its reason.
- [ ] Remove the mock-upload API route, OpenAPI schema, client method/types/query, FR-07 component, and code used only by them. Generated API types are refreshed from the resulting contract.
- [ ] Remove or update upload-specific tests and browser scenarios. Regression checks cover request submission, three assessment outcomes, authorization and cross-account access, and no upload dependency.
- [ ] Keep historical upload audit rows readable where general audit history supports them. No policy data or coverage is modified by this cleanup.
- [ ] Update the FR-07 ticket and any affected implementation notes or UX links to mark the capability retired; keep historical references only where needed for traceability. Do not change the PRD.

## Scope and out of scope

In scope: removing FR-07 UI, API, client contract, receipt gate, and tests tied only to the removed capability.

Out of scope: changing FR-05 rule evidence, implementing the new FR-08 assessment contract, deleting historical audit data, or adding a replacement document workflow.

## Dependencies

FR-08's receipt gate must be removed without introducing a bypass of its session, ownership, active-policy, and evidence checks. The new FR-08 assessment contract is tracked by its existing ticket.

## Related subtasks

None.

## Accepted decisions and readiness

- 2026-11-23: PRD 1.7 removes upload from the endorsement MVP. Retire the implemented FR-07 capability rather than keep it as a standalone application flow.
- Ready for ticket review. Implementation follows the ticket/UX PR and Issue workflow.

## UX handoff references

N/A — this chore removes an existing UI step; verify the remaining request and assessment screens in browser tests.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
