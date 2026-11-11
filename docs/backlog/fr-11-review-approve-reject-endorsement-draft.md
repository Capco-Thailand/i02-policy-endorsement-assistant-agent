# FR-11 — Review & Approve/Reject Endorsement Draft

**State:** Backlog draft
**GitHub Issue:** Not filed
**Feature ID:** FR-11
**Product context:** [PRD](../PRD.md)

## Outcome

A signed-in staff member assigned to the policy, other than the creator, can review a submitted draft and record an `APPROVED` or `REJECTED` decision; staff can track status.

## Requirements to refine

- Confirm the user or system outcome, business rules, required inputs, error cases, and safety boundaries before implementation.
- Add observable acceptance criteria using [TICKET_TEMPLATE.md](../TICKET_TEMPLATE.md) and the matching GitHub Issue form.
- Preserve traceability to FR-11 and link any relevant UX or architecture documents.

## Known product rules

- A different signed-in staff member assigned to the policy may record `APPROVED` or `REJECTED` on a submitted draft.
- The creator may not review their own draft. A decision never updates or binds a policy.

## Dependencies and open questions

- Determine prerequisites and sequencing with the Product Owner.
