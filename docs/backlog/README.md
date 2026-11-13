# Requirement order

This is the implementation order for the [product scope in the PRD](../PRD.md). FR-01 is selected for a ticket and UX handoff; the other requirements remain in backlog. A draft becomes ready for implementation after its requirements, acceptance criteria, dependencies, and UX handoff are reviewed in a merged PR and its GitHub tracking Issue is created. Backlog filenames use feature IDs; the order below records dependencies and may differ from the ID sequence. GitHub Issue numbers are separate.

| Order | Feature ID and outcome | Requirement record | State |
|---:|---|---|---|
| 1 | FR-01 Authenticate Customers | [Ticket](../tickets/fr-01-authenticate-staff.md) | [PR #32](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/pull/32) handoff pending; [active Issue #33](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/33) |
| 2 | FR-03 Check Policy Access | [Draft](fr-03-check-policy-access.md) | Backlog; historical GitHub #3 closed |
| 3 | FR-02 Create Endorsement Request | [Draft](fr-02-create-endorsement-request.md) | Backlog; historical GitHub #24 closed |
| 4 | FR-04 Retrieve Policy Details with RAG | [Draft](fr-04-retrieve-policy-details-with-rag.md) | Backlog |
| 5 | FR-05 Retrieve Endorsement Rules with RAG | [Draft](fr-05-retrieve-endorsement-rules-with-rag.md) | Backlog |
| 6 | FR-06 Verify Customer Identity | [Draft](fr-06-verify-customer-identity-mock-ekyc.md) | Backlog |
| 7 | FR-07 Bypass Document Verification | [Draft](fr-07-bypass-document-verification-mock.md) | Backlog |
| 8 | FR-08 Check Endorsement Eligibility | [Draft](fr-08-check-endorsement-eligibility.md) | Backlog |
| 9 | FR-09 Calculate Premium Impact | [Draft](fr-09-calculate-premium-impact-mock-quote.md) | Backlog |
| 10 | FR-10 Prepare Updated-Policy Proposal | [Draft](fr-10-create-draft-endorsement-for-human-approval.md) | Backlog |
| 11 | FR-11 Customer Review and Decision | [Draft](fr-11-review-approve-reject-endorsement-draft.md) | Backlog |
| 12 | FR-12 Customer Change History and Audit | [Draft](fr-12-record-activity-audit-history.md) | Backlog |
| 13 | FR-13 Run with Docker Compose | [Draft](fr-13-run-the-system-with-docker-compose.md) | Backlog |

Historical [Issue #1](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/1) covered policy list and detail before the current FR numbering. Its work is a prerequisite for FR-02 and FR-03, not a second FR-01 ticket.
