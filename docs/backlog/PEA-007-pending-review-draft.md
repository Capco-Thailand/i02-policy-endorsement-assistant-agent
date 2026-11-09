# PEA-007 candidate: Create a pending-review endorsement draft

**Status:** Backlog candidate

## Intended outcome

An eligible quoted request produces one reviewable, non-binding draft through `create_endorsement_draft`. It contains the proposed change, cited rule versions, quote ID and premium delta, rationale, audit metadata, and `PENDING_REVIEW` status. Repeated requests do not create duplicate drafts.

## Source and dependency

- [PRD sections 5, 6, 8, and 10](../PRD.md): draft contract, review status, and user-visible summary.
- Depends on [PEA-006](PEA-006-mock-quote.md).

## Refine before promotion

- Set the draft persistence and idempotency contract, mandatory evidence, and rejection responses.
- No draft can approve, bind, issue, activate, or modify coverage.
