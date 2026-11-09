# PEA-002: Decide the First Synthetic Endorsement Scenario

**Type:** Spike  
**Priority:** P1 - High  
**Version:** 1.0  
**Status:** Draft for review  
**Scope:** Backend + Database + AI + QA

## User story

As the **product and engineering team**, we want one agreed endorsement scenario and its mock contracts, so that the first end-to-end flow is coherent and can be implemented without guessing product rules.

## Background and boundary

[PEA-001](PEA-001-policy-list-and-detail.md) uses synthetic life policies. The [PRD](../PRD.md) lists `add_driver`, `change_address`, `replace_vehicle`, and `change_coverage_limit` as examples, while leaving the mandatory product line and endorsement type open. This spike resolves that mismatch before implementation tickets are promoted. All decisions must use synthetic data and invented rules; no decision authorizes a live policy change or binding coverage.

## Scope

1. Choose one product line and one endorsement type for the first complete demonstration. State whether it uses the life policies from PEA-001 or a separate synthetic policy set, and record why.
2. Define the request fields, required information, effective-date handling, and examples of valid, incomplete, ambiguous, and unsupported requests for that scenario.
3. Define mock user roles and a server-enforced authorization matrix for policy reads, quoting, and draft creation. Keep human approval outside the agent's privileges.
4. Specify the versioned rule and mock rating inputs, currency and display locale, and a deterministic worked quote example. Decide whether structured rule lookup meets the evaluation need or whether semantic retrieval requires a later ticket.
5. Record the decisions in a reviewable decision document, update the PRD's open decisions, and refine the candidate tickets in `docs/backlog/` against the chosen scenario.

## Decision outputs

| Decision | Required record |
|---|---|
| First scenario | Product line, endorsement type, rationale, and relationship to PEA-001 |
| Intake contract | Required fields, validation examples, and effective-date interpretation |
| Authorization | Mock roles and permitted or rejected actions enforced by the server |
| Rule evidence | Rule ID/version, selection metadata, and no-match/conflict behavior |
| Quote convention | Currency, locale, rating-table version, formula, assumptions, and worked amounts |
| Retrieval approach | Structured lookup decision and any measured reason to add RAG |

## Business rules

### BR-001: First flow

- Select one supported endorsement flow before generalizing to other example types in the PRD.
- Do not treat the PRD's example endorsement types as a commitment to implement all four in the first slice.

### BR-002: Non-binding prototype

- Use synthetic policy, request, rule, and rating data only.
- Quotes and drafts remain mock and non-binding; approval stays with a human outside the agent's workflow.

## Acceptance criteria

### AC-1: Coherent scenario

**Given** the PRD's open product-line decision and PEA-001's life-policy flow  
**When** the spike is complete  
**Then** one first product line and endorsement type are recorded with a rationale and an explicit relationship to PEA-001.

### AC-2: Implementable contracts

**Given** the selected scenario  
**When** the decision document is reviewed  
**Then** it includes the intake field contract, mock role authorization matrix, versioned rule selection behavior, and deterministic quote convention with a worked example.

### AC-3: Retrieval and follow-on work

**Given** the decision document  
**When** the PRD and backlog are reconciled  
**Then** the PRD's relevant open decisions are updated, the retrieval approach is explicit, and each affected backlog candidate reflects the chosen scenario or retains a named open question.

### AC-4: Boundary check

**Given** the proposed workflow and examples  
**When** they are checked against the PRD  
**Then** no role can bind, issue, activate, or modify live coverage, and draft output remains pending human review.

## Out of scope

- Building intake screens, rule retrieval, quote or draft tools, or production connectors.
- Implementing all example endorsement types before the first flow is selected.
- Defining real insurer rules, actuarial prices, or a legally effective approval process.

## Notes for implementation

- Treat this as a decision spike. The worked quote is a reproducible synthetic example, not a production pricing model.
- Keep unresolved choices visible in the decision document; do not silently make them implementation defaults.
- The follow-on candidates are in [docs/backlog](../backlog/README.md) and become full tickets only when promoted.

## Dependencies and open questions

- The PRD owner must confirm the first product line and endorsement type, mock roles, currency/locale, and evaluator expectations for RAG.
- PEA-001's mock authentication decision should be reused or explicitly separated from the service-representative role model.
