# FR-10 — Create Draft Endorsement for Human Approval

**State:** Backlog draft
**GitHub Issue:** Not filed
**Feature ID:** FR-10
**Product context:** [PRD](../PRD.md)

## Outcome

Save a non-binding `DRAFT` with proposed changes, quote, and supporting evidence; submit as `PENDING_APPROVAL`.

## Requirements to refine

- Confirm the user or system outcome, business rules, required inputs, error cases, and safety boundaries before implementation.
- Add observable acceptance criteria using [TICKET_TEMPLATE.md](../TICKET_TEMPLATE.md) and the matching GitHub Issue form.
- Preserve traceability to FR-10 and link any relevant UX or architecture documents.

## Known product rules

- Save proposed changes, mock premium impact, verification outcomes, and cited policy/rule evidence as non-binding `DRAFT` with `binding=false`.
- Submission changes status to `PENDING_APPROVAL`; neither action changes policy coverage.

## Dependencies and open questions

- Determine prerequisites and sequencing with the Product Owner.
