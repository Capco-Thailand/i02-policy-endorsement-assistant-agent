# Product Requirements Document (PRD)

## Policy Endorsement Assistant Agent

| Field | Value |
|---|---|
| Product ID | I02 |
| Domain | Insurance |
| Project complexity | Moderate |
| Status | Draft v0.1 |
| Document date | 2026-11-09 |

## 1. Product summary

Build an insurance policy endorsement assistant that helps an authorized policy-service user understand a customer's requested policy change, check applicable endorsement rules, verify required information, calculate a **mock** premium-impact estimate, and prepare a draft for human approval. The agent must **never bind coverage or modify a live policy**.

The prototype will use **synthetic policies, endorsement rules, rating tables, and change requests**, plus two mock administrative tools: `quote_endorsement` and `create_endorsement_draft`.

## 2. Problem and opportunity

Customers request changes to existing insurance policies, such as updating a vehicle, adding a driver, changing an address, or modifying coverage. These requests can require several manual steps: understanding the change, locating the correct endorsement rules, checking eligibility and missing fields, estimating a premium change, and assembling an approval request.

The assistant should reduce repetitive lookup and drafting work while giving the human reviewer a traceable explanation of how the recommendation and estimate were produced. It is an **assistant to review**, not an autonomous underwriting or policy-administration authority.

## 3. Goals and success measures

### Goals

1. Correctly identify supported endorsement intents from natural-language requests.
2. Retrieve the applicable versioned rule or explicitly report that no reliable rule was found.
3. Detect missing and invalid inputs before requesting a quote.
4. Use a deterministic mock rating tool rather than inventing premium amounts.
5. Create a reviewable endorsement draft with rule references and an audit trail.
6. Block unauthorized actions and any attempt to issue or alter live coverage.

### Draft success measures

| Measure | Definition | Draft target |
|---|---|---|
| Intent classification | Correct supported-change type, or `unsupported` | >= 90% on held-out synthetic requests |
| Rule compliance | Correct eligibility decision, required fields, and rule citations | >= 95% on labeled scenarios |
| Change authorization | Unauthorized actions blocked; no live-policy changes | 100% across negative tests |
| Missing-field detection | Required missing fields correctly flagged | >= 95% |
| Premium estimate integrity | Quoted amount matches mock rating-tool response | 100% |
| Draft completeness | All mandatory draft fields populated when eligible | >= 95% |

The numeric targets are project assumptions, not requirements shown on the source brief.

## 4. Users and primary job stories

**Primary user: Policy service representative.** When a customer asks for a policy change, I want to understand what details are needed, see the relevant rules and estimated impact, and produce a draft for review without changing the policy.

**Secondary user: Underwriting / approval reviewer.** When a draft is submitted, I want to see the requested change, rule evidence, missing information, quote assumptions, and authorization status so I can decide what to do next.

**Evaluator / administrator.** I need to inspect tool usage, rule versions, blocked actions, and outcome quality against known test cases.

## 5. Scope

### In scope — MVP

- Natural-language intake of one endorsement request at a time.
- Classification of a supported change type and extraction of request fields.
- Retrieval of applicable synthetic, versioned endorsement rules.
- Validation of required inputs and eligibility against those rules.
- Clarification prompts for missing or ambiguous information.
- Calls to `quote_endorsement` **only after** required data and rule checks pass.
- Calculation/display of premium difference from a deterministic **mock** rating service.
- Calls to `create_endorsement_draft` to produce a **non-binding** review artifact.
- User-visible summary with rationale, rule citations, quote assumptions, and review status.
- Audit logging and offline evaluation using synthetic cases.

Example MVP endorsement types: `add_driver`, `change_address`, `replace_vehicle`, and `change_coverage_limit`. Rules and rating behavior for these examples are invented for the prototype and must not be represented as real insurer rules.

### Out of scope

- Connecting to real insurers, policy administration systems, or production databases.
- Binding, issuing, activating, canceling, or modifying live coverage.
- Real payments, billing adjustments, document issuance, or customer notifications.
- A real actuarial pricing model or production underwriting decisions.
- Identity verification against external systems or legally effective approvals.
- Multi-policy changes, endorsements requiring negotiation, or complex referral workflows.

## 6. End-to-end user workflow

1. **Understand the request.** Read the user's message and identify the endorsement intent, referenced synthetic policy, effective date, and requested changes. If unsupported or ambiguous, ask for clarification or refer to a human.
2. **Retrieve endorsement rules.** Find the applicable rule by change type, policy attributes, and effective date; expose rule ID and version to the user.
3. **Validate required inputs.** Check presence, format, business constraints, eligibility, and caller authorization. Stop or ask questions if information is insufficient.
4. **Call mock rating tool.** Submit a validated, structured quote request to `quote_endorsement`; display the estimate and assumptions from its response without modifying any values.
5. **Draft approval request.** If eligible and authorized, call `create_endorsement_draft` to generate a review-only record. Show draft ID, proposed change, premium difference, rationale, and `PENDING_REVIEW` status.

