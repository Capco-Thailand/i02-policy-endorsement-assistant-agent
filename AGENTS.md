<!-- bmad:context -->
<!-- Verified 2026-11-16 against the monorepo workspace setup and ticket workflow. Managed by bmad-project-context. -->

## Policy Endorsement Assistant

This is a prototype for synthetic insurance policy endorsements. Read `docs/PRD.md` for business scope and product boundaries, [TICKETING.md](docs/TICKETING.md) for detailed requirement locations and GitHub tracking, and [ADR.md](docs/ADR.md) for the application stack and API boundary. The four roles share the repository; folder routes indicate the usual work area, not exclusive ownership.

Use the root npm workspace and keep the root lockfile. `apps/api` and `apps/web` implement FR-01 through FR-04; `apps/ai` contains the versioned FR-04 synthetic corpus and fixed domain encoder. See [README.md](README.md) for current commands.
The target application database is hosted Neon PostgreSQL for synthetic customers, policies, sessions, endorsement requests, and audit events. The API uses server-side PostgreSQL via `DATABASE_URL`; migrations and synthetic seed are explicit commands. The browser accesses data only through Fastify.

For code or infrastructure changes, read [CODING_STANDARDS.md](docs/CODING_STANDARDS.md). For tests or security checks, read [TESTING_STANDARD.md](docs/TESTING_STANDARD.md). For UX design files, read [DESIGN_STANDARD.md](docs/DESIGN_STANDARD.md) and [VISUAL_UX_CONSTRAINTS.md](docs/VISUAL_UX_CONSTRAINTS.md).

## Policy

- Use synthetic policy data only. Never connect to live insurer or policy systems or bind coverage. Customers review and approve proposed changes to their own policies in the prototype; approval creates a non-binding history record and does not update the underlying policy.

## Where things are

- PO/UX: `docs/PRD.md` for product-level requirements, `docs/backlog/` for upcoming ticket drafts, `docs/tickets/` for current detailed requirements, `.github/ISSUE_TEMPLATE/` for Issue structure, `design/` for HTML/CSS/JS design output, and GitHub Issues for delivery tracking.
- QA/Sec: work across affected components. Keep component tests beside their code; put shared test plans and security guidance in `docs/`.
- BE/Infra: `apps/api/` uses Fastify with Swagger/OpenAPI documentation; own repository infrastructure such as Docker or scripts when added.
- FE/Data/RAG: `apps/web/` uses React with Next.js App Router, TanStack Query for client-side server state, and shadcn/ui; `apps/ai/` holds data and RAG work when needed. Coordinate typed API and rule contracts with BE/Infra.

## Skill routing

- Open non-draft pull requests by default. Use draft status only when the user explicitly asks for it.

- For `bmad do fr-<number>`, keep the existing ticket/UX PR merge and Issue creation flow. After the Issue exists, follow `.agents/skills/bmad/references/do-feature.md`: create an implementation branch, prepare a plan from the `bmad-build` plan template and ticket, run `bmad-build`, run browser E2E and record its report and criterion coverage, then open an implementation PR. The `Ticket links` workflow enables auto-merge after validation and code checks pass. After merge, automation marks the linked Issue Done; resume existing work instead of creating duplicates.

- Requirements and GitHub Issues: use BMad `bmad-agent-po` and [TICKET_TEMPLATE.md](docs/TICKET_TEMPLATE.md). Name backlog and ticket files by FR ID; [backlog/README.md](docs/backlog/README.md) records build order. The local Markdown ticket owns build requirements and accepted decisions; its full content is displayed and refreshed in the GitHub Issue. For a new ticket, commit and merge the ticket/UX PR before Issue creation. If an active Issue already exists, preserve its number, edit the local ticket, and refresh that Issue with `npm run ticket:sync -- docs/tickets/<file>.md` while automation is disabled; do not create another Issue for an edit or push. Before implementation, run `npm run ticket:preflight -- docs/tickets/<file>.md`, then use `bmad-build` with the local ticket. On `main` and branches under `test/`, preflight waives the merged ticket/UX PR requirement for build testing; all other checks and UX document reading still apply. UX decisions: `bmad-ux`. Use `bmad` when the next BMad step is unclear.
- UI backlog readiness: completed UX contracts, mockups, or validation do not approve proposed layouts or select delivery. For FR-15, read its local backlog draft and any existing UX handoff; keep it in `docs/backlog/` until the customer accepts the reference layouts and selects the work. Record that dated decision before moving the draft to `docs/tickets/` or opening a ticket/UX PR. Create or reuse its Issue only after the reviewed PR merges.
- BMad setup or render failures on Windows: use `bmad-render-repair`.
- Module design: use Matt Pocock `codebase-design`; domain terminology: `domain-modeling`; hard bugs: `diagnosing-bugs`; test-first changes: `tdd`; branch or PR review: `code-review`.
- When a task uses both, keep the local ticket file as the detailed requirements source, the GitHub Issue as its readable copy and delivery tracker, and use the Matt Pocock skill for its focused engineering method.
- For UI ticket creation, run `bmad-ux` from the ticket requirements. UX delivers `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable `design/page/<pagename>.html` mockups linked from `design/page/index.html`; Sofia links these in the local ticket. Open one PR containing the requirement ticket and UX handoff ready for review by default; use draft status only when explicitly requested. After merge, use `npm run ticket:create -- docs/tickets/<file>.md` while Issue automation is disabled. `bmad-build` follows the reviewed ticket and UX documents later, then verifies UI behavior and accessibility. See [DESIGN_STANDARD.md](docs/DESIGN_STANDARD.md) and [TICKETING.md](docs/TICKETING.md#ticket-creation-flow).

## Documentation maintenance

- Before finishing a change, check whether it changed documented behavior, API contracts, stack choices, test commands, or design conventions. Update the affected `docs/` files in the same change.
- Update this file when a repo-wide rule, role route, or document path changes. Keep detailed guidance in `docs/`, and verify that every path linked here still exists.
- When a product-level requirement changes, update the PRD and affected ticket files with the implementation. When a ticket-level requirement changes, update its local file with the implementation and refresh its existing active Issue copy; while Issue automation is disabled, run `npm run ticket:sync -- docs/tickets/<file>.md`. Do not rewrite a requirement merely to fit existing code or create a duplicate Issue.

<!-- /bmad:context -->
