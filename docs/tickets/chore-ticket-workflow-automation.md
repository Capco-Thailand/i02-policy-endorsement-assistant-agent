# [Chore] Automate ticket, Issue, and PR tracking

**Product context:** [PRD](../PRD.md)  
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/19

## Summary and objective
Make local Markdown tickets the build specification while GitHub tracks linked Issues, PRs, delivery activity, and human handover.

## Requirements
- A repeatable command creates or reconnects an Issue and writes reciprocal links without duplicating Issues.
- PRs declare their ticket, Issue, type, and documentation changes; a required check rejects broken links and incomplete declarations.
- PR activity updates only an automated Issue section. Human handover and acceptance stay human-owned.
- A build preflight identifies existing implementation work before another build starts.
- Documentation and agent instructions explain which record owns each field and how changes are updated together.

## Acceptance criteria
- [ ] Rerunning ticket creation for an existing linked ticket reuses the same Issue.
- [ ] PR checks reject missing or mismatched ticket, Issue, type, and documentation fields; UI implementation requires a merged UX handoff.
- [ ] Issue activity reflects related PR open and merge states without overwriting human text or closing the Issue.
- [ ] Preflight blocks a duplicate build when implementation is already open or merged.
- [ ] Scheduled drift checks report stale automation data, and documentation describes the review and rollout gates.

## Dependencies and readiness
- GitHub CLI authentication for local commands; GitHub Actions permissions for workflow jobs.
- The workflow check can become required after this ticket's PR merges and the first check has run.

## Accepted decisions
- The Markdown ticket owns build context. GitHub Issues own delivery discussion and human handover.
- Merging a PR does not approve or complete its Issue.
