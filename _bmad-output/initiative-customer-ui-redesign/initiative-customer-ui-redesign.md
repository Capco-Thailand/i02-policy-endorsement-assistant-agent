---
type: initiative
title: Customer UI Redesign
parent: none
sources:
  - docs/UX_REDESIGN_HANDOFF.md
  - docs/PRD.md
companions:
  - docs/UX_DESIGN_AUDIT.md
  - docs/DESIGN_STANDARD.md
  - docs/VISUAL_UX_CONSTRAINTS.md
  - _bmad-output/initiative-pea-001-policy-list-and-detail/ux-chore-shadcn-preset/DESIGN.md
  - apps/web/src/app/styles.css
  - design/page/shadcn-theme-preview.html
risk: medium
---

# Customer UI Redesign

## Description

Redesign the existing customer journey so a customer can find their policy facts, understand a requested change, and review a non-binding proposal without piecing together dense screens. The work covers presentation and layout across the implemented customer screens; the audit supplies design hypotheses, not approved layouts.

## Outcome

Authenticated customers can identify their policy, understand what a request would change, and find the next action on every customer screen, demonstrated with synthetic scenarios at desktop and 320px widths.

## Requirements

- R1 (handoff Screen acceptance checklist; PRD §2): The sign-in screen makes the customer action and synthetic-demo context clear at wide and narrow widths; a walkthrough can identify the first action without reading unrelated content.
- R2 (handoff Screen acceptance checklist; PRD §1): The policy list lets an authenticated customer distinguish their authorized policies and recognize expired records without opening every policy; every displayed fact has an authorized data source and unresolved values are identified.
- R3 (handoff Screen acceptance checklist; PRD §1 Policy-detail expansion): Policy detail makes status, term, coverage, beneficiaries, exclusions, and request availability scannable; sourced facts link to accessible citations and unresolved facts retain an explanation.
- R4 (handoff Screen acceptance checklist; PRD §2): For each supported change type, the request view distinguishes the current value, requested value, and recorded-request state; beneficiary allocations show exact percentages and a numeric total.
- R5 (handoff Screen acceptance checklist; PRD §2): Eligibility presents its outcome, reason, unresolved evidence when applicable, citations, and next action as distinct information; a customer can tell that recording a request is not an eligibility decision.
- R6 (handoff Screen acceptance checklist; PRD §2): Proposal review aligns current and proposed values by field, shows exact server-provided amounts and units, distinguishes changed from unchanged values and pending from decided states, and presents the non-binding meaning before a decision.
- R7 (handoff Screen acceptance checklist; PRD §2): Decision history lets a customer identify the policy, request, decision, and date for each record and open its proposal; the view states that recorded approval did not change coverage.
- R8 (handoff Design boundaries; visual constraints): Applicable loading, empty, error, expired, unresolved, pending, approved, and rejected states remain understandable with keyboard access and text labels at desktop and 320px widths without horizontal scrolling or color-only meaning.
- R9 (handoff Objective and Work sequence): The UX handoff defines reusable atoms, molecules, organisms, and templates; browser-viewable reference screens demonstrate the resulting data hierarchy and layout before the patterns are applied across the journey.

## Constraints

- C1 (handoff Objective and Design boundaries): Use the running shadcn/ui preset `b51GFh7y6`, Public Sans, semantic colors from `apps/web/src/app/styles.css`, and the theme preview as a visual reference; new UX contracts govern accepted layout changes.
- C2 (handoff Design boundaries; PRD §3): Use synthetic authorized data only; the browser does not decide eligibility or calculate premium or benefits, and proposals and approvals never update or bind coverage.
- C3 (handoff Design boundaries; PRD §§2–3): Preserve exact server-returned values, units, policy and rule citations, unresolved explanations, and the distinction between policy records and sourced evidence.
- C4 (handoff Design boundaries): Visualizations must answer a defined comparison, retain numeric labels, and avoid implying that unlike benefit types are comparable or proposed coverage is issued.
- C5 (PRD §1): Keep the four supported endorsement types and active/expired request boundary; this redesign does not add a new endorsement type or permit requests on expired policies.

## Done when

- A customer walkthrough can answer what policy they have, what the request would change, and what happens next from the relevant screens.
- Policy detail and proposal review reference mockups at desktop and 320px are reviewed first; accepted patterns then cover every customer screen and applicable state.
- `DESIGN.md`, `EXPERIENCE.md`, browser-viewable page mockups, and affected local tickets agree on the approved presentation and interaction rules.
- Keyboard, mobile, exact-value, citation, and non-binding checks pass with synthetic scenarios.

## Boundaries

- Out of scope: live insurer integration, issuance, policy writes, coverage binding, new endorsement types, and browser-side eligibility or pricing logic.
- The audit's proposed row, panel, chart, and comparison treatments remain UX options until customer review accepts them.
- Touch point: policy-list API — any additional summary facts require an authorized response; owner: the later list/detail implementation ticket.
- Tracer path: sign in → select policy → inspect sourced detail → request change → assess eligibility → review proposal → record decision → inspect history.

## References

- source — `docs/UX_REDESIGN_HANDOFF.md`, Objective, Screen acceptance checklist, Design boundaries, and Work sequence
- source — `docs/PRD.md`, §§1–3
- audit companion — `docs/UX_DESIGN_AUDIT.md`, screen critique and proposed direction
- design standards companion — `docs/DESIGN_STANDARD.md` and `docs/VISUAL_UX_CONSTRAINTS.md`
- theme companion — `_bmad-output/initiative-pea-001-policy-list-and-detail/ux-chore-shadcn-preset/DESIGN.md`
- runtime theme companion — `apps/web/src/app/styles.css`
- preview companion — `design/page/shadcn-theme-preview.html`

## Notes

- Decision: 2026-11-25 — The customer accepted the current FR-15 policy-detail and proposal-review reference layouts as the implementation baseline; other audit options remain hypotheses for their screens.
- Decision: 2026-11-25 — The customer chose “What would this request change and cost?” to lead the FR-15 reference screens; current coverage remains accessible.
- Open question: Should richer policy-list facts be added through an authorized summary API, or should the redesign use only currently available list fields?
- Source reconciliation: The shadcn preset UX contract now defers policy-detail and proposal-review composition to the accepted FR-15 UX contracts; its semantic theme remains authoritative.
