# Customer UI redesign — agent handoff

**Status:** FR-15 reference UX ready for customer review

**Owner:** UX / PO handoff

**Tracking record:** This file until a reviewed ticket and GitHub Issue exist
**Last updated:** 2026-11-25

**BMad initiative:** [`initiative-customer-ui-redesign`](../_bmad-output/initiative-customer-ui-redesign/initiative-customer-ui-redesign.md)

## Objective

Redesign the existing customer screens so people can quickly understand their synthetic policy, see what an endorsement request would change, and make an informed non-binding decision. Focus on data presentation and layout. Use atomic design to define reusable parts. Keep the running app's shadcn/ui preset `b51GFh7y6`, Public Sans, and semantic colors from [`apps/web/src/app/styles.css`](../apps/web/src/app/styles.css). Use [`design/page/shadcn-theme-preview.html`](../design/page/shadcn-theme-preview.html) as a theme reference, not as a complete data-layout specification.

## Starting evidence

- Read the [screen-by-screen audit](UX_DESIGN_AUDIT.md) first. Its proposals are hypotheses for customer review, not accepted requirements.
- Review the current screens in `apps/web/src/` and their mockups in `design/page/`. The older mockups use `design/global.css` with Inter and purple, which differs from the runtime theme.
- Read [design standards](DESIGN_STANDARD.md), [visual constraints](VISUAL_UX_CONSTRAINTS.md), the [shadcn theme contract](../_bmad-output/initiative-pea-001-policy-list-and-detail/ux-chore-shadcn-preset/DESIGN.md), and affected UX contracts before changing a screen.
- Use synthetic data only. Approval records a decision; it does not update a policy or bind coverage.

## Work sequence and progress

Update a checkbox only when its evidence is linked below. Record dates, decisions, blockers, and the next action in the progress log before handing the task to another agent.

