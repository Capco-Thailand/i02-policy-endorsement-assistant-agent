# FR-04 — Retrieve Policy Details with RAG
**Title:** [Story] Retrieve cited synthetic policy evidence
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/97
**Feature ID:** FR-04
**Product context:** [PRD](../PRD.md)
**Risk:** High — a retrieval mistake could expose another customer's policy text or present contradictory policy facts as evidence.
**State:** Implementation in review

## Summary and objective
Provide versioned mock policy documents for the existing demo policies and retrieve relevant cited sections for the signed-in policy owner. Show the evidence on the policy detail page while treating Neon structured policy facts as authoritative.

## User story or requirement
As a customer viewing my synthetic policy, I can see which mock policy document and section supports the displayed details, or see that the evidence is unresolved, without seeing another customer's policy text.

## Business or technical context
- The [PRD](../PRD.md) requires cited, versioned RAG evidence and authorization before retrieval. The [ADR](../ADR.md) keeps retrieval behind Fastify. FR-01 and FR-03 supply sessions and owner-only policy access; the [Neon migration ticket](chore-migrate-persistence-to-neon.md) owns structured policy records.
- The normal synthetic corpus covers the three seeded policies: `POL-NARIN-001`, `POL-NARIN-002`, and `POL-MALI-001`. Assign stable product identifiers `FAMILY_PROTECTION`, `CLASSIC_LIFE`, and `SECURE_FUTURE` respectively. FR-05 uses these identifiers for rule lookup. These are identifiers for existing demo policies, not new customer policies.
- The corpus contains authored mock policy sections, document IDs, versions, and section IDs. It may explain facts, but structured Neon fields remain the source for ownership, status, dates, payment frequency, and beneficiaries. The fixture documents and structured facts must agree in the normal case.
- FR-04 retrieves source passages; it does not decide eligibility, generate a quote or draft, inspect uploaded files, or bind coverage. FR-08 owns deterministic eligibility and must treat missing or contradictory evidence as unresolved.

## Acceptance criteria
- [ ] A repeatable corpus load creates one current versioned mock policy document for each seeded policy, with stable policy/product/document IDs, version, section IDs, and text covering policy status, effective and expiry dates, payment frequency, and beneficiaries. Repeating the load does not duplicate documents or change structured policies, requests, sessions, or audit history. No real customer, insurer, identity, medical, or uploaded content enters the corpus.
- [ ] For a signed-in customer and an owned policy, a bounded policy-evidence query retrieves relevant passages from only that policy's selected document version. Each returned passage includes document ID, version, section ID, and an excerpt from the source. A query for a different section changes the relevant results; retrieval is more than a static copy of the policy record.
- [ ] Authorization runs before corpus access. Missing or invalid sessions return `401`; unknown and unowned policy IDs return the same non-disclosing `404`. Those failures do not query or disclose policy documents, source metadata, or another customer's product identifier. The browser never connects to retrieval storage directly.
- [ ] Compare retrieved decision fields with the authorized structured policy record. Matching evidence is labeled available; absent, stale, or contradictory evidence is labeled unresolved with a reason. Do not silently replace structured facts, invent a citation, or treat unresolved evidence as sufficient for later quote/draft decisions. An expired owned policy may show its evidence but cannot gain a request action.
- [ ] Treat source text and query text as untrusted. Prompt-like instructions in a mock document do not alter authorization, policy facts, audit behavior, or response boundaries. A retrieval/storage failure is shown as an unavailable service state, not as an empty or verified result; do not log secrets or unnecessary personal data.
- [ ] On the existing policy detail page, show a labeled synthetic policy-evidence section with source title, version, section citation, and excerpt. Preserve the structured facts and FR-02 request action. Show distinct loading, available, unresolved, service-failure, and session-ended states, including a retry path where appropriate. The section remains readable at 320px, keyboard accessible, and does not imply issued coverage.
- [ ] API, component, integration, and browser checks cover the corpus load, known cited results, relevance, owner isolation before retrieval, stale/missing/conflicting sources, prompt injection, retrieval failure, expired-policy display, and unchanged structured policy data. Record criterion-to-test evidence and any uncovered checks in the implementation plan.

## Scope and out of scope
In scope:
- Synthetic policy-document authoring and repeatable corpus load, versioned retrieval behind the API, safe comparison with structured facts, and cited evidence on the existing policy detail page.

Out of scope:
- New customer accounts or structured policies, a policy or document authoring UI, real insurer data, identity or uploaded-document indexing, eligibility/quote/draft decisions, policy mutation, and coverage binding.
- FR-05 endorsement-rule and document-guidance retrieval; FR-05 consumes the stable product identifiers supplied here.

## Dependencies
- FR-01, FR-03, and the [Neon migration ticket](chore-migrate-persistence-to-neon.md) provide authentication, owner-only policy access, and structured policy facts. FR-02 owns the request action already shown on the detail page.
- FR-05 uses the product identifiers defined here. Retrieval storage and any pgvector use are implementation choices; no live insurer or policy system is required.

## Related subtasks
None. Keep the corpus, API, and detail-page evidence together as one reviewable vertical slice.

## Accepted decisions and readiness
- 2026-11-18: FR-04 includes mock policy documents for the existing seeded policies. FR-05 owns mock endorsement rules and uses the same product identifiers. These sources are synthetic RAG fixtures, not a customer-facing creation workflow.
- 2026-11-18: The policy detail page shows citations beside the existing structured facts; unresolved evidence is visible but cannot authorize later quote or draft creation.
- Ticket/UX handoff merged in PR #96; Issue #97 exists and preflight passed. Implementation evidence is recorded in the [plan](../implementation-plan/fr-04-policy-rag.md).

## UX handoff references
- [Visual design](../../_bmad-output/initiative-customer-authentication/ux-fr-04/DESIGN.md)
- [Experience and states](../../_bmad-output/initiative-customer-authentication/ux-fr-04/EXPERIENCE.md)
- [Browser mockup](../../design/page/policy-evidence.html)

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
