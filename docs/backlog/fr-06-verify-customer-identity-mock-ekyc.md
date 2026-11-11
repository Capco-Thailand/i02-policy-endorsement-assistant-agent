# FR-06 — Verify Customer Identity (Mock eKYC)

**State:** Backlog draft
**GitHub Issue:** Not filed
**Feature ID:** FR-06
**Product context:** [PRD](../PRD.md)

## Outcome

Simulate identity checks with synthetic pass/fail/review outcomes.

## Requirements to refine

- Confirm the user or system outcome, business rules, required inputs, error cases, and safety boundaries before implementation.
- Add observable acceptance criteria using [TICKET_TEMPLATE.md](../TICKET_TEMPLATE.md) and the matching GitHub Issue form.
- Preserve traceability to FR-06 and link any relevant UX or architecture documents.

## Known product rules

- Use synthetic fixtures to simulate identity match, ID expiry, and liveness.
- Return `VERIFIED`, `FAILED`, or `REVIEW_REQUIRED` with reasons. This check does not sign in staff or grant access.

## Dependencies and open questions

- Determine prerequisites and sequencing with the Product Owner.
