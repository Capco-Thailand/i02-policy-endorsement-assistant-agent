# PEA-006 candidate: Quote deterministic mock premium impact

**Status:** Backlog candidate

## Intended outcome

Only a validated, eligible, authorized request reaches `quote_endorsement`. The mock tool uses versioned synthetic rating data and returns previous premium, proposed premium, delta, currency, and assumptions. The UI displays the returned amounts unchanged.

## Source and dependency

- [PRD sections 5, 6, 7, and 8](../PRD.md): rating tables, quote gate, tool contract, and premium integrity.
- Depends on [PEA-005](PEA-005-authorization-and-validation.md).

## Refine before promotion

- Confirm the currency, locale, deterministic formula, rating-table version, idempotency key, and quote failure behavior from PEA-002.
- Keep quote output explicitly synthetic and non-binding.
