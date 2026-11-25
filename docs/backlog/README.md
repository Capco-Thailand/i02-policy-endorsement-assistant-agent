# Requirement order

This is the implementation order for the [product scope in the PRD](../PRD.md). A draft becomes ready for implementation after its requirements, acceptance criteria, dependencies, and fresh UX handoff are reviewed in a merged PR and its GitHub tracking Issue is created. Backlog filenames use feature IDs; the order below records dependencies and may differ from the ID sequence. GitHub Issue numbers are separate.

| Order | Feature ID and outcome | Requirement record | State |
|---:|---|---|---|
| 1 | FR-01 Authenticate Customers | [Ticket](../tickets/fr-01-authenticate-customers.md) | Implementation merged in PR #54; [Issue #51](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/51) awaits acceptance |
| 2 | FR-03 Check Policy Access | [Ticket](../tickets/fr-03-check-policy-access.md) | Implementation merged in PR #59; [Issue #57](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/57) awaits acceptance |
| 3 | FR-02 Create Endorsement Request | [Ticket](../tickets/fr-02-create-endorsement-request.md) | Implementation merged in PR #61; [Issue #52](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/52) awaits acceptance |
| 4 | Persist prototype data in Neon | [Ticket](../tickets/chore-migrate-persistence-to-neon.md) | Implementation merged in PR #80; [Issue #73](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/73) records handover |
| 5 | FR-04 Retrieve Policy Details with RAG | [Ticket](../tickets/fr-04-retrieve-policy-details-with-rag.md) | Implemented on `main`; integration with revised endorsement assessment pending |
| 6 | FR-05 Retrieve Endorsement Rules with RAG | [Ticket](../tickets/fr-05-retrieve-endorsement-rules-with-rag.md) | Revised rule retrieval merged in PR #124; CI passed |
| — | FR-06 Verify Customer Identity | [Issue #85](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/85) | Removed from MVP scope; historical requirement retained in the Issue |
| — | FR-07 Mock Document Upload | [Issue #87](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/87) | Removed from MVP scope; historical requirement retained in the Issue |
| 8 | FR-08 Check Endorsement Eligibility | [Ticket](../tickets/fr-08-check-endorsement-eligibility.md) | Revised assessment merged in PR #124; FR-09/10 server gates merged in PRs #133/#137 |
| 9 | FR-09 Calculate Premium and Benefit Impact | [Ticket](../tickets/fr-09-calculate-premium-impact-mock-quote.md) | Implementation merged in PR #133 |
| 10 | FR-10 Prepare Updated-Policy Proposal | [Ticket](../tickets/fr-10-create-draft-endorsement-for-human-approval.md) | Implementation merged in PR #137 |
| 11 | FR-11 Customer Review and Decision | [Ticket](../tickets/fr-11-review-approve-reject-endorsement-draft.md) | Implementation merged in PR #141 |
| 12 | FR-12 Customer Change History and Audit | [Ticket](../tickets/fr-12-record-activity-audit-history.md) | Implementation merged in PR #145 |
| 13 | FR-13 Run with Docker Compose | [Draft](fr-13-run-the-system-with-docker-compose.md) | Backlog |
| 14 | FR-14 Expand Policy Detail with Product and Coverage Information | [Ticket](../tickets/fr-14-expand-policy-detail-with-coverage.md) | Ticket/UX handoff in review |
| 15 | FR-15 Redesign Policy Detail and Proposal Review | [Ticket](../tickets/fr-15-redesign-policy-detail-and-proposal-review.md) | Selected; ticket/UX handoff in review |
| 16 | FR-16 Redesign Sign-in and Policy List | [Ticket](../tickets/fr-16-redesign-sign-in-and-policy-list.md) | Implementation merged in PR #158; [Issue #156](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/156) Done |
| 17 | FR-17 Redesign Request and Eligibility | [Ticket](../tickets/fr-17-redesign-request-and-eligibility.md) | Selected; accepted UX reference; ticket/UX handoff pending |
| 18 | FR-18 Redesign Decision History | [Draft](fr-18-redesign-decision-history.md) | Backlog; follows accepted FR-15 UX patterns |
