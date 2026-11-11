# Requirements and ticket workflow

The [PRD](PRD.md) records the business goal, scope, cross-feature safety boundaries, and success measures. The [ADR](ADR.md) records architecture choices. Feature IDs, detailed requirements, and acceptance criteria live in one Markdown file per ticket:

- `docs/backlog/fr-<number>-<slug>.md` is a draft for upcoming work. Refine it with the Product Owner before implementation; a feature entry alone is not ready to build.
- `docs/tickets/fr-<implementation-order>-<slug>.md` is the detailed requirement for a current implementation ticket. Local numbers are consecutive across the current and upcoming files in the [backlog order](backlog/README.md); already closed Issues predate this numbering. Feature IDs and GitHub Issue numbers are separate identifiers. Keep the file's requirements and acceptance criteria current as scope changes.

GitHub Issues remain the delivery tracker for ownership, labels, dependencies, discussion, Definition of Done, and Progress & Handover. Use the matching form in `.github/ISSUE_TEMPLATE/` and [TICKET_TEMPLATE.md](TICKET_TEMPLATE.md) to draft the file and Issue summary. The Issue links the detailed file and its product context in the PRD; the file links back to the Issue. Record native sub-issues and blocking dependencies in GitHub where available, following `.agents/skills/setup-matt-pocock-skills/issue-tracker-github.md`.

When work is selected, refine its backlog file into testable requirements, assign its implementation-order number, create or identify its GitHub Issue, and move the file to `docs/tickets/fr-<implementation-order>-<slug>.md`. Update the PRD only when the product goal, scope, cross-feature rule, or success measure changes. When a ticket-level requirement changes, edit its local file and synchronize the Issue summary or links in the same change. Before implementation, the ticket must identify dependencies, applicable UX/architecture references, acceptance criteria, and the synthetic-data and human-review boundaries it touches.

## Ticket creation flow

1. Refine the backlog draft into a detailed local ticket with scope, dependencies, open questions, and testable acceptance criteria.
2. Create its GitHub Issue using the matching Issue form. Link the local ticket and PRD product context in the Issue, link the Issue from the local ticket, and commit the ticket on a task branch.
3. For UI work, complete and verify `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable HTML mockups. Add their paths to the local ticket and GitHub Issue, and commit the ticket link update.
4. Commit only the validated UX handoff files, push the task branch, and open a PR against the intended base. The PR includes the requirement-ticket commits and UX handoff commit, links the ticket and delivered design paths, and is the last step of the ticket creation flow.

Implementation starts after the reviewed ticket and UX handoff are ready; `bmad-build` follows those approved requirements as a separate delivery flow.

The existing [ticket 1](tickets/fr-1-authenticate-staff.md) holds the detailed FR-14 requirements and links to GitHub Issue #13. FR-01 and FR-03 already have closed GitHub Issues; the other FR drafts are in [backlog](backlog/). Publishing these files and replacing Issue #13's earlier full body with a link is a separate repository/Issue update.
