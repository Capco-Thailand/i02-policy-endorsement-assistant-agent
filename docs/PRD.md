# PRD — I02 Life Insurance Policy Endorsement Assistant

**Version:** 1.9 | **Date:** 2026-11-25 | **Status:** MVP

This PRD states the business outcome, product scope, cross-feature rules, and success measures. Detailed behavior and acceptance criteria live in [implementation tickets](tickets/) and [backlog tickets](backlog/). GitHub Issues track discussion and delivery status; [ticket workflow](TICKETING.md) explains how the records connect. Architecture decisions live in [ADR.md](ADR.md).

## 1. Product goal and scope

Build a customer-facing AI-assisted life insurance endorsement request workflow. Customers select one of their policies and submit a requested change. The assistant checks the authorized policy's versioned policy wording and the applicable endorsement rules from vector retrieval, then explains with citations whether the request can proceed, cannot proceed, or needs further review. When an eligible change affects premium or benefits, the workflow calls a separate deterministic calculation service and presents its returned proposal for customer review.

- **Users:** Authenticated customers using synthetic demo accounts to request and review changes to their own policies.
- **Supported changes:** Beneficiary, correspondence address, payment frequency, and accidental-death rider.
- **Policy statuses:** `ACTIVE` and `EXPIRED`; only `ACTIVE` policies may start or submit an endorsement request. An `EXPIRED` policy cannot create a request.
- **Data:** Synthetic policy records and versioned mock policy documents, customer profiles, mock endorsement rules, and rating tables only. FR-04 and FR-05 supply the RAG source documents for the existing demo products.
- **Out of scope:** Document upload in the endorsement flow, production identity-provider integration, eKYC during the endorsement request, real document inspection/OCR, medical underwriting, insurer integrations, issuance, live policy updates, or coverage binding.

### Policy-detail expansion

[FR-14](tickets/fr-14-expand-policy-detail-with-coverage.md) adds synthetic insurer and product identity, coverage amounts, and key exclusions to the existing policy detail page, each supported by versioned synthetic policy wording. Its three seeded products, coverage amounts, exclusions, and source section IDs are accepted in the ticket. The view remains read-only and follows the same owner authorization and non-binding boundaries as the MVP. FR-14 is outside the MVP definition of done.

### Authentication and access

Customers use individual synthetic demo accounts. A customer can view and request changes only for policies linked to that account. The customer reviews the proposed updated-policy view for their own request and records an approval or rejection; another customer's request cannot be approved. Sign-in and policy ownership checks provide the MVP access boundary; no separate eKYC step runs during an endorsement request. The detailed authentication, session, authorization, and audit requirements are in the [FR-01 ticket](tickets/fr-01-authenticate-customers.md).

### Customer UI redesign

The [customer UI redesign initiative](../_bmad-output/initiative-customer-ui-redesign/initiative-customer-ui-redesign.md) improves data presentation and layout across the existing journey. [FR-15](backlog/fr-15-redesign-policy-detail-and-proposal-review.md) establishes policy-detail and proposal-review reference patterns; [FR-16](backlog/fr-16-redesign-sign-in-and-policy-list.md), [FR-17](backlog/fr-17-redesign-request-and-eligibility.md), and [FR-18](backlog/fr-18-redesign-decision-history.md) apply them to the remaining screens. These drafts do not add endorsement types, change eligibility or pricing, issue coverage, or update policy records.

## 2. Customer journey

1. A customer signs in, selects one of their policies, and describes a supported change.
2. The assistant checks the request against cited passages from both the policy wording and applicable endorsement rules in vector storage. It gives a preliminary assessment: can proceed, cannot proceed, or needs further review. For `NEEDS_REVIEW`, the response tells the customer the specific reason, such as missing or conflicting evidence, and what remains unresolved, with relevant citations when available.
3. For an eligible change affecting premium or benefits, the assistant invokes a separate calculation service. The customer sees the returned proposed premium and/or benefits beside the current values. For changes needing no recalculation, the proposal states that the relevant values remain unchanged.
4. The same customer reviews the proposal again and approves or rejects it. Approval records the proposed change in the customer's history page; no further review or issuance step runs. The underlying policy record and coverage remain unchanged.

## 3. Product and safety boundaries

The assistant evaluates the request using cited, versioned passages from both the authorized policy wording and effective endorsement rules. Policy ownership, active status, required inputs, evidence scope, and tool permissions remain enforced by the API. The assistant cannot treat a missing, stale, or contradictory source as permission to proceed; those cases require further review. The assistant does not calculate monetary amounts or benefits itself: a separate deterministic service returns any recalculated values. Requests that fail authorization or eligibility do not advance to calculation or a proposal.

The demonstration uses synthetic data only. Document upload is not part of this endorsement flow; an already implemented mock-upload capability does not participate in assessment, calculation, or proposal. For an added accidental-death rider, rules may call for health information or underwriting in a real process; this MVP does not collect or assess medical evidence and must disclose that further review may be needed before real coverage could change. Drafts and recorded human decisions never change or bind coverage. The chosen stack and API boundary are recorded in [ADR.md](ADR.md); detailed behavior belongs in the ticket records.

**Guardrails:** Access checks precede RAG. Expired policies cannot create endorsement requests. Both policy wording and applicable rules must support an automatic positive assessment; missing or contradictory evidence and ineligible changes block calculation and proposal creation. The updated-policy view is a proposal and approval creates a history record only; no workflow state changes a policy or binds coverage.

## 4. Evaluation

| Measure | MVP target |
|---|---:|
| Endorsement intent classification accuracy | ≥90% |
| Correct policy-detail retrieval | ≥95% |
| Relevant rule retrieval recall | ≥95% |
| Cited policy-and-rule assessment scenario correctness | ≥95% |
| Proposals contain policy/rule citations and applicable calculation results | 100% |
| Quotes agree with mock rating output | 100% |
| Unauthorized approvals, live-policy writes, or coverage binding | **0** |
| Unauthenticated protected actions or cross-account policy/draft access | **0** |

The evaluation design, minimum case counts, reporting fields, and regression scenarios are in [TESTING_STANDARD.md](TESTING_STANDARD.md#evaluation-protocol).

## 5. Definition of done

- The planned MVP capabilities function with seeded synthetic data using Docker Compose.
- Customers can sign in and out; protected actions require a valid session, and the backend enforces ownership-based policy access and customer decisions on their own proposals only.
- Vector retrieval provides versioned, cited policy wording and endorsement rules, restricted by policy authorization; the assistant assesses each request against both.
- The four supported endorsement types reach a draft when eligible; `CANNOT_PROCEED` and `NEEDS_REVIEW` show customer-readable reasons, and `NEEDS_REVIEW` identifies what remains unresolved.
- The customer sees current and proposed policy values, including calculated premium or benefit changes when applicable, before approving or rejecting their own request. An approved change appears in that customer's history page with the proposed values, decision, and time; there is no later approval or issuance step.
- Recalculations come from a separate deterministic service only when premium or benefits change; all actions are auditable, and **no draft or approval modifies or binds any live policy**.
- Evaluation thresholds in Section 4 are met.

**Principle:** *The assistant assesses each request against cited policy wording and rules; a separate service recalculates affected premium or benefits; the customer reviews a non-binding proposal.*
