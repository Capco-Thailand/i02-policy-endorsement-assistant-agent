# FR-07 — Mock Document Upload

**Title:** [Story] Mock document upload for endorsement requests
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-07
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — presenting mock receipt as verification could mislead customers.
**State:** Backlog draft

## Summary and objective

Show cited document guidance from FR-05, accept a synthetic upload for an owned active-policy request, and return `RECEIVED_MOCK` without checking business contents.

## User story or requirement

System requirement: Let customers upload a synthetic file for their request while clearly disclosing that its contents and suitability are not verified.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Show FR-05's applicable document guidance with source/version citation. Until FR-05 exists, a clearly labeled synthetic fixture may be used; missing or conflicting guidance is never presented as verified.
- [ ] For the signed-in customer's own active-policy request, accept one PDF, PNG, or JPEG up to 10 MiB. Reject empty, unsupported, or oversized files. Any technically accepted synthetic file receives `RECEIVED_MOCK`, regardless of name or contents. Do not compare it with RAG requirements, inspect authenticity, run OCR, or assess health.
- [ ] Disclose that receipt is for demonstration only and no document was verified. Show selected, uploading, received, and failed states. Tell customers to use synthetic files only, never real identity or health records.
- [ ] Enforce session and request ownership before upload; unknown and unowned requests have the same non-disclosing result. Audit actor, policy, request, mock status, safe file metadata, and time; discard uploaded bytes and keep them out of logs and RAG.
- [ ] Require a successful receipt for the same request before automatic quote or draft creation, while preserving independent rule and eligibility gates. Upload never changes policy or binds coverage.

## Scope and out of scope

In scope:
- The behavior in the draft criteria above, using synthetic data.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Real document verification, OCR, medical evidence collection, and underwriting.
- Further exclusions to confirm during refinement.

## Dependencies
- FR-01, FR-02, and FR-03 provide session, request, and ownership context. FR-05 provides final cited document guidance; FR-08 consumes the mock receipt. FR-06 is outside MVP.

- Determine prerequisites and sequencing with the Product Owner.

## Related subtasks

None identified; confirm during refinement.

## Accepted decisions and readiness
- 2026-11-18: Replace bypass with a synthetic upload and `RECEIVED_MOCK`; no business content validation or retention of file bytes.

- Open question: Confirm precise inputs, error cases, dependencies, and any UX handoff before implementation.
- Status: Backlog draft; not ready for implementation or Issue creation.

## UX handoff references

- Not yet identified; add design documents and browser-viewable mockups if this ticket includes UI.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
