# FR-05 — Retrieve Endorsement Rules with RAG

**Title:** [Story] Retrieve Endorsement Rules with RAG
**Labels:** `type:story`
**GitHub Issue:** Not filed
**Feature ID:** FR-05
**Product context:** [PRD](../PRD.md)
**Risk:** Proposed High — the wrong rule could lead to an invalid eligibility decision.
**State:** Backlog draft

## Summary and objective

Create and index versioned mock endorsement rules, then retrieve the rules applicable to a synthetic product and requested change.

## User story or requirement

System requirement: Supply a reproducible synthetic endorsement-rule corpus and fetch applicable rules with citations, versions, and effective dates.

## Business or technical context

- The [PRD](../PRD.md) defines the product scope and safety boundaries. Confirm the detailed contract against the current application and [ADR](../ADR.md) during refinement.
- FR-04 supplies the stable product identifier and versioned policy wording in vector storage. FR-05 authors and indexes mock rule sources against those identifiers and the four supported change types. FR-08 assesses requests against retrieved passages from both corpora.

## Acceptance criteria

Draft checks from the known product rules; refine inputs, failure paths, and evidence before the ticket/UX handoff.

- [ ] Provide repeatably loadable, versioned mock endorsement-rule sources for each seeded synthetic product and each of the four supported change types. Each source states its product, change type, effective period, rule ID and version, citable section, and rule conditions or explicit referral instruction. Reloading the same version does not duplicate rules.
- [ ] Index rule sections as vectors with product, change type, effective period, rule ID, version, and section metadata. Retrieve relevant passages only from applicable versions; return citations traceable to source text.
- [ ] Select applicable rules by the shared product identifier, change type, and requested effective date; return rule and section citations and versions. Expired or superseded versions do not appear as current rules.
- [ ] Missing, stale, or conflicting applicable rules return an unresolved evidence result with a reason for FR-08 `NEEDS_REVIEW`; do not treat them as permission to proceed or imply that an operational reviewer has been assigned.
- [ ] Rule sources may state supporting documents needed in a real process; return such statements with their source citation, version, and effective date. The MVP endorsement flow does not collect or verify documents.
- [ ] For accidental-death rider additions, surface any rule calling for health disclosure or underwriting as a real-world follow-up; do not request medical evidence in the MVP.
- [ ] Test fixtures cover applicable, inapplicable, missing, conflicting, and superseded rules. Retrieved rule text is untrusted and cannot override account ownership, eligibility gates, or the non-binding policy boundary.

## Scope and out of scope

In scope:
- The draft retrieval behavior and creation, versioning, repeatable loading, and verification of synthetic endorsement rules.

Out of scope:
- Live insurer or policy-system integration and coverage binding.
- Customer-facing rule authoring, real insurer rules, medical evidence collection, and request assessment owned by FR-08.
- Further exclusions to confirm during refinement.

## Dependencies
- Use the stable synthetic product identifiers and vector retrieval pattern supplied by FR-04, following the [ADR](../ADR.md) API boundary. The Neon migration alone does not implement rule indexing.

- Determine prerequisites and sequencing with the Product Owner.

## Related subtasks

None identified; confirm during refinement.

## Accepted decisions and readiness
- 2026-11-18: Include cited document guidance for FR-07, but keep uploaded bytes outside the RAG corpus and do not infer document verification from retrieval.
- 2026-11-18: FR-05 includes authored mock endorsement rules and document guidance for the demo products and four supported changes. FR-04 owns mock policy documents and the shared product identifier.
- 2026-11-23: Supersedes the document-guidance handoff to FR-07 for the MVP endorsement flow. FR-05 retrieves applicable rules; statements about real-world supporting documents may remain in cited rule text, but no upload step is presented.

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
