# Requirements and ticket workflow

The [PRD](PRD.md) records the business goal, scope, cross-feature safety boundaries, and success measures. The [ADR](ADR.md) records architecture choices. Feature IDs, detailed requirements, and acceptance criteria live in one Markdown file per ticket:

- `docs/backlog/fr-<number>-<slug>.md` is a draft for upcoming work. Refine it with the Product Owner before implementation; a feature entry alone is not ready to build.
- `docs/tickets/fr-<implementation-order>-<slug>.md` is the detailed requirement for a current implementation ticket. Local numbers are consecutive across the current and upcoming files in the [backlog order](backlog/README.md); already closed Issues predate this numbering. Feature IDs and GitHub Issue numbers are separate identifiers. Keep the file's requirements and acceptance criteria current as scope changes.
- Repository workflow work that is not a product feature uses `docs/tickets/chore-<slug>.md` so it does not consume an FR implementation number.

The local Markdown ticket is the single source of truth for build requirements, acceptance criteria, dependencies, accepted decisions, and build readiness. GitHub Issues track ownership, labels, discussion, delivery status, and human handover. Issue discussion changes the spec only after the accepted decision is written into the local ticket. Issues link the ticket; tickets link back. Record native sub-issues and blocking dependencies in GitHub where available.

When work is selected, refine its backlog file into testable requirements, assign its implementation-order number, create or identify its GitHub Issue, and move the file to `docs/tickets/fr-<implementation-order>-<slug>.md`. Before implementation, the ticket must identify dependencies, applicable UX/architecture references, acceptance criteria, and the synthetic-data and human-review boundaries it touches.

## Automation and document updates

Run `npm run ticket:create -- docs/tickets/<file>.md` from the repository root with `gh` authenticated. It reuses an Issue that already links the ticket, creates one otherwise, and writes the reciprocal link into the ticket. Review and commit that file. Do not create a second Issue for the same ticket. The Issue form is a fallback when the command is unavailable.

Every PR uses `.github/pull_request_template.md`: replace its ticket path and Issue placeholders, set `Type: ticket/UX` or `Type: implementation`, and list changed documentation paths or `Documentation: No change: <reason>`. The `Ticket links` check verifies the cross-links, acceptance criteria for implementation, the ticket file in a ticket/UX PR, and the documentation declaration. Make that check required in branch protection after existing PRs are brought into compliance. The `Ticket Issue activity` workflow writes only between its automation markers in the Issue, listing related PRs and merge states. Run `npm run ticket:sync -- docs/tickets/<file>.md` to refresh an existing Issue manually. Automation does not close Issues or mark human approval. Do not use `Closes` or `Fixes` in PR descriptions before acceptance.

In the same PR as a behavior change, update the local ticket and Issue summary for ticket-level scope; update the PRD and affected tickets for product-level scope; update API, stack, test-command, or design documents when those contracts change. Reviewers verify documentation content because the check only validates paths. Before `bmad-build`, run `npm run ticket:preflight -- docs/tickets/<file>.md`, then read the ticket in full and inspect its linked Issue and PRs; if implementation is already in review, merged, or blocked, report the next action instead of repeating the build. A human marks a ticket Done after acceptance. The weekly `Ticket drift` action reports stale automation sections for repair.

## Ticket creation flow

1. Refine the backlog draft into a detailed local ticket with scope, dependencies, open questions, and testable acceptance criteria.
2. Run `npm run ticket:create -- docs/tickets/<file>.md`, review its linked Issue, and commit the reciprocal link on a task branch.
3. For UI work, complete and verify `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable HTML mockups. Add their paths to the local ticket and GitHub Issue, and commit the ticket link update.
4. Commit only the validated UX handoff files, push the task branch, and open a PR against the intended base. The PR includes the requirement-ticket commits and UX handoff commit, links the ticket and delivered design paths, and is the last step of the ticket creation flow.

Implementation starts after the reviewed ticket and UX handoff are ready; `bmad-build` follows those approved requirements as a separate delivery flow.

The existing [ticket 1](tickets/fr-1-authenticate-staff.md) holds the detailed FR-14 requirements and links to GitHub Issue #13. FR-01 and FR-03 already have closed GitHub Issues; the other FR drafts are in [backlog](backlog/).
