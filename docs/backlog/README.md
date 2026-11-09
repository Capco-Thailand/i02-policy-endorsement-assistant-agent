# Endorsement assistant backlog candidates

These are candidate scopes from the [PRD](../PRD.md), ordered after [PEA-002](../tickets/PEA-002-first-endorsement-scenario.md). They are planning notes, not implementation-ready tickets or GitHub issues. PEA-002 must settle the first product line, endorsement type, roles, and quote convention before these are expanded with acceptance criteria in `docs/tickets/`.

| Proposed ID | Candidate outcome | Dependency |
|---|---|---|
| [PEA-003](PEA-003-synthetic-rules-and-fixtures.md) | Versioned synthetic rules and fixtures can be selected reliably | PEA-002 |
| [PEA-004](PEA-004-endorsement-intake.md) | One request can be interpreted and clarified | PEA-002, PEA-003 |
| [PEA-005](PEA-005-authorization-and-validation.md) | Server blocks unauthorized or ineligible requests before quoting | PEA-003, PEA-004 |
| [PEA-006](PEA-006-mock-quote.md) | Eligible requests receive a deterministic mock premium estimate | PEA-005 |
| [PEA-007](PEA-007-pending-review-draft.md) | A quoted request becomes one non-binding review draft | PEA-006 |
| [PEA-008](PEA-008-review-and-audit.md) | Users and reviewers can inspect evidence and an audit trace | PEA-007 |
| [PEA-009](PEA-009-offline-evaluation.md) | The complete flow is measured against synthetic cases | PEA-003 through PEA-008 |

When promoting a candidate, confirm its scope against the chosen scenario, expand it with [TICKET-TEMPLATE.md](../tickets/TICKET-TEMPLATE.md), and move it to `docs/tickets/` using the proposed ID if still available. Keep safety and automated checks in each implementation ticket; PEA-009 covers cross-flow evaluation rather than replacing those checks.
