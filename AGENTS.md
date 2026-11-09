<!-- bmad:context -->
<!-- Verified 2026-11-09 against the monorepo workspace setup. Managed by bmad-project-context. -->

## Policy Endorsement Assistant

This is a prototype for synthetic insurance policy endorsements. Read `docs/PRD.md` for product behavior and boundaries. The four roles share the repository; folder routes indicate the usual work area, not exclusive ownership.

Use the root npm workspace for `apps/api`, `apps/web`, and `apps/ai`; install from the repository root and keep the root lockfile. See [README.md](README.md) for development commands.

For code or infrastructure changes, read [CODING_STANDARDS.md](docs/CODING_STANDARDS.md). For tests or security checks, read [TESTING_STANDARD.md](docs/TESTING_STANDARD.md). For UX design files, read [DESIGN_STANDARD.md](docs/DESIGN_STANDARD.md).

## Policy

- Use synthetic policy data only. Never connect to live insurer or policy systems, bind coverage, or treat a draft as approval; drafts remain non-binding and pending human review.

## Where things are

- PO/UX: `docs/` for product documents, `design/` for HTML/CSS/JS design output, and GitHub issues for tickets.
- QA/Sec: work across affected components. Keep component tests beside their code; put shared test plans and security guidance in `docs/`.
- BE/Infra: `apps/api/` uses Fastify with Swagger/OpenAPI documentation; own repository infrastructure such as Docker or scripts when added.
- FE/Data/RAG: `apps/web/` uses React, TanStack, and shadcn/ui; `apps/ai/` holds data and RAG work when needed. Coordinate shared API and rule contracts with BE/Infra.

## Skill routing

- Requirements and GitHub tickets: use BMad `bmad-agent-po`; local tickets based on `docs/tickets/TICKET-TEMPLATE.md`: use `ticket-from-template`; UX decisions: `bmad-ux`; delivery from a ticket: `bmad-build`. Use `bmad` when the next BMad step is unclear.
- BMad setup or render failures on Windows: use `bmad-render-repair`.
- Module design: use Matt Pocock `codebase-design`; domain terminology: `domain-modeling`; hard bugs: `diagnosing-bugs`; test-first changes: `tdd`; branch or PR review: `code-review`.
- When a task uses both, keep the BMad ticket as the requirements source and use the Matt Pocock skill for its focused engineering method.

## Documentation maintenance

- Before finishing a change, check whether it changed documented behavior, API contracts, stack choices, test commands, or design conventions. Update the affected `docs/` files in the same change.
- Update this file when a repo-wide rule, role route, or document path changes. Keep detailed guidance in `docs/`, and verify that every path linked here still exists.
- When a requirement changes, update its PRD or ticket source and the implementation together; do not rewrite a requirement merely to fit existing code.

<!-- /bmad:context -->
