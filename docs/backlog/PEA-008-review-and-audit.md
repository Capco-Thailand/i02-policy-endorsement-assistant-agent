# PEA-008 candidate: Show review evidence and audit trace

**Status:** Backlog candidate

## Intended outcome

The service user can read the request interpretation, missing information, eligibility rationale, rule citations, quote assumptions, and draft status. A reviewer or evaluator can inspect a redacted audit trace with request ID, timestamps, decisions, rule and tool versions, and final state.

## Source and dependency

- [PRD sections 4, 5, 9, and 10](../PRD.md): reviewer job, traceability, observability, and required outputs.
- Depends on [PEA-007](PEA-007-pending-review-draft.md).

## Refine before promotion

- Decide whether the user summary and reviewer trace fit one implementation ticket or need separate tickets.
- Define role-based visibility and redaction; human approval itself remains outside this prototype.
