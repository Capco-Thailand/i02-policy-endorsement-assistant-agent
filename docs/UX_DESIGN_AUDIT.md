# Customer UI design audit and proposed direction

_25 November 2026 · Review of the implemented web screens and `design/page/` mockups. This is a design proposal, not an approved replacement for existing UX contracts._

Execution tracker: [customer UI redesign agent handoff](UX_REDESIGN_HANDOFF.md).

## Diagnosis

The screens are technically legible, but they make customers read too much before they can answer three questions: **What do I have? What would change? What happens next?** Policy facts, coverage, sources, decisions, and prototype disclosures receive similar visual weight. The app also mixes large empty areas with dense text blocks. The proposal screen asks customers to compare two separate columns by memory, especially after those columns stack on mobile.

The design handoff is visually split. `apps/web/src/app/styles.css` uses the shadcn rose semantic tokens and Public Sans, but most standalone mockups use `design/global.css` with Inter and a fixed purple palette. `design/page/shadcn-theme-preview.html` previews the newer theme without demonstrating the full data-heavy screens. Future mockups should use a theme-aligned preview stylesheet so reviewers judge the intended product appearance.

## Screen-by-screen critique and redesign

| Surface | Current issue | Proposed layout and data treatment |
| --- | --- | --- |
| Sign in | The large introductory column and repeated “demo” messages consume more attention than the sign-in task. The connection to the later policy journey is weak. | Keep the two-column layout on wide screens, but shorten the copy to one promise and one prototype boundary. Align the form vertically with the headline. On mobile, place the form immediately after a short heading. |
| Your policies | Cards show only name, ID, and status. Customers cannot distinguish policies by coverage, term, or payment schedule, so every card requires a visit. The two-column grid wastes horizontal space when there are only one or two records. | Use a compact, single-column **policy row** per record: name and status first; policy ID, effective term, payment frequency, and one primary benefit as aligned facts when those fields are confirmed. Keep the whole row link, with a clear “View policy” label. Expired policies show historical values and an “expired” label. The list API currently supplies only name, ID, and status, so richer rows need an authorized summary response. Do not guess missing values. |
| Policy detail and coverage | Product, coverage, exclusions, policy dates, beneficiaries, and evidence form a long stack of near-identical sections. Citations interrupt scanning. The request action appears only after all content. | Begin with a **policy snapshot**: status, term, payment schedule, primary benefit, and the request action for active policies. Below it, use clear sections for Coverage, Beneficiaries, Terms and limitations, and Sources. Show benefit amounts in an aligned list with currency and source reference. Keep exclusions visible as plain language; give each fact a visible source reference linking to the full citation lower on the page. An unresolved fact occupies its own row with an explanation, never an invented amount. |
| Policy evidence preview | The separate mockup repeats the policy heading and facts, while the running app embeds evidence in policy detail. Source metadata competes with the excerpt and the customer question is fixed. | Treat evidence as a supporting panel within policy detail, linked from each relevant fact. Lead with the answer or unresolved state, then show the excerpt and source title; put version and section in secondary text. Keep the source facts distinct from the authoritative policy record. Retire the separate preview as a customer screen unless a standalone evidence journey is required. |
| Change request | A single selector opens different forms inside one undifferentiated panel. The customer sees no current value beside the requested value. After submit, eligibility appears inside the confirmation panel, making “recorded” and “eligible” easy to conflate. | Use a short sequence: **Choose change → Enter proposed value → Review request → Record**. Once a type is chosen, show its current value where available beside the input. For beneficiaries, display each person's percentage and a labeled 100% allocation bar; show the numeric total and any remaining/over amount. After recording, show a separate request summary and an explicit “Check eligibility” next action. |
| Eligibility | Outcome, reasons, source IDs, citations, and the next action live in one text-heavy box. “Can proceed” is visually small relative to evidence details. | Lead with one outcome headline and one plain-language reason. Place the next action immediately after it. List reasons as short rows and put cited policy/rule passages in a secondary “Why this result?” section. Show “Needs review” as a blocked process state; never imply eligibility from color alone. |
| Proposal review and decision | Current and proposed values are in separate cards; customers must match rows across columns and compare them again when stacked. Changed and unchanged fields have nearly equal weight. Pending, approved, and rejected proposals all use the same active-style badge. The non-binding explanation arrives after the data. | Put the non-binding boundary directly under the title. Use a **field-by-field comparison table** with columns “Current”, “Proposed”, and “Difference”; highlight changed rows with text and a subtle semantic border. When the server quote changes, place its annual payment difference above the table as a prominent exact number, with per-installment and frequency nearby. Keep benefits in their own rows and mark unchanged values. On mobile, each field becomes one stacked comparison row, preserving current/proposed labels. Use distinct text-labeled status treatments for pending, approved, and rejected. Keep decision actions after the comparison and boundary. |
| Change history | Long change descriptions and right-aligned metadata are hard to scan. The page calls approved records “changes”, which can sound like the policy was updated. There is no quick way to identify which policy a record belongs to. | Title the section **Recorded decisions**. Each row starts with decision date and policy, then a concise request summary and status. Group by policy only if records grow enough to justify it; otherwise use a chronological list. Link to the exact proposal and repeat the non-binding meaning near the list heading. Avoid showing full address or beneficiary details in the overview. |

