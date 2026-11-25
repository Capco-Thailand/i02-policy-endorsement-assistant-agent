# Architecture decisions

This is the decision register for the next project. No architecture choice has been accepted yet. The previous project's stack and data choices remain in Git history and do not apply here.

## What belongs here

Record a choice when changing it later would be costly, the reason would not be obvious from code, and there were genuine alternatives. Keep product outcomes and safety requirements in the PRD, feature behavior in tickets, and coding rules in `CODING_STANDARDS.md`. A ticket links the architecture decisions it depends on.

Resolve only the questions a selected ticket needs. Before its implementation plan is approved, check:

- **System boundaries:** Which components own the UI, API, domain decisions, external calls, and persistent data? Which interfaces cross those boundaries?
- **Trust and side effects:** Where is identity established, where is authorization enforced, and which component may write data or call a side-effecting service?
- **Contracts:** What defines request and response schemas, error shapes, versioning, and client types? How are consumers updated when a contract changes?
- **Persistence:** Which store owns each kind of state? How are migrations, test data, backups, and startup dependencies handled?
- **AI or retrieval, when used:** What evidence may a model see, which decisions stay deterministic, and what happens when evidence or a tool is missing or contradictory?
- **Operations:** Which services run in each environment? Where do secrets live, and what must CI verify before merge?

Mark an unanswered question in the ticket or plan with its owner. Make the decision before implementing work that depends on it. A topic that does not apply to the project needs no ADR.

## Decision records

Create `docs/adr/0001-<decision>.md` when the first decision is made; use the next number for each later record. Start with a short title and one to three sentences stating the context, choice, and reason. Add status (`proposed`, `accepted`, `deprecated`, or `superseded`), alternatives, and consequences only when they help a future reader understand the trade-off. Link each accepted record below and from affected tickets.

| Decision | Status | Record |
| --- | --- | --- |
| No decisions yet | Open | — |

When a choice changes, record the new decision and mark the earlier one superseded. Update affected tickets, contracts, tests, and implementation guidance in the same change. Do not silently rewrite the reason for an accepted choice.
