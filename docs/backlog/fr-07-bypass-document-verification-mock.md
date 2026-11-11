# FR-07 — Bypass Document Verification (Mock)

**State:** Backlog draft
**GitHub Issue:** Not filed
**Feature ID:** FR-07
**Product context:** [PRD](../PRD.md)

## Outcome

Record `BYPASSED_MOCK` without inspecting or validating uploaded documents.

## Requirements to refine

- Confirm the user or system outcome, business rules, required inputs, error cases, and safety boundaries before implementation.
- Add observable acceptance criteria using [TICKET_TEMPLATE.md](../TICKET_TEMPLATE.md) and the matching GitHub Issue form.
- Preserve traceability to FR-07 and link any relevant UX or architecture documents.

## Known product rules

- Return and audit `BYPASSED_MOCK` without upload, OCR, signature analysis, file inspection, or authenticity checks.
- Make the bypass visible as a simulation; never describe it as real verification.

## Dependencies and open questions

- Determine prerequisites and sequencing with the Product Owner.
