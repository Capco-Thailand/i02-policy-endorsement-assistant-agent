# PEA-005 candidate: Authorize and validate before quoting

**Status:** Backlog candidate

## Intended outcome

The server checks caller role, policy access, required fields, rule evidence, and deterministic eligibility before a request can be quoted. Missing, invalid, unauthorized, conflicting, or uncertain cases stop safely and make no quote or draft tool call.

## Source and dependency

- [PRD sections 3, 6, 7, and 9](../PRD.md): eligibility, role checks, trust boundaries, and fail-closed behavior.
- Depends on [PEA-003](PEA-003-synthetic-rules-and-fixtures.md) and [PEA-004](PEA-004-endorsement-intake.md).

## Refine before promotion

- Define the mock role matrix, validation error contract, and rule conflict/referral behavior selected in PEA-002.
- Include adversarial request and rule text in the ticket's own acceptance checks.
