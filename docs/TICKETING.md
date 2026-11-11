# Requirements and ticket workflow

The [PRD](PRD.md) records the business goal, scope, cross-feature safety boundaries, and success measures. The [ADR](ADR.md) records architecture choices. Feature IDs, detailed requirements, and acceptance criteria live in one Markdown file per ticket:

- `docs/backlog/fr-<number>-<slug>.md` is a draft for upcoming work. Refine it with the Product Owner before implementation; a feature entry alone is not ready to build.
- `docs/tickets/fr-<implementation-order>-<slug>.md` is the detailed requirement for a selected ticket. Local numbers are consecutive across the current and upcoming files in the [backlog order](backlog/README.md); already closed Issues predate this numbering. Feature IDs and GitHub Issue numbers are separate identifiers. Keep the file's requirements and acceptance criteria current as scope changes.
- Repository workflow work that is not a product feature uses `docs/tickets/chore-<slug>.md` so it does not consume an FR implementation number.

The local Markdown ticket is the single source of truth for build requirements, acceptance criteria, dependencies, accepted decisions, and build readiness. GitHub Issues track ownership, labels, discussion, delivery status, and human handover. Issue discussion changes the spec only after the accepted decision is written into the local ticket. Issues link the ticket; tickets link back. Record native sub-issues and blocking dependencies in GitHub where available.

When work is selected, refine its backlog file into testable requirements, assign its implementation-order number, and move the file to `docs/tickets/fr-<implementation-order>-<slug>.md`. Put `**GitHub Issue:** Pending ticket/UX PR merge` in the ticket. Before implementation, the ticket must identify dependencies, applicable UX/architecture references, acceptance criteria, and the synthetic-data and human-review boundaries it touches.

## Automation and document updates

The merged ticket/UX PR triggers `Ticket Issue activity` to create or reuse one Issue and add the reciprocal ticket link. The workflow writes the link to the default branch directly when allowed; if branch protection blocks that write, it opens a small link PR. Do not create the Issue before the ticket/UX PR merges. `npm run ticket:create -- docs/tickets/<file>.md` is a manual repair command for a merged handoff; it refuses an unmerged ticket. The Issue form is a fallback after merge when automation is unavailable.

Every PR uses `.github/pull_request_template.md`: set `Issue: Pending` and `Type: ticket/UX` for the handoff PR; use the resulting `Issue: #<number>` and `Type: implementation` for a build PR. List changed documentation paths or `Documentation: No change: <reason>`. The `Ticket links` check validates the ticket and documentation declaration before handoff merge, then verifies reciprocal links and acceptance criteria for implementation. Make that check required in branch protection after existing PRs are brought into compliance. The `Ticket Issue activity` workflow creates the Issue on handoff merge and updates only its automation markers for later PR activity. `npm run ticket:sync -- docs/tickets/<file>.md` refreshes an existing Issue manually. Automation does not close Issues or mark human approval. Do not use `Closes` or `Fixes` in PR descriptions before acceptance.

In the same PR as a behavior change, update the local ticket and Issue summary for ticket-level scope; update the PRD and affected tickets for product-level scope; update API, stack, test-command, or design documents when those contracts change. Reviewers verify documentation content because the check only validates paths. Before `bmad-build`, run `npm run ticket:preflight -- docs/tickets/<file>.md`, then read the ticket in full and inspect its linked Issue and PRs; if implementation is already in review, merged, or blocked, report the next action instead of repeating the build. A human marks a ticket Done after acceptance. The weekly `Ticket drift` action reports stale automation sections for repair.

## Ticket creation flow

1. Move the backlog draft to a numbered local ticket; refine scope, dependencies, open questions, and testable acceptance criteria.
2. For UI work, complete and verify `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable HTML mockups. Add their paths to the local ticket.
3. Commit the ticket and UX handoff on a task branch. Open one PR with `Issue: Pending` and `Type: ticket/UX`; review and merge it.
4. Merge automation creates the GitHub Issue, links the merged ticket, and records the handoff PR. Review the Issue and any link PR before implementation.

Implementation starts after the reviewed ticket and UX handoff are ready, the Issue exists, and the reciprocal link is on the default branch; `bmad-build` follows those approved requirements as a separate delivery flow.

The existing [ticket 1](tickets/fr-1-authenticate-staff.md) holds the detailed FR-14 requirements and links to GitHub Issue #13. FR-01 and FR-03 already have closed GitHub Issues; the other FR drafts are in [backlog](backlog/).
