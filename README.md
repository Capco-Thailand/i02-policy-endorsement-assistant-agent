# Policy Endorsement Assistant

Prototype planning repository for synthetic insurance policy endorsements. FR-01 is a [selected ticket](docs/tickets/fr-01-authenticate-customers.md); its API and web implementation awaits the ticket/UX handoff. No live insurer system is connected and no coverage can be bound.

The root npm workspace retains `apps/ai` as a placeholder for future synthetic data and retrieval work. Install dependencies from the repository root with `npm ci`. There is currently no API or web runtime to start.

## Ticket workflow

The local Markdown requirement is the build specification. Select a backlog item, complete a new ticket and UX handoff, and merge its review PR before building. See [ticket workflow](docs/TICKETING.md) for the process.
