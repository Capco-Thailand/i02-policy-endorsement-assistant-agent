# PRD — I02 Life Insurance Policy Endorsement Assistant

**Version:** 1.3 | **Date:** 2026-11-11 | **Status:** MVP

This PRD states the business outcome, product scope, cross-feature rules, and success measures. Detailed behavior and acceptance criteria live in [implementation tickets](tickets/) and [backlog tickets](backlog/). GitHub Issues track discussion and delivery status; [ticket workflow](TICKETING.md) explains how the records connect. Architecture decisions live in [ADR.md](ADR.md).

## 1. Product goal and scope

Build an AI-assisted life insurance endorsement workflow. Staff select a policy, describe a requested change, and receive RAG-grounded policy details and endorsement rules. The system checks authorization and eligibility, runs **mock eKYC** and a **bypassed mock document check**, estimates premium impact, and creates a **draft endorsement for human approval**.

- **Users:** Authenticated policy-service staff using synthetic demo accounts. All staff have one application role.
- **Supported changes:** Beneficiary, correspondence address, payment frequency, and accidental-death rider.
- **Policy statuses:** `ACTIVE` and `EXPIRED`; only `ACTIVE` policies may proceed to endorsement eligibility.
- **Data:** Synthetic policies, customer profiles, rules, documents, and rating tables only.
- **Out of scope:** Production identity-provider integration, real eKYC, real document inspection/OCR, medical underwriting, insurer integrations, issuance, automated approval, live policy updates, or coverage binding.

### Authentication and access

Staff use individual synthetic demo accounts. Access to policy information and endorsement actions is limited to assigned staff, and a draft creator cannot review their own work. Mock eKYC checks a synthetic customer scenario; it does not authenticate staff. The detailed authentication, session, authorization, and audit requirements are in the [FR-14 backlog draft](backlog/fr-1-authenticate-staff.md).

## 2. Staff journey

1. A staff member signs in, selects an assigned policy, and describes a supported change.
2. The assistant presents cited policy details and applicable endorsement rules, then explains any missing information or reason the request cannot proceed.
3. For an eligible synthetic request, the system shows the mock premium impact and prepares a non-binding draft.
4. A different authorized staff member records an approval or rejection decision. The decision does not issue an endorsement or change coverage.

## 3. Product and safety boundaries

The assistant retrieves cited policy details and effective endorsement rules, while deterministic backend checks decide eligibility and mock premium impact. Staff see whether evidence is missing or conflicting. Requests that fail authorization, eligibility, or mock eKYC do not advance to a quote or draft.

The demonstration uses synthetic data only. Document verification is explicitly bypassed and recorded as `BYPASSED_MOCK`; it must never be presented as real verification. Drafts and recorded human decisions never change or bind coverage. The chosen stack and API boundary are recorded in [ADR.md](ADR.md); detailed behavior belongs in the ticket records.

**Guardrails:** Access checks precede RAG. Failed eKYC, missing or contradictory rules, expired policies, and ineligible changes block automatic quote/draft creation. A document bypass is a declared simulation, not evidence of real verification. No workflow state changes a policy.

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
- Staff can sign in and out; protected actions require a valid session, and the backend enforces policy access and no-self-approval.
- RAG provides versioned, cited policy and rule evidence, restricted by policy authorization.
- The four supported endorsement types reach a draft when eligible; blocked cases show reasons.
- Mock eKYC gates the workflow; document verification is always visibly marked `BYPASSED_MOCK` and audited.
- A draft can be submitted for human approval, then approved or rejected by a different signed-in staff member.
- Quotes are deterministic, all actions are auditable, and **no draft or approval modifies or binds any live policy**.
- Evaluation thresholds in Section 4 are met.

**Principle:** *RAG retrieves evidence; backend validates and quotes; the agent prepares a draft; a different staff member decides; live policy changes remain outside the MVP.*
