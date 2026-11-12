# Requirements and ticket workflow

The [PRD](PRD.md) records the business goal, scope, cross-feature safety boundaries, and success measures. The [ADR](ADR.md) records architecture choices. Feature IDs, detailed requirements, and acceptance criteria live in one Markdown file per ticket:

- `docs/backlog/fr-<feature-id>-<slug>.md` is a draft for upcoming work. Refine it with the Product Owner before implementation; a feature entry alone is not ready to build.
- `docs/tickets/fr-<feature-id>-<slug>.md` is the detailed requirement for a selected ticket. Keep the FR ID when moving it from backlog. [Backlog order](backlog/README.md) records build sequence separately; historical GitHub Issue numbers are separate identifiers. Keep the file's requirements and acceptance criteria current as scope changes.
- Repository workflow work that is not a product feature uses `docs/tickets/chore-<slug>.md` so it does not consume an FR implementation number.

The local Markdown ticket is the single source of truth for build requirements, acceptance criteria, dependencies, accepted decisions, and build readiness. The GitHub Issue displays a synchronized copy of its full Markdown content for review. GitHub Issues also track ownership, labels, discussion, delivery status, and human handover. The Issue automation block derives delivery state from merged PRs; only a human marks acceptance and Done. Do not copy transient delivery status into the ticket. Issue discussion changes the spec only after the accepted decision is written into the local ticket. The Issue and ticket link to each other. Record native sub-issues and blocking dependencies in GitHub where available.

GitHub Issues and PRs labeled `LEGACY` are retired history. The existing misspelled label `LAGECY` has the same meaning until renamed. Exclude either label from duplicate-ticket lookup, current handoff or implementation evidence, and readiness decisions; use such records only for historical context. A new ticket may reuse the FR ID but must link an active Issue and PR.

When work is selected, refine its backlog file into testable requirements and move it to `docs/tickets/fr-<feature-id>-<slug>.md` without changing its FR ID. Put `**GitHub Issue:** Pending ticket/UX PR merge` in the ticket. Before implementation, the ticket must identify dependencies, applicable UX/architecture references, acceptance criteria, and the synthetic-data and human-review boundaries it touches.

## Automation and document updates

`Ticket Issue activity` runs after a PR merges into `main` or the temporary `test/create-ticket` branch. For a ticket/UX handoff, it creates or reuses one Issue, publishes the ticket, and adds the reciprocal link on the PR's base branch. Pushes to either branch refresh Issue content and delivery activity from that branch. The workflow is enabled in GitHub for this test. `npm run ticket:create -- docs/tickets/<file>.md` is a manual repair command after a merged handoff; it refuses an unmerged ticket. The Issue form is a fallback when automation is unavailable.

For FR-01, [Issue #33](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/33) was requested while its [new ticket](tickets/fr-01-authenticate-staff.md) and UX handoff were still in a draft PR. Retain #33 through handoff review and merge; it does not make FR-01 implementation-ready. Historical Issue #30 is retired.

Ticket/UX and implementation PRs use `.github/pull_request_template.md`: set `Issue: Pending` and `Type: ticket/UX` for the handoff PR; use the resulting `Issue: #<number>` and `Type: implementation` for a build PR. List changed documentation paths or `Documentation: No change: <reason>`. Ticket validation is temporarily paused: `Ticket links` reports success without checking PR metadata, changed files, ticket links, or documentation. Review handoff and implementation PRs manually. The `Merge validated ticket handoff` workflow is also paused, so merge reviewed PRs manually. `Ticket Issue activity` creates or reuses an Issue after a merged handoff; `npm run ticket:sync -- docs/tickets/<file>.md` refreshes an existing Issue manually. Automation does not close Issues or mark human approval. Do not use `Closes` or `Fixes` in PR descriptions before acceptance.

In the same PR as a behavior change, update the local ticket for ticket-level scope. Update the PRD and affected tickets for product-level scope; update API, stack, test-command, or design documents when those contracts change. Reviewers verify documentation content manually. Before `bmad-build`, run `npm run ticket:preflight -- docs/tickets/<file>.md`, then read the ticket in full and inspect its linked Issue and PRs; if implementation is already in review, merged, or blocked, report the next action instead of repeating the build. On the exact `test/create-ticket` branch, preflight skips only the merged ticket/UX PR requirement so the build flow can be tested with the local UX documents; the Issue link, legacy, implementation, and handover checks still apply. Other branches require the merged handoff. A human marks a ticket Done after acceptance. Issue activity refreshes its copy and delivery state after a merge or branch push. Revert PRs should link the affected ticket and Issue. The weekly `Ticket drift` validation is paused.

## Ticket creation flow

1. Move the backlog draft to a numbered local ticket; refine scope, dependencies, open questions, and testable acceptance criteria.
2. For UI work, complete and verify `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable HTML mockups. Add their paths to the local ticket.
3. Commit the ticket and UX handoff on a task branch. Open one PR with `Issue: Pending` and `Type: ticket/UX`; review and merge it.
4. After the merge, `Ticket Issue activity` creates or reuses the GitHub Issue and links the merged ticket. Review the Issue and any link PR before implementation.

Implementation starts after the reviewed ticket and UX handoff are ready, the Issue exists, and the reciprocal link is on the default branch; `bmad-build` follows those approved requirements as a separate delivery flow.

FR-01 authentication is selected as a [ticket](tickets/fr-01-authenticate-staff.md) for a new ticket/UX handoff. FR-02 request capture, FR-03 policy access, and the workflow automation chore remain in [backlog](backlog/). Historical Issues #13, #24, #3, #19, and #30 are retired. Historical Issue #1 covered policy list/detail before the current FR numbering. Review the ticket/UX PR before starting implementation.
