# PEA-004 candidate: Interpret and clarify one endorsement request

**Status:** Backlog candidate

## Intended outcome

The policy-specific intake route accepts one natural-language request, identifies the supported change type and proposed fields, and asks for missing or ambiguous information. Unsupported requests receive a clear stop or human-referral result. Opening the route does not create a request draft or change coverage.

## Source and dependency

- [PRD sections 5, 6, and 10](../PRD.md): intake, classification, extraction, clarification, and user-visible states.
- Depends on [PEA-002](../tickets/PEA-002-first-endorsement-scenario.md) and [PEA-003](PEA-003-synthetic-rules-and-fixtures.md).

## Refine before promotion

- Decide the first request schema, supported intent language, clarification loop, and route/API error states.
- Preserve PEA-001's authorization and active-policy checks on direct intake access.
