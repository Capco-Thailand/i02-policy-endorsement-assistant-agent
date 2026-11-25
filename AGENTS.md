<!-- bmad:context -->
<!-- Verified 2026-11-16 against the monorepo workspace setup and ticket workflow. Managed by bmad-project-context. -->

## BMad delivery workflow

This repository preserves the ticket, UX, implementation, and GitHub delivery flow for a new project. Before using it, replace `docs/PRD.md` with that project's business scope and boundaries, update [TICKETING.md](docs/TICKETING.md) with its ticket rules, and replace [ADR.md](docs/ADR.md) with its architecture decisions. The roles share the repository; folder routes indicate usual work areas, not exclusive ownership.

The root `package.json` and lockfile currently provide ticket commands and their tests. Add the new application's workspaces, checks, and browser E2E command before implementation. The ticket scripts retain `FR` as the feature ID prefix; change it consistently across scripts, templates, and tests if the new project chooses another prefix.

Before code or infrastructure work, adapt [CODING_STANDARDS.md](docs/CODING_STANDARDS.md) to the new stack. Before tests or security checks, adapt [TESTING_STANDARD.md](docs/TESTING_STANDARD.md). Before UX work, adapt [DESIGN_STANDARD.md](docs/DESIGN_STANDARD.md) and [VISUAL_UX_CONSTRAINTS.md](docs/VISUAL_UX_CONSTRAINTS.md). These documents still contain decisions from the previous application.

## Project boundaries

- Record the new project's data, authorization, security, and side-effect boundaries in its PRD and tickets before implementing features. Apply those boundaries in the app and its tests.

## Where things are

- PO/UX: `docs/PRD.md` for product-level requirements, `docs/backlog/` for upcoming ticket drafts, `docs/tickets/` for current detailed requirements, `.github/ISSUE_TEMPLATE/` for Issue structure, `design/` for HTML/CSS/JS design output, and GitHub Issues for delivery tracking. Create the missing ticket and design folders when work begins.
- QA/Sec: work across affected components. Keep component tests beside their code; put shared test plans and security guidance in `docs/`.
- BE/Infra: own the new project's API and repository infrastructure when added; record the chosen stack and API boundary in its ADR.
- FE/Data/AI: own the new project's interface and data or AI work when added. Coordinate shared API and domain contracts with BE/Infra.

## Skill routing

- Open non-draft pull requests by default. Use draft status only when the user explicitly asks for it.

- For `bmad do fr-<number>`, keep the ticket/UX PR merge and Issue creation flow. After the Issue exists, follow `.agents/skills/bmad/references/do-feature.md`: create an implementation branch, prepare a plan from the `bmad-build` plan template and ticket, run `bmad-build`, run browser E2E and record its report and criterion coverage, then open an implementation PR. The target `Ticket links` workflow enables auto-merge after validation and code checks pass. After merge, Issue automation marks the linked Issue Done; resume existing work instead of creating duplicates. These GitHub workflows are disabled on this branch until the new project's checks are configured and verified.

- Requirements and GitHub Issues: use BMad `bmad-agent-po` and [TICKET_TEMPLATE.md](docs/TICKET_TEMPLATE.md). Name backlog and ticket files by FR ID; create `docs/backlog/README.md` to record build order. The local Markdown ticket owns build requirements and accepted decisions; its full content is displayed and refreshed in the GitHub Issue. For a new ticket, commit and merge the ticket/UX PR before Issue creation. If an active Issue already exists, preserve its number, edit the local ticket, and refresh that Issue with `npm run ticket:sync -- docs/tickets/<file>.md` while automation is disabled; do not create another Issue for an edit or push. Before implementation, run `npm run ticket:preflight -- docs/tickets/<file>.md`, then use `bmad-build` with the local ticket. On `main` and branches under `test/`, preflight waives the merged ticket/UX PR requirement for build testing; all other checks and UX document reading still apply. UX decisions: `bmad-ux`. Use `bmad` when the next BMad step is unclear.
- BMad setup or render failures on Windows: use `bmad-render-repair`.
- Module design: use Matt Pocock `codebase-design`; domain terminology: `domain-modeling`; hard bugs: `diagnosing-bugs`; test-first changes: `tdd`; branch or PR review: `code-review`.
- When a task uses both, keep the local ticket file as the detailed requirements source, the GitHub Issue as its readable copy and delivery tracker, and use the Matt Pocock skill for its focused engineering method.
- For UI ticket creation, run `bmad-ux` from the ticket requirements. UX delivers `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable `design/page/<pagename>.html` mockups linked from `design/page/index.html`; Sofia links these in the local ticket. Open one PR containing the requirement ticket and UX handoff ready for review by default; use draft status only when explicitly requested. After merge, use `npm run ticket:create -- docs/tickets/<file>.md` while Issue automation is disabled. `bmad-build` follows the reviewed ticket and UX documents later, then verifies UI behavior and accessibility. See [DESIGN_STANDARD.md](docs/DESIGN_STANDARD.md) and [TICKETING.md](docs/TICKETING.md#ticket-creation-flow).

## Documentation maintenance

- Before finishing a change, check whether it changed documented behavior, API contracts, stack choices, test commands, or design conventions. Update the affected `docs/` files in the same change.
- Update this file when a repo-wide rule, role route, or document path changes. Keep detailed guidance in `docs/`, and verify that every linked path exists before marking the new project's workflow ready.
- When a product-level requirement changes, update the PRD and affected ticket files with the implementation. When a ticket-level requirement changes, update its local file with the implementation and refresh its existing active Issue copy; while Issue automation is disabled, run `npm run ticket:sync -- docs/tickets/<file>.md`. Do not rewrite a requirement merely to fit existing code or create a duplicate Issue.

<!-- /bmad:context -->
