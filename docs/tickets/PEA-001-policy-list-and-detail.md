# PEA-001: Display Policy List & Policy Detail

**Type:** User Story  
**Priority:** P1 - High  
**Version:** 1.0  
**Status:** To Do  
**GitHub issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/1  
**Scope:** Frontend + Backend + synthetic database

## User story

As a **Policyholder**, I want to view my life insurance policies and select one, so that I can request an endorsement for the correct policy.

## Background and boundary

This is a policyholder-facing entry flow for the prototype. Use synthetic policy data and a local/mock database only. Do not connect to an insurer or production policy system. Showing a policy or opening endorsement intake does not change coverage, create an endorsement, or constitute approval. Drafts remain non-binding and pending human review, consistent with [PRD.md](PRD.md).

## Scope

1. Create the My Policies page at `/policies`.
2. Retrieve the signed-in mock user's policies through a backend API backed by the synthetic dataset.
3. Let the user select a policy and view it at `/policies/:policyId`.
4. Display the policy's existing beneficiary information.
5. Show a Request Endorsement control for eligible policies; disable it for expired policies.
6. For an active policy, navigate to `/policies/:policyId/endorsements/new`.
7. Support only `ACTIVE` and `EXPIRED` statuses in this slice.
8. Enforce policy access and endorsement eligibility on the backend using the authenticated/mock user context and stored policy status.
9. Add automated coverage for the list, detail, access-control, and eligibility behavior.

## Data requirements

| Field | Type | Description |
|---|---|---|
| `policy_id` | string | Internal policy ID |
| `policy_number` | string | Policy number |
| `policyholder_name` | string | Policyholder name |
| `product_name` | string | Life insurance product |
| `policy_status` | enum | `ACTIVE` or `EXPIRED` |
| `sum_assured` | decimal | Current sum assured |
| `annual_premium` | decimal | Annual premium |
| `effective_date` | date | Policy start date |
| `expiry_date` | date or null | Policy expiry date |
| `beneficiaries` | array | Current beneficiaries |

Each beneficiary contains `beneficiary_id`, `full_name`, `relationship`, and `allocation_percentage`.

## Business rules

### BR-001: Policy status

- The MVP supports only `ACTIVE` (coverage currently in force) and `EXPIRED` (coverage ended).
- The stored/backend policy status is authoritative. Do not infer status from `expiry_date` alone.

### BR-002: Endorsement eligibility

- Only `ACTIVE` policies can initiate endorsement requests.
- For an `EXPIRED` policy, the Request Endorsement control is disabled and the backend rejects attempts to start an endorsement.
- The destination route is navigation into endorsement intake. It does not itself create a draft, bind coverage, or approve a request.

### BR-003: Policy authorization

- A user can list and retrieve only policies they are authorized to view.
- The backend checks ownership or configured access permissions for every policy read and endorsement-initiation request.
- Requests for another user's policy are rejected without returning policy or beneficiary data. A consistent not-found or forbidden response may be selected by implementation, provided it does not disclose the record.

## Acceptance criteria

### AC-1: List own policies

**Given** the user is authenticated in the synthetic demo context  
**When** they open `/policies`  
**Then** the page loads their authorized policies from the backend and shows each policy's number, product, status, and effective/expiry information  
**And** an empty result is presented as an empty state rather than an error.

### AC-2: Open policy details

**Given** a policy is in the user's authorized policy list  
**When** the user selects it  
**Then** `/policies/:policyId` displays all required policy fields and current beneficiaries, including each beneficiary's name, relationship, and allocation percentage.

### AC-3: Active policy can proceed

**Given** a policy's backend status is `ACTIVE` and the user is authorized  
**When** the user views its detail page and chooses Request Endorsement  
**Then** the user is navigated to `/policies/:policyId/endorsements/new`.

### AC-4: Expired policy cannot proceed

**Given** a policy's backend status is `EXPIRED`  
**When** the user views its detail page  
**Then** Request Endorsement is visibly disabled  
**And** a direct or forged backend initiation request is rejected without creating an endorsement draft.

### AC-5: Policy access is enforced

**Given** a user is not authorized for a policy  
**When** they request its details or attempt to initiate an endorsement  
**Then** the backend rejects the request without exposing policy or beneficiary information and without creating a draft.

### AC-6: Status comes from backend

**Given** the stored status and expiry date appear inconsistent  
**When** the page determines whether endorsement can be initiated  
**Then** the backend status controls eligibility, and the client does not grant eligibility based only on the date.

### AC-7: Fail safely on API errors

**Given** the list or detail API fails or returns invalid data  
**When** the page renders  
**Then** it shows a recoverable error state and does not display fabricated policy or beneficiary data.

### AC-8: Automated coverage

Tests cover authorized list/detail retrieval, empty list, unauthorized list/detail access, active and expired eligibility, direct backend attempts for expired/unauthorized policies, and UI loading/error states. Backend tests verify rejected requests do not create drafts.

## Out of scope

- Connecting to live insurer, policy administration, or production databases.
- Creating, quoting, approving, binding, issuing, or applying an endorsement as part of this story.
- Supporting statuses beyond `ACTIVE` and `EXPIRED`.
- Editing policy or beneficiary data.

## Notes for implementation

- Keep authorization and eligibility checks on the server; frontend button state is only a presentation of backend eligibility.
- Return only the fields needed by this flow and avoid unnecessary personal data in logs.
- Add or update API documentation with the implemented request/response and error contracts.
- Use deterministic synthetic fixtures. Define and document the mock authentication/ownership mechanism as part of implementation if the repository does not yet have one.

## Dependencies and open questions

- Confirm the synthetic database technology and seed/fixture approach during implementation.
- Confirm the repository's mock authentication/ownership model; do not substitute client-supplied ownership claims for server authorization.
- Confirm the display format/currency for monetary values if no product convention exists.