| Step | Status | Completion evidence |
| --- | --- | --- |
| Audit all current customer screens and identify layout/data problems | Done | [Screen-by-screen audit](UX_DESIGN_AUDIT.md) |
| Define customer UI redesign initiative requirements | Done | [Initiative requirements](../_bmad-output/initiative-customer-ui-redesign/initiative-customer-ui-redesign.md) |
| Draft ordered FR tickets for the redesigned screens | Done | [FR-15–FR-18 backlog order](backlog/README.md) |
| Keep FR-15 as a refined backlog draft | Done | [FR-15 draft](backlog/fr-15-redesign-policy-detail-and-proposal-review.md) |
| Confirm the lead customer question and any constraints with the user | Done | Decision in progress log |
| Create a theme-aligned atomic inventory: atoms, molecules, organisms, templates | Done | [FR-15 visual contract](../_bmad-output/initiative-customer-ui-redesign/ux-fr-15/DESIGN.md#components) and [experience contract](../_bmad-output/initiative-customer-ui-redesign/ux-fr-15/EXPERIENCE.md#component-patterns) |
| Mock policy detail and proposal review at desktop and 320px mobile widths | Done | [Policy detail](../design/page/fr-15-policy-detail.html), [proposal review](../design/page/fr-15-proposal-review.html), [mockup index](../design/page/index.html), and [four captures linked from DESIGN.md](../_bmad-output/initiative-customer-ui-redesign/ux-fr-15/DESIGN.md#layout--spacing) |
| Review the two reference screens with the user and record accepted changes | Open | Dated decision in progress log |
| Extend the accepted patterns to sign-in, policies, request, eligibility, evidence, and history | Open | Browser-viewable mockups and state coverage |
| Reconcile `DESIGN.md`, `EXPERIENCE.md`, affected tickets, and mockups | FR-15 done; later screens open | [FR-15 backlog references](backlog/fr-15-redesign-policy-detail-and-proposal-review.md#ux-handoff-references), [UX run](../_bmad-output/initiative-customer-ui-redesign/ux-fr-15/ux-fr-15.md) |
| Validate keyboard access, readable amounts, mobile layout, and non-binding language | FR-15 review done; implementation check open | [Validation report](../_bmad-output/initiative-customer-ui-redesign/ux-fr-15/validation-report.md) |
| Prepare the reviewed ticket/UX PR, then create or reuse its Issue after merge | Open | PR and Issue links; follow [ticket workflow](TICKETING.md#ticket-creation-flow) |

## Screen acceptance checklist

- [ ] **Sign-in:** A clear first action, compact context, and visible synthetic boundary at wide and narrow widths.
- [ ] **Policies:** Each authorized policy can be identified and distinguished without opening every record; expired and unresolved values are labeled accurately. Any new list facts have an agreed API source.
- [ ] **Policy detail and evidence:** Status, term, coverage, beneficiaries, and request availability are easy to scan. Each sourced fact has a visible reference; full citations and unresolved explanations remain accessible.
- [ ] **Request and eligibility:** Current and requested values are clear for each change type. A recorded request is visibly distinct from an eligibility result. Beneficiary allocations show exact percentages and total. All eligibility outcomes give a reason and next action.
- [ ] **Proposal and history:** Current/proposed values align field by field with exact server-provided amounts and units. Changed and unchanged fields are distinguishable without color alone. Pending, approved, and rejected states are distinct. Approval and history clearly remain non-binding.

## Design boundaries

- Use purpose-built policy layouts and shadcn/ui primitives. Keep flat surfaces, restrained rose accents, semantic status labels, and Public Sans. The source of theme values is the runtime stylesheet.
- Use a chart only where it improves a defined comparison. A labeled 100% allocation bar may help beneficiary entry. Use exact comparison rows for money, schedules, and benefits; never imply unlike benefit types are directly comparable.
- Preserve loading, empty, error, expired, unresolved, pending, approved, and rejected states where applicable. Design at 320px width without horizontal scrolling.
- Do not calculate eligibility, premiums, or benefits in the browser. Do not display a proposed policy as issued coverage.

## Decisions and open questions

The customer chose **“What would this request change and cost?”** on 2026-11-25. Keep current coverage accessible as the baseline for comparison. FR-16's policy-list data-source decision remains open.

## Progress log

| Date | Agent | Progress or decision | Next action / blocker | Evidence |
| --- | --- | --- | --- | --- |
| 2026-11-25 | Sally / UX | Completed code-and-mockup audit and created this handoff. No redesign mockups or UX contract changes have been accepted yet. | Confirm the lead customer question; then design policy detail and proposal review. | [Audit](UX_DESIGN_AUDIT.md) |
| 2026-11-25 | BMad | Created and activated the Customer UI Redesign initiative. | Sofia to define the initiative scope and ticket plan; confirm the lead customer question. | [Initiative](../_bmad-output/initiative-customer-ui-redesign/initiative-customer-ui-redesign.md) |
| 2026-11-25 | Sofia / PO | Derived nine customer UI requirements and five constraints from the handoff and PRD; kept the audit layouts as unapproved options. | Confirm the lead question and policy-list data scope, then agree the epic split. | [Requirements](../_bmad-output/initiative-customer-ui-redesign/initiative-customer-ui-redesign.md) |
| 2026-11-25 | Sofia / PO | Drafted FR-15–FR-18 in build order. FR-15 owns the first policy-detail and proposal-review reference layouts; later tickets apply accepted patterns. | Select FR-15 for the local ticket, then run `bmad-ux` from its requirements. | [Backlog](backlog/README.md) |
| 2026-11-25 | Sofia / PO | Moved FR-15 to `docs/tickets/` and refined quote, unresolved-evidence, and authorization criteria. | The user subsequently returned FR-15 to the backlog. | [FR-15 draft](backlog/fr-15-redesign-policy-detail-and-proposal-review.md) |
| 2026-11-25 | BMad | Returned FR-15 to `docs/backlog/` at the user's request and kept its refined criteria. | Resume ticket selection when the user is ready; no ticket/UX PR or Issue is pending. | [FR-15 draft](backlog/fr-15-redesign-policy-detail-and-proposal-review.md) |
| 2026-11-25 | Customer / UX | Chose “What would this request change and cost?” as the lead FR-15 question. | Draft the reference UX contracts and responsive mockups; retain coverage and source access. | [UX run](../_bmad-output/initiative-customer-ui-redesign/ux-fr-15/ux-fr-15.md) |
| 2026-11-25 | UX | Drafted FR-15 visual and experience contracts from the backlog criteria and shadcn theme. Customer review of layout assumptions is pending. | Complete responsive mockups and rubric/accessibility reviews; record findings here. | [FR-15 UX run](../_bmad-output/initiative-customer-ui-redesign/ux-fr-15/ux-fr-15.md) |
| 2026-11-25 | UX | Completed FR-15 policy detail and proposal reference pages at desktop and 320px, linked exact synthetic sources and server quote values, and resolved rubric/accessibility findings. Headless Edge found no horizontal overflow at either width. | Customer to review the proposed layout assumptions; then Sofia can reconcile the accepted UX into FR-15 when it leaves the backlog. Screen-reader behavior remains an implementation check. | [UX run](../_bmad-output/initiative-customer-ui-redesign/ux-fr-15/ux-fr-15.md), [validation](../_bmad-output/initiative-customer-ui-redesign/ux-fr-15/validation-report.md) |
| 2026-11-25 | BMad customization | Added team guidance for Sofia, Sally, and `bmad-ux` that distinguishes completed UX work from customer acceptance and delivery selection; project guidance now gives the same rule to the BMad router. | Customer review of the FR-15 reference layouts remains pending. | [Merged PR #150](https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/pull/150), [ticket workflow](TICKETING.md) |

## Copy-ready instruction for the next agent

> Continue `docs/UX_REDESIGN_HANDOFF.md` from its current status. Review the FR-15 visual and experience contracts and the policy-detail and proposal-review reference mockups at desktop and 320px. Record the customer's accepted changes before extending the patterns to other screens. Keep all synthetic, citation, unresolved, and non-binding boundaries. Update this handoff's progress table and log with links and blockers before stopping. Follow `docs/TICKETING.md` before creating a GitHub Issue or implementation ticket.
