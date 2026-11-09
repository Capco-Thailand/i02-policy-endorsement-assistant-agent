# PEA-003 candidate: Versioned synthetic rules and fixtures

**Status:** Backlog candidate

## Intended outcome

The selected endorsement scenario has deterministic synthetic policies, requests, and versioned rules that can be selected by change type, product, and effective date. Retrieval returns rule IDs and versions, and safely reports no match or conflicting matches.

## Source and dependency

- [PRD sections 5 and 7](../PRD.md): synthetic data, structured rule lookup, metadata filtering, and safe fallback.
- Depends on [PEA-002](../tickets/PEA-002-first-endorsement-scenario.md) selecting the scenario and rule convention.

## Refine before promotion

- Choose fixture format, seed strategy, rule fields, version precedence, and representative valid/conflicting/no-match cases.
- Keep eligibility decisions deterministic; retrieved prose alone cannot authorize a quote or draft.
