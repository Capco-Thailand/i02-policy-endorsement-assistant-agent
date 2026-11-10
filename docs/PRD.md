# PRD — I02 Life Insurance Policy Endorsement Assistant

**Version:** 1.2 | **Date:** 2026-11-10 | **Status:** MVP

## 1. Product goal and scope

Build an AI-assisted life insurance endorsement workflow. Staff select a policy, describe a requested change, and receive RAG-grounded policy details and endorsement rules. The system checks authorization and eligibility, runs **mock eKYC** and a **bypassed mock document check**, estimates premium impact, and creates a **draft endorsement for human approval**.

- **Users:** Authenticated policy-service staff using synthetic demo accounts. All staff have one application role.
- **Supported changes:** Beneficiary, correspondence address, payment frequency, and accidental-death rider.
- **Policy statuses:** `ACTIVE` and `EXPIRED`; only `ACTIVE` policies may proceed to endorsement eligibility.
- **Data:** Synthetic policies, customer profiles, rules, documents, and rating tables only.
- **Out of scope:** Production identity-provider integration, real eKYC, real document inspection/OCR, medical underwriting, insurer integrations, issuance, automated approval, live policy updates, or coverage binding.

### Authentication and access

- Staff sign in with individual synthetic demo accounts and can sign out. The backend validates the session on every protected request; a browser-provided user ID or role is never trusted as proof of identity. Sessions expire and are invalid after sign-out.
- Unauthenticated users cannot view policies, retrieve policy evidence, create requests or drafts, or review drafts. The UI directs them to sign in. The API returns `401` for missing or invalid authentication.
- Staff can access only policies assigned to their demo account and can create requests and submit drafts for those policies. A signed-in staff member assigned to the same policy can review a submitted draft and record approval or rejection, except its creator. Seed at least two staff accounts assigned to one policy so this flow can be demonstrated. The backend enforces policy access and the no-self-approval rule; inaccessible policy identifiers must not reveal policy details.
- Authentication identifies the staff member. Mock eKYC verifies a synthetic customer fixture and does not sign anyone in or grant access. Audit records include the authenticated actor and action without storing credentials or session secrets.
- Demo credentials and session configuration are supplied through local seed/configuration and documented for development. Production account management, password recovery, SSO, and external identity providers are outside this MVP.

## 2. Agent workflow

1. **Sign in and Understand Endorsement Request:** Authenticate the staff member, then identify the policy, requested change, requester, effective date, and required inputs. Ask for missing information.
2. **Retrieve Policy Details & Endorsement Rules:** Use **mandatory RAG** to retrieve authorized policy information and applicable, effective-dated endorsement rules, including source references.
3. **Validate Request & Eligibility:** Check authorization, input completeness, policy status, and applicable rules. Run `verify_ekyc` against synthetic identity fixtures. Run `verify_documents` as an explicit **mock bypass** returning `BYPASSED_MOCK` (no upload or document-content validation required). Record the bypass in audit history. Ineligible, failed-eKYC, conflicting, or referral cases do not proceed to automatic quotation/drafting.
4. **Calculate Premium Impact:** For eligible requests with successful mock eKYC, call `quote_endorsement` using mock rating data; support zero-premium-impact changes.
5. **Create Draft Endorsement for Human Approval:** Call `create_endorsement_draft` to save proposed changes, premium impact, verification outcomes, and RAG references as `DRAFT` with `binding=false`. Submit for review as `PENDING_APPROVAL`. A different signed-in staff member can mark it `APPROVED` or `REJECTED`; **approval records a decision only and never updates/binds a policy**.

**Workflow statuses:** `DRAFT` → `PENDING_APPROVAL` → `APPROVED` / `REJECTED`. Blocked requests show an explanation and remain outside this approval progression. Neither the agent nor human approval in this MVP issues a policy endorsement.

## 3. Containerized architecture

```text
Browser
   |
[Frontend container — React / Next.js / shadcn/ui]
   | REST
[Backend container — TypeScript / Fastify (typed API contracts)]
   |-- Authentication, session validation, agent orchestration, and access control
   |-- Mock eKYC; document-check bypass
   |-- Deterministic eligibility, mock quote, draft/review, audit
   | internal API
[RAG container — retrieval and ingestion]
   |-- Policy-detail and endorsement-rule retrieval
   |
[PostgreSQL + pgvector container]
   |-- Synthetic policy/rule data, embeddings, requests, drafts, audit
```

Use separate `frontend`, `backend`, and `rag` Dockerfiles plus a root `compose.yaml`. Storage runs in its own container. Build the frontend with the Next.js App Router and shadcn/ui components. Fastify owns the REST API; validate requests and responses with schemas that also drive OpenAPI and TypeScript client types. Seed demo data; provide health checks and environment configuration. The backend controls all writes and calls RAG over an internal interface. The browser must not directly access RAG or the database.

## 4. RAG and verification rules

| Component | Required behavior |
|---|---|
| **Policy-detail RAG** | Retrieve only authorized policy information, filtered by `policy_id` and version; cite original policy sections. Verify key decision fields against structured records. |
| **Endorsement-rule RAG** | Retrieve applicable rules by product, change type, and effective date; return citations and rule versions. Missing or conflicting rules trigger human referral. |
| **Mock eKYC** | Simulate identity match, ID expiration, and liveness using synthetic fixtures; return `VERIFIED`, `FAILED`, or `REVIEW_REQUIRED`, plus reasons. No real biometrics. |
| **Mock document verification** | Return `BYPASSED_MOCK` without OCR, signature analysis, file inspection, or authenticity checks. Record the result clearly; do not describe it as real verification. |
| **Eligibility and rating** | Backend applies deterministic rules and mock rating tables; the LLM and RAG do not independently authorize endorsements or set premiums. |