Possible states: `INTAKE` -> `NEEDS_INFORMATION` / `UNSUPPORTED` / `INELIGIBLE` / `READY_TO_QUOTE` -> `QUOTED` -> `DRAFTED_PENDING_REVIEW`. Errors should yield `REQUIRES_HUMAN_REVIEW`, not silent approval.

## 7. Data and knowledge requirements

Maintain a synthetic dataset with:

- **Policies:** policy ID, line of business, status, term dates, base premium, coverage options, risk attributes, and authorized mock user roles.
- **Endorsement rules:** rule ID/version, supported change type, eligibility conditions, required inputs, effective dates, exclusions, and referral conditions.
- **Rating tables:** rule/table version, factor keys, allowed ranges, calculation method, and currency.
- **Requests:** request text, desired effective date, policy ID, proposed changes, and expected outcomes for testing.

### RAG decision

**RAG is useful but not a prerequisite for the MVP.** Start with deterministic structured lookup over a small, versioned synthetic rules catalog. Add semantic search / RAG only if rule text becomes sufficiently long or varied that keyword/field-based lookup misses relevant passages. Even when RAG is used, the **rule engine must validate eligibility deterministically** against structured rules; retrieved text alone must not authorize a change or calculate a premium.

Rule retrieval must include metadata filtering (effective date, product, change type, version), source IDs in responses, and a safe fallback when sources conflict or none match.

## 8. Mock tool contracts

### `quote_endorsement`

**Purpose:** Estimate mock premium impact; no persistent policy updates.

**Example request**

```json
{
  "request_id": "REQ-001",
  "policy_id": "SYN-POL-1001",
  "endorsement_type": "add_driver",
  "effective_date": "2026-12-01",
  "proposed_changes": { "driver_age": 32, "years_licensed": 10 },
  "rule_version": "ADD-DRIVER-v1"
}
```

**Example response (illustrative, not real pricing)**

```json
{
  "quote_id": "QUOTE-001",
  "currency": "USD",
  "previous_premium": 1200.00,
  "proposed_premium": 1284.00,
  "premium_delta": 84.00,
  "rating_table_version": "MOCK-RATE-v1",
  "assumptions": ["Synthetic annualized premium", "No taxes or fees"],
  "binding": false
}
```

### `create_endorsement_draft`

**Purpose:** Persist a mock review artifact, never apply the change to coverage.

**Required input:** request ID, synthetic policy ID, proposed changes, validated eligibility decision, cited rule IDs/versions, quote ID, premium delta, requestor role, and audit metadata.

**Required output:** draft ID, immutable summary, creation timestamp, and status `PENDING_REVIEW`. The mock endpoint must reject missing quote/rule evidence, ineligible requests, or unauthorized roles.

Both tools should return structured errors and support idempotency using `request_id` or an explicit idempotency key.

## 9. Security, safety, and non-functional requirements

- **Hard boundary:** No live policy write connector; no bind/issue/activate APIs exposed to the agent. UI text or user instructions must not override this restriction.
- **Role checks:** Enforce authorization on the tool/server side, not only in the agent prompt. Model approval as a separate human action outside the agent's privileges.
- **Trust boundaries:** Treat customer messages and retrieved policy/rule text as untrusted input; reject prompt-injection attempts to bypass rules or tools.
- **Privacy:** Use synthetic data only; avoid unnecessary personal data in logs and exports.
- **Reliability:** Fail closed on missing evidence, invalid tool responses, system errors, or uncertain eligibility; avoid duplicate drafts.
- **Observability:** Log structured traces with redaction, stable correlation IDs, timestamps, decisions, and rule/tool versions.
- **Performance goal:** For the demo environment, target <= 10 seconds end-to-end at p95 excluding human clarification; measure actual latency during evaluation.
- **Reproducibility:** Seed datasets and mock calculation rules; freeze evaluation fixtures for comparable runs.

## 10. Key screens / outputs

A minimal chat or form interface should show: request interpretation; missing-data prompts; eligibility result with rule citations; an itemized mock premium comparison; and a downloadable or viewable approval draft with an explicit **NOT BOUND — PENDING HUMAN REVIEW** indicator. A reviewer/evaluator view should expose the audit trace and rule/tool versions.

## 11. Assumptions, dependencies, and open decisions

**Assumptions:** This is a teaching/demo prototype; all policies and premiums are synthetic; a single currency and one insurance product line may be selected for MVP; approval is human-only and outside scope. Proposed targets, example endorsement types, latency, and mock API fields remain open.

**Dependencies:** Synthetic data generation, agreed rule logic, mock rating formula, accessible development environment, and representative labeled evaluation cases.

**Open decisions:**

1. Which insurance product line (e.g., personal auto) and which endorsement types are mandatory?
2. What are the mock user roles and precise criteria for draft authorization?
3. Which fields and rating logic must appear in the demonstration?
4. Does the evaluator require true vector RAG, or is a cited structured-rule lookup acceptable?
