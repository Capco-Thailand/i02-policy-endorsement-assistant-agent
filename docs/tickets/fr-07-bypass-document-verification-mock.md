# FR-07 — Mock Document Upload
**Title:** [Story] Upload a synthetic document without content verification
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/87
**Feature ID:** FR-07
**Product context:** [PRD](../PRD.md)
**Risk:** High — a mock receipt presented as verification could mislead customers or expose uploaded data.
**State:** Mock upload implemented with synthetic guidance; FR-05 citation integration pending

## Summary and objective
Let a signed-in customer upload a synthetic file for their own active-policy endorsement request. Show applicable document requirements retrieved by FR-05, acknowledge mock receipt, and state that the file's contents and suitability were not checked.

## User story or requirement
As a customer, I can see which documents may be relevant, upload a synthetic file, and understand that upload success does not mean the document was verified.

## Business and technical context
- [PRD](../PRD.md) requires a mock upload, not an authenticity or completeness check. FR-01 session identity, FR-03 ownership, and FR-02 request context provide the access boundary.
- FR-05 returns cited, versioned document requirements for the product, change type, and effective date. Those requirements are displayed as guidance, not used to inspect uploaded content. FR-07 may be built before FR-05 with clearly labeled synthetic fixture guidance; replace it with FR-05 results when available.
- Existing `/document-bypass` behavior and its `BYPASSED_MOCK` result belong to the prior scope and must be replaced as part of implementation. No production upload integration is claimed by this requirement edit.

## Acceptance criteria
- [ ] For an owned `ACTIVE` policy and its submitted request, the UI shows FR-05's applicable document guidance with source/version citation, or a clearly labeled synthetic fallback until FR-05 exists. Missing or conflicting guidance is shown as unresolved, never as a verified requirement.
- [ ] The customer can select and upload one synthetic file for the request. Accept PDF, PNG, or JPEG up to 10 MiB; reject empty, unsupported, or oversized uploads with a clear technical error. Any accepted file passes the **mock business check** regardless of name or contents. Do not run OCR, authenticity, health assessment, or matching against RAG requirements. Tell customers to use synthetic files only and never upload real identity or health records.
- [ ] A completed upload returns `RECEIVED_MOCK` and plainly says the document was received for demonstration only and was not verified. The UI distinguishes selected, uploading, received, and failed states. RAG never indexes or reads uploaded bytes.
- [ ] The API derives actor and request ownership from the session, rejects missing sessions with `401`, unknown/unowned policy or request with the same non-disclosing `404`, and expired policies with `409`. Rejected calls do not record successful receipt.
- [ ] Persist request ID, actor, policy, status, safe file metadata, and time in a durable audit event; failed audit writes fail the operation. Discard uploaded bytes after receipt rather than persisting or forwarding them. Do not log file content, credentials, session secrets, or unnecessary personal data.
- [ ] The mock receipt is required before automatic quote/draft creation, but it proves only that an allowed file was received. A missing, failed, or unresolved upload blocks progression; a successful upload cannot override missing/conflicting rules or other ineligibility. No upload or receipt changes the policy or binds coverage.
- [ ] API schema, UI, and tests cover receipt, arbitrary allowed content, disclosure, missing/failed upload, technical rejection, session and cross-account boundaries, expired policy, audit failure, and unchanged policy data.

## Scope and out of scope
In scope: authenticated synthetic upload API and UI, mock receipt, cited requirement guidance, and audit event.
Out of scope: real document verification, OCR, medical evidence collection, identity checks, underwriting, eligibility decision, quote, and draft creation.

## Dependencies
FR-01, FR-02, and FR-03 supply session, ownership, and request context. FR-05 supplies final document guidance; a labeled fixture can support the initial vertical slice. FR-08 consumes the mock receipt, not an FR-06 result.

## Related subtasks
None.

## Accepted decisions and readiness
- 2026-11-17: `BYPASSED_MOCK` never means verified.
- 2026-11-18: Replace bypass with synthetic upload and `RECEIVED_MOCK`; do not validate business contents. Keep upload bytes out of storage and RAG. Review revised UX and API contract before implementation.

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
