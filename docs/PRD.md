# PRD — I02 Life Insurance Policy Endorsement Assistant

**Version:** 1.5 | **Date:** 2026-11-13 | **Status:** MVP

This PRD states the business outcome, product scope, cross-feature rules, and success measures. Detailed behavior and acceptance criteria live in [implementation tickets](tickets/) and [backlog tickets](backlog/). GitHub Issues track discussion and delivery status; [ticket workflow](TICKETING.md) explains how the records connect. Architecture decisions live in [ADR.md](ADR.md).

## 1. Product goal and scope

Build a customer-facing AI-assisted life insurance endorsement request workflow. Customers select one of their policies, describe a requested change, and receive RAG-grounded policy details, endorsement rules, and applicable document requirements. The system checks authorization and eligibility, accepts a mock document upload, estimates premium impact, and presents a proposed updated-policy view for the customer to review and approve.

- **Users:** Authenticated customers using synthetic demo accounts to request and review changes to their own policies.
- **Supported changes:** Beneficiary, correspondence address, payment frequency, and accidental-death rider.
- **Policy statuses:** `ACTIVE` and `EXPIRED`; only `ACTIVE` policies may start or submit an endorsement request. An `EXPIRED` policy cannot create a request.
- **Data:** Synthetic policies, customer profiles, rules, document-requirement references, upload fixtures, and rating tables only.
- **Out of scope:** Production identity-provider integration, eKYC during the endorsement request, real document inspection/OCR, medical underwriting, insurer integrations, issuance, live policy updates, or coverage binding.

### Authentication and access

Customers use individual synthetic demo accounts. A customer can view and request changes only for policies linked to that account. The customer reviews the proposed updated-policy view for their own request and records an approval or rejection; another customer's request cannot be approved. Sign-in and policy ownership checks provide the MVP access boundary; no separate eKYC step runs during an endorsement request. The detailed authentication, session, authorization, and audit requirements are in the [FR-01 ticket](tickets/fr-01-authenticate-customers.md).

## 2. Customer journey

1. A customer signs in, selects one of their policies, and describes a supported change.
2. The assistant presents cited policy details, applicable endorsement rules, and any document requirements. The customer uploads a synthetic file for the request; the app acknowledges receipt as a mock step without checking its contents or whether it satisfies the listed requirements. The assistant explains any missing information or reason the request cannot proceed.
3. For an eligible synthetic request, the system shows the mock premium impact and a proposed updated-policy view beside the current policy details.
4. The same customer reviews the proposal again and approves or rejects it. Approval records the proposed change in the customer's history page; no further review or issuance step runs. The underlying policy record and coverage remain unchanged.

## 3. Product and safety boundaries

The assistant retrieves cited policy details, effective endorsement rules, and applicable document requirements, while deterministic backend checks decide eligibility and mock premium impact. Customers see whether rule evidence is missing or conflicting. Requests that fail authorization or eligibility do not advance to a quote or draft.

The demonstration uses synthetic data only. The upload step records mock receipt, not document verification or underwriting. Uploaded content is not indexed for RAG or treated as evidence that a requirement was met. For an added accidental-death rider, rules may call for health information or underwriting in a real process; this MVP does not collect or assess medical evidence and must disclose that further review may be needed before real coverage could change. Drafts and recorded human decisions never change or bind coverage. The chosen stack and API boundary are recorded in [ADR.md](ADR.md); detailed behavior belongs in the ticket records.

**Guardrails:** Access checks precede RAG and upload. Expired policies cannot create endorsement requests. Missing or contradictory rules and ineligible changes block automatic quote/draft creation. Mock upload success never means that documents were verified or that underwriting passed. The updated-policy view is a proposal and approval creates a history record only; no workflow state changes a policy or binds coverage.

## 4. Evaluation

| Measure | MVP target |
|---|---:|
| Endorsement intent classification accuracy | ≥90% |
| Correct policy-detail retrieval | ≥95% |
| Relevant rule retrieval recall | ≥95% |
| Mock upload receipt and disclosure are recorded for applicable requests | 100% |
| Deterministic eligibility scenario correctness | ≥95% |
| Drafts contain policy/rule citations, quote, and mock upload status | 100% |
| Quotes agree with mock rating output | 100% |
| Unauthorized approvals, live-policy writes, or coverage binding | **0** |
| Unauthenticated protected actions or cross-account policy/draft access | **0** |

The evaluation design, minimum case counts, reporting fields, and regression scenarios are in [TESTING_STANDARD.md](TESTING_STANDARD.md#evaluation-protocol).

## 5. Definition of done

- The planned MVP capabilities function with seeded synthetic data using Docker Compose.
- Customers can sign in and out; protected actions require a valid session, and the backend enforces ownership-based policy access and customer decisions on their own proposals only.
- RAG provides versioned, cited policy and rule evidence, restricted by policy authorization.
- The four supported endorsement types reach a draft when eligible; blocked cases show reasons.
- The customer can upload a synthetic document; receipt is visibly marked as mock and audited, without content validation or a claim of verification.
- The customer sees the proposed updated policy and mock premium impact before approving or rejecting their own request. An approved change appears in that customer's history page with the proposed values, decision, and time; there is no later approval or issuance step.
- Quotes are deterministic, all actions are auditable, and **no draft or approval modifies or binds any live policy**.
- Evaluation thresholds in Section 4 are met.

**Principle:** *RAG retrieves evidence; backend validates and quotes; the agent presents a proposed updated policy; the customer reviews and decides; no live coverage is bound.*
