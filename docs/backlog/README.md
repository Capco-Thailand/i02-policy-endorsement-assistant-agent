# Requirement order

This is the implementation order for the [product scope in the PRD](../PRD.md). A draft becomes ready for implementation after its requirements, acceptance criteria, dependencies, and fresh UX handoff are reviewed in a merged PR and its GitHub tracking Issue is created. Backlog filenames use feature IDs; the order below records dependencies and may differ from the ID sequence. GitHub Issue numbers are separate.

| Order | Feature ID and outcome | Requirement record | State |
|---:|---|---|---|
| 1 | FR-01 Authenticate Customers | [Ticket](../tickets/fr-01-authenticate-customers.md) | Implementation merged in PR #54; [Issue #51](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/51) awaits acceptance |
| 2 | FR-03 Check Policy Access | [Ticket](../tickets/fr-03-check-policy-access.md) | Implementation merged in PR #59; [Issue #57](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/57) awaits acceptance |
| 3 | FR-02 Create Endorsement Request | [Ticket](../tickets/fr-02-create-endorsement-request.md) | Implementation merged in PR #61; [Issue #52](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/52) awaits acceptance |
| 4 | Persist prototype data in Neon | [Ticket](../tickets/chore-migrate-persistence-to-neon.md) | Implementation merged in PR #80; [Issue #73](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/73) records handover |
| 5 | FR-04 Retrieve Policy Details with RAG | [Ticket](../tickets/fr-04-retrieve-policy-details-with-rag.md) | Implemented on `main`; integration with revised endorsement assessment pending |
| 6 | FR-05 Retrieve Endorsement Rules with RAG | [Ticket](../tickets/fr-05-retrieve-endorsement-rules-with-rag.md) | Implementation merged in PR #112; revised endorsement flow pending |
| — | FR-06 Verify Customer Identity | [Ticket](../tickets/fr-06-verify-customer-identity-mock-ekyc.md) | Removed from MVP scope; existing implementation is not a workflow gate |
| — | FR-07 Mock Document Upload | [Ticket](../tickets/fr-07-bypass-document-verification-mock.md) | Existing mock upload capability; removed from the endorsement MVP flow for now |
| 8 | FR-08 Check Endorsement Eligibility | [Ticket](../tickets/fr-08-check-endorsement-eligibility.md) | Implementation merged in PR #117; revised assessment contract pending |
| 9 | FR-09 Calculate Premium and Benefit Impact | [Draft](fr-09-calculate-premium-impact-mock-quote.md) | Backlog |
| 10 | FR-10 Prepare Updated-Policy Proposal | [Draft](fr-10-create-draft-endorsement-for-human-approval.md) | Backlog |
| 11 | FR-11 Customer Review and Decision | [Draft](fr-11-review-approve-reject-endorsement-draft.md) | Backlog |
| 12 | FR-12 Customer Change History and Audit | [Draft](fr-12-record-activity-audit-history.md) | Backlog |
| 13 | FR-13 Run with Docker Compose | [Draft](fr-13-run-the-system-with-docker-compose.md) | Backlog |
| 14 | FR-14 Expand Policy Detail with Product and Coverage Information | [Draft](fr-14-expand-policy-detail-with-coverage.md) | Backlog |
