---
name: ticket-from-template
description: Draft or refine a local development ticket in this repository using docs/tickets/TICKET-TEMPLATE.md. Use when asked to create a ticket from the template or make another ticket like PEA-001.
---

# Ticket from template

Read the repository's `docs/tickets/TICKET-TEMPLATE.md` and relevant requirements in `docs/PRD.md` before drafting. Treat the template as the source for ticket structure; use the request and current requirements as the source for ticket content. Read an existing ticket only when it helps resolve a local convention.

Create the ticket under `docs/tickets/` with a descriptive filename beginning with its ticket ID. If no ID is provided, check existing tickets and choose the next unused `PEA` number. Keep the title, ID, status, and scope consistent across the file.

Fill the applicable template sections with concrete behavior, business rules, and observable acceptance criteria. Replace every placeholder and remove inapplicable sections. Record unknown decisions as open questions rather than inventing product rules. Preserve the repository's synthetic-data and human-review boundaries.

Check the draft against the request and PRD, then show the local file for review. Create or update a GitHub issue only when the user has authorized publication; check for an existing issue with the same ticket ID first, and record its URL in the local ticket after publication. A local draft alone does not imply authorization to publish.
