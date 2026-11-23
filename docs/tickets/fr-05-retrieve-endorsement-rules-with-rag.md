# FR-05 — Retrieve Endorsement Rules with RAG
**Title:** [Story] Retrieve cited synthetic endorsement rules and document guidance
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/110
**Feature ID:** FR-05
**Product context:** [PRD](../PRD.md)
**Risk:** High — an incorrect or missing rule could lead to an invalid eligibility decision.
**State:** Implementation merged in PR #112; requirements revised for endorsement flow

## Summary and objective
Provide versioned synthetic endorsement rules for the three seeded products and four supported changes. Retrieve applicable, cited evidence for a product, change type, and requested effective date. Expose missing or conflicting evidence with a reason for FR-08 `NEEDS_REVIEW`.

## User story or requirement
As the endorsement workflow, I need cited rules for the selected synthetic product and change so that the preliminary assessment uses the applicable source version.

## Business or technical context
- The [PRD](../PRD.md) requires RAG grounded rule evidence for the assistant's preliminary assessment. The [ADR](../ADR.md) keeps retrieval behind Fastify and assigns the synthetic corpus to `apps/ai`.
- FR-04 supplies `FAMILY_PROTECTION`, `SECURE_FUTURE`, and `CLASSIC_LIFE`. FR-05 covers `BENEFICIARY`, `ADDRESS`, `PAYMENT_FREQUENCY`, and `ACCIDENTAL_DEATH_RIDER` for each product. FR-08 owns the assessment; FR-07 upload is outside this flow.
- Each authored source states rule ID, version, product ID, change type, inclusive effective start and end dates, section ID, conditions or explicit referral, and document guidance or explicit none. Source text is synthetic and untrusted. Uploaded content and medical evidence are excluded.
- The retrieval result distinguishes `AVAILABLE`, `MISSING`, `CONFLICTING`, and `UNAVAILABLE`. Only `AVAILABLE` supplies current rules. Missing, stale, or conflicting rules are unresolved; a storage failure is `UNAVAILABLE`, not an empty result.

## Acceptance criteria
- [ ] A repeatable load creates citable, versioned synthetic rule sources for all 12 product/change combinations. Each source includes rule conditions or an explicit referral instruction. Repeating the same load leaves one copy of each source/version/section and does not alter policies, sessions, endorsement requests, uploads, or audit history. Sources contain no real insurer, customer, identity, medical, or uploaded content.
- [ ] Given an authorized policy or server trusted product ID, one supported change type, and a valid requested effective date, retrieval restricts candidates by exact product and change type and the date within the source period. It returns applicable rule text with rule ID, source version, section citation, and effective period. It never substitutes another product's or change type's source.
- [ ] A later version supersedes an earlier overlapping version of the same rule. Expired and superseded versions are absent from the current result. Historical dates select the version effective then; overlapping incompatible current sources produce `CONFLICTING` with safe source identifiers instead of an arbitrary winner.
- [ ] A missing, stale, or contradictory applicable rule yields `MISSING` or `CONFLICTING` as appropriate, with a safe reason for FR-08 `NEEDS_REVIEW`. Do not imply that an operational reviewer has been assigned. Retrieval does not mark a request eligible or create a quote or draft.
- [ ] Rules for accidental-death rider additions disclose any health disclosure or underwriting as a real-world follow-up. They do not request medical evidence in this prototype.
- [ ] Account ownership is checked before any customer-facing retrieval. Missing or invalid sessions return `401`; unknown or unowned policies return the same non-disclosing `404` before corpus access. The browser never accesses rule storage directly. Invalid change types or dates fail validation without retrieval.
- [ ] Retrieval uses indexed source sections and bounded relevance selection within the exact metadata filter. Prompt-like instructions in source text cannot override ownership, assessment gates, policy mutation, or the non-binding boundary. A retrieval/storage failure reports `UNAVAILABLE` without exposing private data or being treated as a missing rule.
- [ ] Unit and integration fixtures cover each supported change, all three products, applicable and inapplicable dates, missing/conflicting/superseded rules, repeat loading, owner isolation, retrieval failure, and hostile source text. Record criterion coverage and remaining gaps in the implementation plan.

## Scope and out of scope
In scope:
- Authored synthetic rule corpus, repeatable load, versioned indexed retrieval, server-side access boundary, and a typed rule result for FR-08.

Out of scope:
- Customer-facing rule authoring or new UI; real insurer rules, medical evidence collection, uploaded-content inspection, eligibility, quotation, draft creation, policy mutation, and coverage binding.

## Dependencies
- FR-04's stable product identifiers and corpus infrastructure, plus FR-01 and FR-03 session and ownership checks. FR-08 consumes rule evidence for the assistant's preliminary assessment. FR-07 has no MVP dependency on this result.
- The implementation plan records the chosen index and version-selection contract. It may reuse FR-04's pgvector infrastructure without weakening product/change/date filters.

## Related subtasks
None. The corpus, loader, and retrieval API form one reviewable slice.

## Accepted decisions and readiness
- 2026-11-23: FR-05 provides cited rule evidence to FR-08; it has no document-guidance handoff to FR-07 in the endorsement MVP. Applicable rules may mention real-world supporting documents, but the flow collects none.
- Implementation merged in PR #112; reconcile the existing rule retrieval contract with the revised requirement before claiming this flow complete.

## UX handoff references
N/A — backend retrieval; FR-08 owns customer-facing assessment.

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
