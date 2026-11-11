# [Chore] Automate ticket, Issue, and PR tracking

**Product context:** [PRD](../PRD.md)  
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/19

## Summary and objective
Make local Markdown tickets the build specification while GitHub tracks linked Issues, PRs, delivery activity, and human handover.

## Requirements
- A merged ticket/UX PR triggers Issue creation and reciprocal linking without duplicating Issues. A manual repair command is available only after merge.
- Ticket/UX PRs declare their ticket, pending Issue, type, and documentation changes. Implementation PRs declare the resulting Issue number. A required check rejects broken links and incomplete declarations.
- PR activity updates only an automated Issue section. Human handover and acceptance stay human-owned.
- A build preflight identifies existing implementation work before another build starts.
- Documentation and agent instructions explain which record owns each field and how changes are updated together.
- Validated ticket/UX PRs auto-merge after required checks; merged code is reconciled to linked implementation PRs, including human-triggered merges.
- GitHub Issues display the complete local ticket content, refreshed after merged ticket changes, while retaining human handover and discussion.

## Acceptance criteria
- [ ] Merging a ticket/UX PR creates or reuses one Issue and links it to the merged ticket; a protected default branch produces a link PR instead of silently losing the link.
- [ ] PR checks accept `Issue: Pending` only for ticket/UX work and reject missing or mismatched ticket, Issue, type, and documentation fields for implementation; UI implementation requires a merged UX handoff.
- [ ] Issue activity reflects related PR open and merge states without overwriting human text or closing the Issue.
- [ ] Preflight blocks a duplicate build when implementation is already open or merged.
- [ ] Scheduled drift checks report stale automation data, and documentation describes the review and rollout gates.
- [ ] Ticket/UX PRs with only allowed handoff files auto-merge after checks; code-bearing PRs cannot use this path.
- [ ] A push with code lacking a linked implementation PR fails the activity workflow; merged implementation remains pending human acceptance.
- [ ] A created or reused Issue shows the full ticket Markdown, and later syncs refresh that content without overwriting human handover.

## Dependencies and readiness
- GitHub CLI authentication for local commands; GitHub Actions permissions for workflow jobs.
- The workflow check can become required after this ticket's PR merges and the first check has run.

## Accepted decisions
- 2026-11-11: Moved back to backlog for the ticket workflow test; historical Issue #19 was closed. Review this requirement before selecting it again.
- The Markdown ticket owns build context. GitHub Issues own delivery discussion and human handover.
- Merging a PR does not approve or complete its Issue.
- Delivery state is derived from merged PRs; the ticket remains authoritative for requirements and accepted decisions.
- 2026-11-11: New ticket/UX PRs merge before their GitHub Issues are created. The merge workflow creates or reuses one Issue and links it back to the ticket. Existing linked tickets retain their Issue numbers.
- 2026-11-11: Show the full ticket in each generated Issue; keep the local file authoritative and refresh the marked Issue copy after ticket changes merge.
