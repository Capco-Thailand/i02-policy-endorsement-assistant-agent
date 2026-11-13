# PRD — I02 Life Insurance Policy Endorsement Assistant

**Version:** 1.5 | **Date:** 2026-11-13 | **Status:** MVP

This PRD states the business outcome, product scope, cross-feature rules, and success measures. Detailed behavior and acceptance criteria live in [implementation tickets](tickets/) and [backlog tickets](backlog/). GitHub Issues track discussion and delivery status; [ticket workflow](TICKETING.md) explains how the records connect. Architecture decisions live in [ADR.md](ADR.md).

## 1. Product goal and scope

Build a customer-facing AI-assisted life insurance endorsement request workflow. Customers select one of their policies, describe a requested change, and receive RAG-grounded policy details and endorsement rules. The system checks authorization and eligibility, runs **mock eKYC** and a **bypassed mock document check**, estimates premium impact, and presents a proposed updated-policy view for the customer to review and approve.

- **Users:** Authenticated customers using synthetic demo accounts to request and review changes to their own policies.
- **Supported changes:** Beneficiary, correspondence address, payment frequency, and accidental-death rider.
- **Policy statuses:** `ACTIVE` and `EXPIRED`; only `ACTIVE` policies may start or submit an endorsement request. An `EXPIRED` policy cannot create a request.
- **Data:** Synthetic policies, customer profiles, rules, documents, and rating tables only.
- **Out of scope:** Production identity-provider integration, real eKYC, real document inspection/OCR, medical underwriting, insurer integrations, issuance, live policy updates, or coverage binding.

### Authentication and access

Customers use individual synthetic demo accounts. A customer can view and request changes only for policies linked to that account. The customer reviews the proposed updated-policy view for their own request and records an approval or rejection; another customer's request cannot be approved. Mock eKYC checks a synthetic identity scenario within an endorsement request; it does not establish a sign-in session. The detailed authentication, session, authorization, and audit requirements are in the [FR-01 ticket](tickets/fr-01-authenticate-staff.md).

## 2. Customer journey

1. A customer signs in, selects one of their policies, and describes a supported change.
2. The assistant presents cited policy details and applicable endorsement rules, then explains any missing information or reason the request cannot proceed.
3. For an eligible synthetic request, the system shows the mock premium impact and a proposed updated-policy view beside the current policy details.
4. The same customer reviews the proposal again and approves or rejects it. Approval records the proposed change in the customer's history page; no further review or issuance step runs. The underlying policy record and coverage remain unchanged.

## 3. Product and safety boundaries

The assistant retrieves cited policy details and effective endorsement rules, while deterministic backend checks decide eligibility and mock premium impact. Customers see whether evidence is missing or conflicting. Requests that fail authorization, eligibility, or mock eKYC do not advance to a quote or draft.

The demonstration uses synthetic data only. Document verification is explicitly bypassed and recorded as `BYPASSED_MOCK`; it must never be presented as real verification. Drafts and recorded human decisions never change or bind coverage. The chosen stack and API boundary are recorded in [ADR.md](ADR.md); detailed behavior belongs in the ticket records.

**Guardrails:** Access checks precede RAG. Expired policies cannot create endorsement requests. Failed eKYC, missing or contradictory rules, and ineligible changes block automatic quote/draft creation. A document bypass is a declared simulation, not evidence of real verification. The updated-policy view is a proposal and approval creates a history record only; no workflow state changes a policy or binds coverage.

## 4. Evaluation

| Measure | MVP target |
|---|---:|
| Endorsement intent classification accuracy | ≥90% |
| Correct policy-detail retrieval | ≥95% |
| Relevant rule retrieval recall | ≥95% |
| Mock eKYC scenario correctness | ≥95% |
| Document bypass consistently returns and logs `BYPASSED_MOCK` | 100% |
| Deterministic eligibility scenario correctness | ≥95% |
| Drafts contain policy/rule citations, quote, and verification results | 100% |
| Quotes agree with mock rating output | 100% |
| Unauthorized approvals, live-policy writes, or coverage binding | **0** |
| Unauthenticated protected actions or cross-account policy/draft access | **0** |

The evaluation design, minimum case counts, reporting fields, and regression scenarios are in [TESTING_STANDARD.md](TESTING_STANDARD.md#evaluation-protocol).

## 5. Definition of done

- The planned MVP capabilities function with seeded synthetic data using Docker Compose.
- Customers can sign in and out; protected actions require a valid session, and the backend enforces ownership-based policy access and customer decisions on their own proposals only.
- RAG provides versioned, cited policy and rule evidence, restricted by policy authorization.
- The four supported endorsement types reach a draft when eligible; blocked cases show reasons.
- Mock eKYC gates the workflow; document verification is always visibly marked `BYPASSED_MOCK` and audited.
- The customer sees the proposed updated policy and mock premium impact before approving or rejecting their own request. An approved change appears in that customer's history page with the proposed values, decision, and time; there is no later approval or issuance step.
- Quotes are deterministic, all actions are auditable, and **no draft or approval modifies or binds any live policy**.
- Evaluation thresholds in Section 4 are met.

**Principle:** *RAG retrieves evidence; backend validates and quotes; the agent presents a proposed updated policy; the customer reviews and decides; no live coverage is bound.*
