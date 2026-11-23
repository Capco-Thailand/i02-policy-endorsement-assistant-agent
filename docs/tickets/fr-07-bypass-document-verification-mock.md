# FR-07 — Mock Document Upload
**Title:** [Story] Upload a synthetic document without content verification
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/87
**Feature ID:** FR-07
**Product context:** [PRD](../PRD.md)
**Risk:** High — a mock receipt presented as verification could mislead customers or expose uploaded data.
**State:** Mock upload implemented; removed from endorsement MVP flow for now

## Summary and objective
Let a signed-in customer upload a synthetic file for their own active-policy endorsement request. Show applicable document requirements retrieved by FR-05, acknowledge mock receipt, and state that the file's contents and suitability were not checked.

## User story or requirement
As a customer, I can see which documents may be relevant, upload a synthetic file, and understand that upload success does not mean the document was verified.

## Business and technical context
- [PRD](../PRD.md) no longer includes upload in the endorsement MVP flow. The existing mock-upload capability retains its access boundary from FR-01, FR-03, and FR-02 but is not a prerequisite or step in the current customer journey.
- FR-05 no longer has an MVP handoff to this upload capability. The existing UI uses clearly labeled synthetic fixture guidance; it does not treat guidance as verification or participate in the endorsement assessment.
- Existing `/document-bypass` behavior and its `BYPASSED_MOCK` result belong to the prior scope and must be replaced as part of implementation. No production upload integration is claimed by this requirement edit.

## Acceptance criteria
- [ ] For the existing standalone mock-upload capability, the UI labels its synthetic document guidance as a demonstration fixture and never presents it as a verified requirement or as evidence used by the endorsement assessment.
- [ ] The customer can select and upload one synthetic file for the request. Accept PDF, PNG, or JPEG up to 10 MiB; reject empty, unsupported, or oversized uploads with a clear technical error. Any accepted file passes the **mock business check** regardless of name or contents. Do not run OCR, authenticity, health assessment, or matching against RAG requirements. Tell customers to use synthetic files only and never upload real identity or health records.
- [ ] A completed upload returns `RECEIVED_MOCK` and plainly says the document was received for demonstration only and was not verified. The UI distinguishes selected, uploading, received, and failed states. RAG never indexes or reads uploaded bytes.
- [ ] The API derives actor and request ownership from the session, rejects missing sessions with `401`, unknown/unowned policy or request with the same non-disclosing `404`, and expired policies with `409`. Rejected calls do not record successful receipt.
- [ ] Persist request ID, actor, policy, status, safe file metadata, and time in a durable audit event; failed audit writes fail the operation. Discard uploaded bytes after receipt rather than persisting or forwarding them. Do not log file content, credentials, session secrets, or unnecessary personal data.
- [ ] The existing mock-upload capability is outside the endorsement MVP flow. A missing, failed, or unresolved upload cannot block the preliminary assessment, calculation, or proposal; a successful upload cannot override missing/conflicting rules or other ineligibility. A receipt proves only that an allowed synthetic file was received. No upload or receipt changes the policy or binds coverage.
- [ ] API schema, UI, and tests cover receipt, arbitrary allowed content, disclosure, missing/failed upload, technical rejection, session and cross-account boundaries, expired policy, audit failure, and unchanged policy data.

## Scope and out of scope
In scope: authenticated synthetic upload API and UI, mock receipt, cited requirement guidance, and audit event.
Out of scope: real document verification, OCR, medical evidence collection, identity checks, underwriting, eligibility decision, quote, and draft creation.

## Dependencies
FR-01, FR-02, and FR-03 supply session, ownership, and request context for the existing capability. FR-05 has no MVP guidance dependency on FR-07; FR-08 does not require a mock receipt to assess a request.

## Related subtasks
None.

## Accepted decisions and readiness
- 2026-11-17: `BYPASSED_MOCK` never means verified.
- 2026-11-18: Replace bypass with synthetic upload and `RECEIVED_MOCK`; do not validate business contents. Keep upload bytes out of storage and RAG. Review revised UX and API contract before implementation.
- 2026-11-23: Supersedes the earlier optional-upload decision: remove upload from the endorsement MVP flow for now. Existing mock-upload code is not part of the assessment, calculation, or proposal contract.

## UX handoff references
- [Visual contract](../../_bmad-output/initiative-customer-authentication/ux-mock-document-upload/DESIGN.md)
- [Behavior contract](../../_bmad-output/initiative-customer-authentication/ux-mock-document-upload/EXPERIENCE.md)
- [Mock upload page](../../design/page/mock-document-upload.html)

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
