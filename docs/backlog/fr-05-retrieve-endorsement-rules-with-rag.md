# FR-05 — Retrieve Endorsement Rules with RAG

**Title:** [Story] Retrieve Endorsement Rules with RAG
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-05
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — the wrong rule could lead to an invalid eligibility decision.
**State:** Backlog draft

## Summary and objective

Create versioned mock endorsement rules and document guidance, then retrieve the rules applicable to a synthetic product and requested change.

## User story or requirement

System requirement: Supply a reproducible synthetic endorsement-rule corpus and fetch applicable rules and document guidance with citations, versions, and effective dates.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.
- FR-04 supplies the stable product identifier for each seeded synthetic policy. FR-05 authors mock rule sources against those identifiers and the four supported change types; FR-08 still owns deterministic eligibility decisions.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Provide repeatably loadable, versioned mock endorsement-rule sources for each seeded synthetic product and each of the four supported change types. Each source states its product, change type, effective period, rule ID and version, citable section, and rule conditions or explicit referral instruction. Reloading the same version does not duplicate rules.
- [ ] Select applicable rules by the shared product identifier, change type, and requested effective date; return rule and section citations and versions. Expired or superseded versions do not appear as current rules.
- [ ] Missing or conflicting rules require human referral.
- [ ] Each mock rule source states applicable document guidance or explicitly says no document is required. Return that guidance with source citation, version, and effective date; distinguish explicit none from missing or conflicting guidance. FR-07 presents it without using it to validate uploaded content.
- [ ] For accidental-death rider additions, surface any rule calling for health disclosure or underwriting as a real-world follow-up; do not request medical evidence in the MVP or claim the mock upload satisfies underwriting.
- [ ] Test fixtures cover applicable, inapplicable, missing, conflicting, and superseded rules. Retrieved rule text is untrusted and cannot override account ownership, eligibility gates, or the non-binding policy boundary.

## Scope and out of scope

In scope:
- The draft retrieval behavior and creation, versioning, repeatable loading, and verification of synthetic endorsement rules and document guidance.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Customer-facing rule authoring, real insurer rules, medical evidence collection, and eligibility decisions owned by FR-08.
- Further exclusions to confirm during refinement.

## Dependencies
- Use the stable synthetic product identifiers supplied by FR-04 and follow the [ADR](../ADR.md) API boundary. Choose rule retrieval storage and any pgvector use during refinement; the Neon migration does not implement RAG.

- Determine prerequisites and sequencing with the Product Owner.

## Related subtasks

None identified; confirm during refinement.

## Accepted decisions and readiness
- 2026-11-18: Include cited document guidance for FR-07, but keep uploaded bytes outside the RAG corpus and do not infer document verification from retrieval.
- 2026-11-18: FR-05 includes authored mock endorsement rules and document guidance for the demo products and four supported changes. FR-04 owns mock policy documents and the shared product identifier.

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
