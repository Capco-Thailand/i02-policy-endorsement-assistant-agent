# FR-04 — Retrieve Policy Details with RAG

**Title:** [Story] Retrieve Policy Details with RAG
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-04
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — retrieval could disclose unauthorized policy evidence.
**State:** Backlog draft

## Summary and objective

Create versioned mock policy documents for the seeded synthetic policies, then retrieve authorized policy evidence with section citations and versions.

## User story or requirement

System requirement: Supply a reproducible synthetic policy-document corpus and fetch relevant evidence from it for an authorized policy, with source citations and versions.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.
- The [Neon migration ticket](../tickets/chore-migrate-persistence-to-neon.md) owns structured customer and policy records. Mock policy documents are RAG sources for those records, not new customer policies or a replacement for structured facts. FR-05 uses the same stable synthetic product identifier to select endorsement rules.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Provide a repeatable set of versioned mock policy documents for every seeded synthetic policy. Each document identifies its policy, stable product identifier, version, and citable sections; normal fixtures agree with the linked structured policy facts. Reloading the same version does not create duplicate sources or change customer activity.
- [ ] After session and ownership checks, retrieve only evidence for the requested policy ID and version, with document and section citations. Unknown and another customer's policy produce the same non-disclosing result and do not retrieve their text.
- [ ] Compare decision fields in retrieved text with the authorized structured record. Missing, stale, or contradictory evidence is marked unresolved and cannot silently replace the structured facts.
- [ ] Treat policy-document text as untrusted input, including prompt-like instructions. Do not index identity documents, uploaded files, real customer information, or insurer material.

## Scope and out of scope

In scope:
- The draft retrieval behavior and creation, versioning, repeatable loading, and verification of synthetic policy-document sources for the existing demo policies.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Customer-facing policy creation, new account or structured policy records, and uploaded-document indexing.
- Further exclusions to confirm during refinement.

## Dependencies
- Use the authorized structured policy records from Neon after the [migration ticket](../tickets/chore-migrate-persistence-to-neon.md). Expose a stable synthetic product identifier for FR-05 without inferring it from free-text labels. Choose document format, retrieval storage, and any pgvector use during refinement; the Neon migration does not implement RAG.

- Determine prerequisites and sequencing with the Product Owner.

## Related subtasks

None identified; confirm during refinement.

## Accepted decisions and readiness
- 2026-11-18: FR-04 includes the mock policy-document corpus for existing seeded policies. FR-05 consumes its stable product identifier; neither feature creates a new customer policy or binds coverage.

- Open question: Confirm precise inputs, error cases, dependencies, and any UX handoff before implementation.
- Status: Backlog draft; not ready for implementation or Issue creation.

## UX handoff references

- Not yet identified; add design documents and browser-viewable mockups if this ticket includes UI.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