Apply authorization filters **before** retrieving policy evidence. Treat retrieved content as untrusted. Do not place identity documents in the vector index. `BYPASSED_MOCK` permits the **synthetic MVP workflow only**, never a live policy action.

## 5. Functional requirements (feature overview)

This is a **high-level feature list in implementation order**. IDs are stable references, not sequence numbers. Authentication and policy access are prerequisites for protected policy and endorsement features. Each feature will have a separate detailed requirement and acceptance criteria for implementation.

| ID | Feature | Description |
|---|---|---|
| FR-14 | **Authenticate Staff** | Sign in/out with individual synthetic demo accounts; validate expiring sessions on protected API calls; enforce policy access and no-self-approval on the backend. |
| FR-03 | **Check Policy Access & Requester Authorization** | Confirm permission to view a policy and request the specified change. |
| FR-01 | **Display Policy List & Policy Detail** | View permitted life policies, status, owner/insured, coverage, beneficiaries, riders, and payment details. |
| FR-02 | **Create Endorsement Request** | Choose a policy and submit one of the four supported policy changes. |
| FR-04 | **Retrieve Policy Details with RAG** | Fetch relevant policy evidence with source citations and versions. |
| FR-05 | **Retrieve Endorsement Rules with RAG** | Fetch change-specific rules and requirements with citations and effective dates. |
| FR-06 | **Verify Customer Identity (Mock eKYC)** | Simulate identity checks with synthetic pass/fail/review outcomes. |
| FR-07 | **Bypass Document Verification (Mock)** | Record `BYPASSED_MOCK` without inspecting or validating uploaded documents. |
| FR-08 | **Check Endorsement Eligibility** | Validate required inputs, authorization, active status, applicable rules, and mock eKYC; explain blocked/referred cases. |
| FR-09 | **Calculate Premium Impact (Mock Quote)** | Show estimated before/after premium and change amount from mock rating data. |
| FR-10 | **Create Draft Endorsement for Human Approval** | Save a non-binding `DRAFT` with proposed changes, quote, and supporting evidence; submit as `PENDING_APPROVAL`. |
| FR-11 | **Review & Approve/Reject Endorsement Draft** | A signed-in staff member assigned to the policy, other than the creator, can review a submitted draft and record an `APPROVED` or `REJECTED` decision; staff can track status. |
| FR-12 | **Record Activity & Audit History** | Log access, RAG sources, eKYC result, document bypass, quotes, draft creation, and reviewer decisions. |
| FR-13 | **Run the System with Docker Compose** | Start FE, BE, RAG, and PostgreSQL/pgvector with seeded synthetic data. |

**Guardrails:** Access checks precede RAG. Failed eKYC, missing or contradictory rules, expired policies, and ineligible changes block automatic quote/draft creation. A document bypass is a declared simulation, not evidence of real verification. No workflow state changes the live policy.

## 6. Evaluation

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

Use a versioned synthetic evaluation set fixed before each run. Cover all four change types with at least 20 cases each for intent classification, policy retrieval, rule retrieval, and eligibility (at least 80 cases per measure). Include eligible, ineligible, expired-policy, missing-rule, conflicting-rule, and unauthorized cases. Cover each mock eKYC outcome (`VERIFIED`, `FAILED`, `REVIEW_REQUIRED`) with at least 20 cases (at least 60 total). Evaluate document bypass, draft completeness, and quote agreement on every applicable case. Include sign-in, sign-out, session expiry, cross-account access, self-approval, duplicate submission, and attempted binding in the safety set; every unauthorized action and binding attempt must be blocked.

For each measure, report the fixture version, denominator, passing count, percentage, and failed case IDs. Record a baseline on the first run; no baseline is claimed in this PRD. Also report false referrals of eligible requests, incorrect successful drafts, and retrieval failures by change type as counter-metrics, with counts and denominators. Investigate any increase from the baseline before declaring the MVP ready. A percentage alone, or a result below the minimum sample size, does not satisfy a release target.

Test sign-in, sign-out, expired/invalid sessions, cross-account policy access, blocked self-approval, approval by a different staff account, active/expired policies, successful/failed mock eKYC, document bypass, unavailable/conflicting RAG evidence, premium changes and zero-delta quotes, duplicate submissions, and tool failure handling.

## 7. Definition of done

- All 14 listed features function with seeded synthetic data using Docker Compose.
- Staff can sign in and out; protected actions require a valid session, and the backend enforces policy access and no-self-approval.
- RAG provides versioned, cited policy and rule evidence, restricted by policy authorization.
- The four supported endorsement types reach a draft when eligible; blocked cases show reasons.
- Mock eKYC gates the workflow; document verification is always visibly marked `BYPASSED_MOCK` and audited.
- A draft can be submitted for human approval, then approved or rejected by a different signed-in staff member.
- Quotes are deterministic, all actions are auditable, and **no draft or approval modifies or binds any live policy**.
- Evaluation thresholds in Section 6 are met.

**Principle:** *RAG retrieves evidence; backend validates and quotes; the agent prepares a draft; a different staff member decides; live policy changes remain outside the MVP.*
