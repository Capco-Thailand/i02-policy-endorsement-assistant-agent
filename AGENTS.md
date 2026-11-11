<!-- bmad:context -->
<!-- Verified 2026-11-11 against the monorepo workspace setup and ticket workflow. Managed by bmad-project-context. -->

## Policy Endorsement Assistant

This is a prototype for synthetic insurance policy endorsements. Read `docs/PRD.md` for business scope and product boundaries, [TICKETING.md](docs/TICKETING.md) for detailed requirement locations and GitHub tracking, and [ADR.md](docs/ADR.md) for the application stack and API boundary. The four roles share the repository; folder routes indicate the usual work area, not exclusive ownership.

Use the root npm workspace for `apps/api`, `apps/web`, and `apps/ai`; install from the repository root and keep the root lockfile. See [README.md](README.md) for development commands.

For code or infrastructure changes, read [CODING_STANDARDS.md](docs/CODING_STANDARDS.md). For tests or security checks, read [TESTING_STANDARD.md](docs/TESTING_STANDARD.md). For UX design files, read [DESIGN_STANDARD.md](docs/DESIGN_STANDARD.md) and [VISUAL_UX_CONSTRAINTS.md](docs/VISUAL_UX_CONSTRAINTS.md).

## Policy

- Use synthetic policy data only. Never connect to live insurer or policy systems, bind coverage, or treat a draft as approval; drafts remain non-binding and pending human review.

## Where things are

- PO/UX: `docs/PRD.md` for product-level requirements, `docs/backlog/` for upcoming ticket drafts, `docs/tickets/` for current detailed requirements, `.github/ISSUE_TEMPLATE/` for Issue structure, `design/` for HTML/CSS/JS design output, and GitHub Issues for delivery tracking.
- QA/Sec: work across affected components. Keep component tests beside their code; put shared test plans and security guidance in `docs/`.
- BE/Infra: `apps/api/` uses Fastify with Swagger/OpenAPI documentation; own repository infrastructure such as Docker or scripts when added.
- FE/Data/RAG: `apps/web/` uses React with Next.js App Router, TanStack Query for client-side server state, and shadcn/ui; `apps/ai/` holds data and RAG work when needed. Coordinate typed API and rule contracts with BE/Infra.

## Skill routing

- Requirements and GitHub Issues: use BMad `bmad-agent-po` and [TICKET_TEMPLATE.md](docs/TICKET_TEMPLATE.md). The local Markdown ticket owns build requirements and accepted decisions; create or reconnect its Issue with `npm run ticket:create -- docs/tickets/<file>.md`. Before delivery, run `npm run ticket:preflight -- docs/tickets/<file>.md`, then use `bmad-build` with the local ticket. UX decisions: `bmad-ux`. Use `bmad` when the next BMad step is unclear.
- BMad setup or render failures on Windows: use `bmad-render-repair`.
- Module design: use Matt Pocock `codebase-design`; domain terminology: `domain-modeling`; hard bugs: `diagnosing-bugs`; test-first changes: `tdd`; branch or PR review: `code-review`.
- When a task uses both, keep the local ticket file as the detailed requirements source, the GitHub Issue as the delivery tracker, and use the Matt Pocock skill for its focused engineering method.
- For UI ticket creation, run `bmad-ux` from the ticket requirements. UX delivers `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable `design/page/<pagename>.html` mockups linked from `design/page/index.html`; Sofia links these in the local ticket and GitHub Issue. Open one PR containing the requirement ticket and UX handoff for team review as the last ticket-creation step. `bmad-build` follows the reviewed ticket and UX documents later, then verifies UI behavior and accessibility. See [DESIGN_STANDARD.md](docs/DESIGN_STANDARD.md) and [TICKETING.md](docs/TICKETING.md#ticket-creation-flow).

## Documentation maintenance

- Before finishing a change, check whether it changed documented behavior, API contracts, stack choices, test commands, or design conventions. Update the affected `docs/` files in the same change.
- Update this file when a repo-wide rule, role route, or document path changes. Keep detailed guidance in `docs/`, and verify that every path linked here still exists.
- When a product-level requirement changes, update the PRD and affected ticket files with the implementation. When a ticket-level requirement changes, update its local file and GitHub Issue link or summary with the implementation; do not rewrite a requirement merely to fit existing code.

<!-- /bmad:context -->