## Proposed information hierarchy

1. **Answer first:** status, key value, or decision at the top of each screen.
2. **Comparison second:** show current and proposed values together at the field level, with exact numeric differences when the server supplies them.
3. **Evidence third:** keep source title and the relevant passage accessible from the fact or decision it supports. Preserve all citations and unresolved states.
4. **Next action fourth:** place one clear action beside the decision it follows. Keep supporting actions secondary.
5. **Boundary always visible:** every approval or history view states that the synthetic proposal does not update policy or coverage.

### Visualization rules

Use a chart only when it answers a real comparison question. A 100% stacked allocation bar helps customers check beneficiary totals; it must also display names and numeric percentages. A comparison table is better than a chart for premium, frequency, and benefits because exact values and units matter. Do not draw bars that imply different coverage types are interchangeable or that a proposed benefit is already active. Use tabular numerals, right-aligned amounts, explicit THB units, and “unchanged” text. Never use rose alone to mean increase, decrease, approval, or risk. The existing `--chart-*` tokens can support a chart if a validated comparison warrants one; they are not a reason to add charts.

## Atomic design map

| Level | Reusable UI responsibility | shadcn/ui and theme use |
| --- | --- | --- |
| Atoms | Value, label, unit, status text, source link, delta indicator, focusable action | Public Sans, tabular numerals, semantic `--foreground`, `--muted-foreground`, `--primary`, status tokens; shadcn Button, Badge, Label, Input |
| Molecules | Labeled fact, money value with period, status badge, source reference, current/proposed value pair, allocation row, validation message | Compose shadcn Field, Alert, Separator and Badge; one meaning per molecule |
| Organisms | Policy snapshot, coverage list, beneficiary allocation, request editor, eligibility result, proposal comparison, decision history list | Purpose-built semantic structures using shadcn primitives; no generic dashboard card grid |
| Templates | Account list, policy detail, request sequence, proposal decision, history | Consistent page heading, reading width, action placement, responsive comparison rules |
| Pages | Sign in, policies, policy detail, request, proposal, history and their loading/error/empty states | Populate templates with authorized synthetic data; preserve route-specific state and copy |

## Theme and implementation guardrails

- Keep preset `b51GFh7y6`, Public Sans, Base UI, and the semantic values in `apps/web/src/app/styles.css`. Use the existing rose primary for actions and focus, not as a data heat map. Use existing success and warning tokens only with text labels.
- Build a theme-aligned mockup stylesheet from those semantic tokens. The old purple/Inter `design/global.css` should not be used to judge new screens. Update the existing UX contracts and mockups together when a direction is accepted; the current shadcn handoff explicitly retains layouts this proposal would change.
- Target a comfortable single reading column for dense detail, with narrower subcolumns only for aligned comparisons. On small screens, keep labels attached to their values and avoid horizontal scrolling.
- Preserve the server boundary: the UI displays quote and eligibility results; it does not calculate premiums, decide eligibility, or suggest that approval binds coverage.

## Suggested first design slice

Mock **policy detail and proposal review** with the same synthetic policy at desktop and 320px mobile width. These two screens test the hardest data layout: current coverage, sourced facts, exact before/after values, unresolved data, and the non-binding decision. Review those with customers before carrying the component patterns into the request, policy list, eligibility, and history screens.

## Decision to confirm

Which customer question should lead the redesign: **“What does my policy cover?”** or **“What would this request change and cost?”** The answer sets the order and emphasis of the first screen and the first mockup.
