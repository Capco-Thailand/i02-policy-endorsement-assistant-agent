# FR-07 — Mock Document Upload
**Title:** [Story] Upload a synthetic document without content verification
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/87
**Feature ID:** FR-07
**Product context:** [PRD](../PRD.md)
**Risk:** High — a mock receipt presented as verification could mislead customers or expose uploaded data.
**State:** Retired; see [cleanup ticket](chore-remove-fr-07-mock-upload.md)

## Summary and objective
This ticket records the previously implemented synthetic upload. The capability is outside the current endorsement MVP and was removed in the [cleanup ticket](chore-remove-fr-07-mock-upload.md).

## Historical requirement
The original story delivered a standalone synthetic upload with an unverified receipt. It is retained here for traceability, not as a current build requirement.

## Business and technical context
- [PRD](../PRD.md) excludes upload from the endorsement MVP flow. The [cleanup ticket](chore-remove-fr-07-mock-upload.md) removes the implemented capability and its FR-08 receipt gate.
- The prior `/document-bypass` and `BYPASSED_MOCK` contract was replaced by the existing mock upload. This ticket does not claim a production upload integration.

## Historical acceptance criteria (retired)
- [ ] For the existing standalone mock-upload capability, the UI labels its synthetic document guidance as a demonstration fixture and never presents it as a verified requirement or as evidence used by the endorsement assessment.
- [ ] The customer can select and upload one synthetic file for the request. Accept PDF, PNG, or JPEG up to 10 MiB; reject empty, unsupported, or oversized uploads with a clear technical error. Any accepted file passes the **mock business check** regardless of name or contents. Do not run OCR, authenticity, health assessment, or matching against RAG requirements. Tell customers to use synthetic files only and never upload real identity or health records.
- [ ] A completed upload returns `RECEIVED_MOCK` and plainly says the document was received for demonstration only and was not verified. The UI distinguishes selected, uploading, received, and failed states. RAG never indexes or reads uploaded bytes.
- [ ] The API derives actor and request ownership from the session, rejects missing sessions with `401`, unknown/unowned policy or request with the same non-disclosing `404`, and expired policies with `409`. Rejected calls do not record successful receipt.
- [ ] Persist request ID, actor, policy, status, safe file metadata, and time in a durable audit event; failed audit writes fail the operation. Discard uploaded bytes after receipt rather than persisting or forwarding them. Do not log file content, credentials, session secrets, or unnecessary personal data.
- [ ] The existing mock-upload capability is outside the endorsement MVP flow. A missing, failed, or unresolved upload cannot block the preliminary assessment, calculation, or proposal; a successful upload cannot override missing/conflicting rules or other ineligibility. A receipt proves only that an allowed synthetic file was received. No upload or receipt changes the policy or binds coverage.
- [ ] API schema, UI, and tests cover receipt, arbitrary allowed content, disclosure, missing/failed upload, technical rejection, session and cross-account boundaries, expired policy, audit failure, and unchanged policy data.

## Scope and out of scope
Former scope: authenticated synthetic upload API and UI, mock receipt, fixture guidance, and audit event. Current removal scope belongs to the [cleanup ticket](chore-remove-fr-07-mock-upload.md).
Out of scope: real document verification, OCR, medical evidence collection, identity checks, underwriting, eligibility decision, quote, and draft creation.

## Dependencies
FR-01, FR-02, and FR-03 supply session, ownership, and request context for the existing capability. FR-05 has no MVP guidance dependency on FR-07; FR-08 does not require a mock receipt to assess a request.

## Related subtasks
None.

## Accepted decisions and readiness
- 2026-11-23: Retire the mock upload through the [cleanup ticket](chore-remove-fr-07-mock-upload.md); it is outside the endorsement MVP assessment, calculation, and proposal contract.

## UX handoff references
Historical design contracts are retained for traceability; the retired mock page was deleted.
- [Visual contract](../../_bmad-output/initiative-customer-authentication/ux-mock-document-upload/DESIGN.md)
- [Behavior contract](../../_bmad-output/initiative-customer-authentication/ux-mock-document-upload/EXPERIENCE.md)

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
