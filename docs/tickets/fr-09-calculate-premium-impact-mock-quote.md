# FR-09 — Calculate Premium and Benefit Impact (Mock Quote)

**Title:** [Story] Calculate Premium and Benefit Impact (Mock Quote)
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/131
**Feature ID:** FR-09
**Product context:** [PRD](../PRD.md)
**Risk:** Medium — a wrong estimate could mislead a customer despite being non-binding.
**State:** Ready for ticket/UX handoff

## Summary and objective

Provide a separate deterministic calculator for a synthetic premium and benefit comparison. Fastify invokes it only for an authorized request with a fresh `CAN_PROCEED` FR-08 assessment and only when payment frequency or accidental-death rider values change. FR-10 owns the later proposal presentation and persistence.

## User story or requirement

As a customer with an eligible change request, I want a traceable comparison of current and proposed payment and benefit values so that I can review its impact before deciding on a non-binding proposal.

## Business or technical context

- The [PRD](../PRD.md) sets the non-binding, synthetic-only boundary; [ADR](../ADR.md) requires a separate internal HTTP calculator. FR-08 is the assessment gate. FR-10 consumes this result in its proposal. FR-13 packages the calculator in Compose.
- The [OIC public life-policy search](https://oiceservice.oic.or.th/insurancelife/) publishes a *premium per THB 1,000 sum insured* field and filters for product, rider, age, sex, term, and payment term. Use that published data model as the provenance for a per-THB-1,000 fixture design. The demo products and customers are fictional; **no numerical fixture below is an OIC rate, an approved insurer rate, or a live quote**. The OIC page did not provide a verifiable matching rate for the three synthetic products. The [OIC life-rate approval criteria](https://oiceservice.oic.or.th/document/File/Law/949/6dbee4ae-79f3-4fce-b155-8ba24c0baeeb.pdf) informs the need for explicit assumptions and versioning, not the numerical fixture values.
- The versioned `synthetic-rating-v1` fixture contains three policy/product pairs. Life sum insured comes from the authorized FR-14 structured coverage. Baseline annual life premium is a synthetic THB 12 per THB 1,000 for Family Protection and Secure Future and THB 10 per THB 1,000 for Classic Life. Family Protection has an existing THB 250,000 accidental-death rider; the other two have none. Synthetic rider premium is THB 6 per THB 1,000 of rider benefit annually. A hypothetical added rider has THB 250,000 benefit. These numbers are fixed test data, not actuarial prices.
- Payment factors on the annual total are `ANNUAL=1.00`, `SEMI_ANNUAL=1.02`, `QUARTERLY=1.04`, `MONTHLY=1.08`; divide by 1, 2, 4, or 12 installments respectively. Calculate in integer satang and round each installment half-up to the nearest satang. Compare annualized scheduled payments as well as per-installment amounts, and include the number of installments. Recalculate from the annual base each time, not from a rounded current installment.
- FR-08 currently permits only monthly and annual payment-frequency requests and refers rider changes for further review. The calculator must support all four frequencies and rider add/remove in direct contract tests; the customer API must still respect the current FR-08 gate. FR-09 does not broaden FR-08 eligibility or change its rule corpus.

## Acceptance criteria

- [ ] A signed-in owner can request a calculation for a recorded request only after Fastify performs a fresh FR-08 assessment of that request and obtains `CAN_PROCEED`. Another owner, forged policy/request ID, expired policy, `CANNOT_PROCEED`, or `NEEDS_REVIEW` gets no calculator call or quote. Repeated requests with the same validated inputs and rating version give the same result.
- [ ] `BENEFICIARY` and `ADDRESS` requests make no calculator call and return an explicit `UNCHANGED` premium and benefit impact for FR-10. `PAYMENT_FREQUENCY` requests call the calculator for the before/after installment amount, schedule, and annualized total while the life and rider benefits remain unchanged. `ACCIDENTAL_DEATH_RIDER` add/remove calls the calculator only if FR-08 ever permits it; direct calculator tests cover both actions now. Other fields never change through calculation.
- [ ] Versioned, repeatably loadable synthetic fixtures cover all three seeded policies and their baseline payment frequencies, product IDs, life benefits, rider state, rider benefit, and annual rates. The calculator selects by exact policy/product/version, rejects unknown or duplicate fixtures, and does not use vector similarity or an LLM for numerical selection or arithmetic. The fixture's policy ID, product ID, current frequency and benefit values must reconcile with the authorized structured policy before a call; missing or contradictory data blocks calculation.
- [ ] The internal calculator has a versioned HTTP request and response contract. Fastify alone calls it after authorization and assessment. The request contains only request ID, policy ID, product ID, effective date, change type and proposed fields, validated current frequency/benefits, and rating version. It contains no customer name, credentials, session secret, or uploaded content. The response includes rating version, THB currency, current/proposed premium per installment, frequency, installments per year, annualized scheduled total, applicable life and rider benefits, and signed differences. Fastify validates the full response and passes calculated amounts through without recomputing them.
- [ ] For the Family Protection fixture, annual life premium is THB 12,000 and annual rider premium THB 1,500. Current monthly installment is THB 1,215 and annualized scheduled total THB 14,580; changing to annual yields THB 13,500 per installment and total, a THB 1,080 reduction in scheduled annual payments, with benefits unchanged. Exact direct calculator tests also cover four frequencies, rider add/remove, zero difference for unchanged inputs, rounding, and deterministic repeatability.
- [ ] Missing/mismatched fixture, stale rating version, invalid calculator response, timeout, or service failure returns a distinct calculation failure. It does not become a zero impact, an eligibility denial, or a proposal. Neither quote nor failure writes policy, coverage, or a binding record. An accessible API contract and developer instructions explain the service and synthetic provenance. Browser E2E proves the authorized quote and blocked paths; FR-10 later owns the customer-facing comparison.

## Scope and out of scope

In scope:
- Synthetic rating fixture, independent internal calculator service, Fastify integration and validation, owner/assessment gate, API result for FR-10, contract and browser tests.

Out of scope:
- Real OIC or insurer pricing, actuarial underwriting, live policy changes, coverage binding, and the FR-10 proposal screen/state.
- Altering FR-08 rider referral or allowed frequency rules. FR-06 eKYC and FR-07 upload do not participate.

## Dependencies

- FR-02 recorded request, FR-03 authorized policy, FR-08 fresh assessment, and FR-14 structured benefit values are implemented. FR-10 consumes the quote. FR-13 packages and starts the service with Compose; local development and CI start it independently until then.

## Related subtasks

None.

## Accepted decisions and readiness

- 2026-11-23: Calculate only affected values after `CAN_PROCEED`; beneficiary/address changes require no calculator call.
- 2026-11-24: Use the public OIC life-policy search and OIC rate guidance as the *reference for data shape and provenance*. Keep all numerical rates clearly synthetic because no matching OIC-approved rates exist for fictional products. Use exact structured lookup and deterministic arithmetic, not vector retrieval, for amounts.
- 2026-11-24: FR-09 supplies a backend quote contract; FR-10 owns the proposal UI. Existing FR-09–FR-12 UX handoff remains the presentation contract.
- Status: Requirements and existing UX references are ready for ticket/UX review. No unanswered decision blocks FR-09 implementation.

## UX handoff references

- [Proposal visual contract](../../_bmad-output/initiative-customer-authentication/ux-fr-09-12/DESIGN.md)
- [Proposal behavior contract](../../_bmad-output/initiative-customer-authentication/ux-fr-09-12/EXPERIENCE.md)
- [Proposal review mockup](../../design/page/proposal-review.html) — FR-10 presentation reference; FR-09 adds no separate screen.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review completed, if applicable
- [ ] CI checks passed, if applicable
- [ ] Related Issues and PRs linked
- [ ] Progress and handover updated
- [ ] No unresolved blockers
