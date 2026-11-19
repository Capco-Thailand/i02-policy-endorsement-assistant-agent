# FR-05 — Retrieve Endorsement Rules with RAG
**Title:** [Story] Retrieve cited synthetic endorsement rules and document guidance
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-05
**Product context:** [PRD](../PRD.md)
**Risk:** High — an incorrect or missing rule could lead to an invalid eligibility decision.
**State:** Ready for ticket review

## Summary and objective
Provide versioned synthetic endorsement rules and document guidance for the three seeded products and four supported changes. Retrieve applicable, cited evidence for a product, change type, and requested effective date. Expose unresolved evidence for human referral.

## User story or requirement
As the endorsement workflow, I need cited rules and document guidance for the selected synthetic product and change so that later eligibility checks and customer guidance use the applicable source version.

## Business or technical context
- The [PRD](../PRD.md) requires RAG grounded rule evidence, deterministic eligibility, and human referral when evidence is missing or contradictory. The [ADR](../ADR.md) keeps retrieval behind Fastify and assigns the synthetic corpus to `apps/ai`.
- FR-04 supplies `FAMILY_PROTECTION`, `SECURE_FUTURE`, and `CLASSIC_LIFE`. FR-05 covers `BENEFICIARY`, `ADDRESS`, `PAYMENT_FREQUENCY`, and `ACCIDENTAL_DEATH_RIDER` for each product. FR-08 owns eligibility decisions; FR-07 owns display and mock upload receipt.
- Each authored source states rule ID, version, product ID, change type, inclusive effective start and end dates, section ID, conditions or explicit referral, and document guidance or explicit none. Source text is synthetic and untrusted. Uploaded content and medical evidence are excluded.
- The retrieval result distinguishes `AVAILABLE`, `MISSING`, `CONFLICTING`, and `UNAVAILABLE`. Only `AVAILABLE` supplies current rules or an explicit no-document requirement. Missing or conflicting guidance is unresolved, even if rule conditions are otherwise available. A storage failure is `UNAVAILABLE`, not an empty result.

## Acceptance criteria
- [ ] A repeatable load creates citable, versioned synthetic sources for all 12 product/change combinations. Each source includes rule conditions or referral and document guidance or explicit none. Repeating the same load leaves one copy of each source/version/section and does not alter policies, sessions, endorsement requests, uploads, or audit history. Sources contain no real insurer, customer, identity, medical, or uploaded content.
- [ ] Given an authorized policy or server trusted product ID, one supported change type, and a valid requested effective date, retrieval restricts candidates by exact product and change type and the date within the source period. It returns applicable rule text and document guidance with rule ID, source version, section citation, and effective period. It never substitutes another product's or change type's source.
- [ ] A later version supersedes an earlier overlapping version of the same rule. Expired and superseded versions are absent from the current result. Historical dates select the version effective then; overlapping incompatible current sources produce `CONFLICTING` with safe source identifiers instead of an arbitrary winner.
- [ ] A missing source, missing guidance, contradictory conditions, or contradictory guidance yields `MISSING` or `CONFLICTING` as appropriate and requires human referral. An explicit `no document required` is a cited available result, distinct from missing guidance. Retrieval does not mark a request eligible or create a quote or draft.
- [ ] Rules for accidental-death rider additions disclose any health disclosure or underwriting as a real-world follow-up. They do not request medical evidence in this prototype or claim that a mock upload satisfies underwriting.
- [ ] Account ownership is checked before any customer-facing retrieval. Missing or invalid sessions return `401`; unknown or unowned policies return the same non-disclosing `404` before corpus access. The browser never accesses rule storage directly. Invalid change types or dates fail validation without retrieval.
- [ ] Retrieval uses indexed source sections and bounded relevance selection within the exact metadata filter. Prompt-like instructions in source text cannot override ownership, deterministic eligibility, document verification, policy mutation, or the non-binding boundary. A retrieval/storage failure reports `UNAVAILABLE` without exposing private data or being treated as missing guidance.
- [ ] Unit and integration fixtures cover each supported change, all three products, applicable and inapplicable dates, missing/conflicting/superseded sources and guidance, repeat loading, owner isolation, retrieval failure, and hostile source text. Record criterion coverage and remaining gaps in the implementation plan.

## Scope and out of scope
In scope:
- Authored synthetic rule corpus, repeatable load, versioned indexed retrieval, server-side access boundary, and a typed rule/document-guidance result for FR-07 and FR-08.

Out of scope:
- Customer-facing rule authoring or new UI; real insurer rules, medical evidence collection, uploaded-content inspection, eligibility, quotation, draft creation, policy mutation, and coverage binding.

## Dependencies
- FR-04's stable product identifiers and corpus infrastructure, plus FR-01 and FR-03 session and ownership checks. FR-07 can display interim fixture guidance but final citation integration consumes this result. FR-08 consumes rule status for deterministic eligibility.
- The implementation plan records the chosen index and version-selection contract. It may reuse FR-04's pgvector infrastructure without weakening product/change/date filters.

## Related subtasks
None. The corpus, loader, and retrieval API form one reviewable slice.

## Accepted decisions and readiness
- 2026-11-18: FR-05 authors mock endorsement rules and cited document guidance for the seeded products and four supported changes; FR-04 owns policy documents and product identifiers.
- 2026-11-18: Uploaded bytes remain outside the RAG corpus; guidance never verifies a mock upload.
- 2026-11-19: FR-05 delivers the backend retrieval contract. FR-07 owns customer display and FR-08 owns eligibility, so no new UI handoff is required for this ticket.
- Ready for ticket review. Implementation starts after the ticket PR merges, the linked Issue exists, and preflight passes.

## UX handoff references
N/A — backend retrieval; FR-07 owns customer display.

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
