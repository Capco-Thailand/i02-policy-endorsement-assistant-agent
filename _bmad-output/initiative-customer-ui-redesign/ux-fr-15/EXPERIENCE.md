---
name: FR-15 customer UI redesign experience
status: final
updated: 2026-11-25
sources:
  - docs/backlog/fr-15-redesign-policy-detail-and-proposal-review.md
---

# FR-15 experience contract

## Foundation

This is responsive web for authenticated customers using synthetic demo policies. It inherits shadcn/ui and Base UI behavior from the running app. [DESIGN.md](DESIGN.md) owns visual identity and tokens; this file owns information order, interactions, and states. The chosen lead question is **“What would this request change and cost?”** Policy detail establishes the current baseline; proposal review answers the change and cost question. The reference scope is policy detail and proposal review, with desktop and 320px views of the same synthetic policy.

## Information Architecture

| Surface | Reached from | Customer answer and next action |
| --- | --- | --- |
| Policy detail | Authorized policy list | “What do I currently have?” Status, term, coverage, beneficiaries, limitations, and sourced evidence; an active policy can start a request. |
| Proposal review | Eligible request and proposal preparation, or authorized history link | “What would this request change and cost?” Exact current/proposed values, changed/unchanged meaning, assessment sources, then approve or reject when pending. |
| Source anchor within policy detail | Visible source reference beside a fact | Full source title, version, section, excerpt, and unresolved explanation when applicable. |

[ASSUMPTION] Policy detail may use a compact top snapshot and anchored source section; proposal review may use field-by-field comparison rows. These are audit hypotheses pending review of the mockups. The [policy detail](../../../design/page/fr-15-policy-detail.html) and [proposal review](../../../design/page/fr-15-proposal-review.html) mockups demonstrate the composition. The spines win on conflict.

## Voice and Tone

Use short, literal customer language. Brand posture lives in `DESIGN.md`.

| Use | Avoid |
| --- | --- |
| “Current policy” and “Proposed change” | “Updated policy” when nothing has been issued. |
| “THB 1,215.00 per monthly payment” when the seeded server quote returns that value | “About 1K” or an unlabeled number. |
| “Unchanged” and “Changed” beside each field | Color-only change indicators. |
| “We could not confirm this amount from the cited policy wording.” | A blank value or a guessed amount. |
| “Approval records your decision. It does not change your policy or coverage.” | “Your coverage has been updated.” |

## Component Patterns

Visual anatomy and tokens live in `DESIGN.md.Components`.

| Component | Behavior |
| --- | --- |
| Policy Snapshot | Reads from the owner-authorized policy response; shows status and term before detail. The request action exists only for active policies. |
| Sourced Fact | Shows its value and a focusable Source Link when available. The fact remains readable without opening it. |
| Unresolved Fact | Shows the unresolved reason and available citation; never substitutes a fabricated insurer, benefit, amount, or exclusion. |
| Proposal Field Comparison | Keeps one field's current and proposed values together; includes unit/period and a text change state. No client calculation. |
| Quote Summary | Shows returned installment amount, frequency, annualized scheduled total, and applicable benefits. “Unchanged” is explicit when the impact response is unchanged. |
| Decision Area | Shows the non-binding boundary before approval/rejection controls. Only a pending authorized proposal permits a decision; decided proposals show recorded status and time. |
| Source Link | Navigates to a full citation and moves focus to the cited section; if evidence is unavailable, show a reason in place of a broken link. |
| Status Label | States active, expired, pending, approved, rejected, or unresolved in text; color is supplementary. |

## State Patterns

| State | Policy detail | Proposal review |
| --- | --- | --- |
| Loading | Name the policy detail being loaded; preserve a meaningful heading. | Name the proposal being loaded; no decision controls yet. |
| Error or unavailable | Explain that detail could not load and offer retry when appropriate. | Explain that proposal could not load and offer retry when appropriate. |
| Session ended | Redirect to sign-in through the existing session boundary. | Same boundary; no proposal data remains visible. |
| Unknown or unowned | Use the same non-disclosing unavailable state. | Use the same non-disclosing unavailable state. |
| Active policy | Display current facts and request action. | N/A. |
| Expired policy | Label amounts as historical where needed; no request action. | N/A. |
| Missing, stale, or conflicting evidence | Show unresolved fact and reason with available citation. | Do not invent a quote or advance to decision if required evidence is unresolved. |
| Missing citation | Keep the policy fact only when the authorized record supports it; label its source unavailable and explain the gap. | Keep the assessment evidence unresolved; no broken source link or fabricated excerpt. |
| Missing proposal or quote | N/A. | Show a non-disclosing unavailable page for a missing or unowned proposal. For a present proposal with no quote, explain that impact is unavailable and show no client-calculated amount or decision control. |
| Pending | N/A. | Exact comparison and assessment evidence; approve/reject controls after non-binding notice. |
| Approved or rejected | N/A. | Recorded status and decision time; no repeat decision controls. Underlying policy remains unchanged. |
| Unchanged impact | N/A. | Say premium, schedule, annualized total, and benefits are unchanged where returned as such. |

## Interaction Primitives

- Evidence references are ordinary focusable anchors. They move to the relevant citation without hiding the source behind hover.
- Reading and tab order follow the visible order: heading, baseline or summary, comparison/evidence, boundary, then action. At 320px each field's current and proposed values remain adjacent within one comparison group.
- Keep existing decision submission, confirmation, and focus behavior from FR-11. This redesign changes presentation, not approval semantics.
- Do not calculate eligibility, premium, benefits, or new numeric differences in the browser. Display only authorized policy and server-returned proposal values.

## Accessibility Floor

- Every status and change state has visible text in addition to color. Focus rings use `{colors.primary}` and remain visible against `{colors.background}`.
- Labels stay programmatically tied to values and controls. Amounts include currency and period in nearby readable text, not only in a column heading that disappears on mobile.
- Keyboard users reach source references, navigation, and decision controls in reading order; a decided proposal has no hidden actionable decision controls.
- At 320px, no horizontal scrolling or clipped amounts, identifiers, citations, or buttons. Long source metadata wraps without breaking the reading order.
- Error, unresolved, and non-binding messages use semantic text and appropriate live or alert treatment where a state changes after interaction.

## Responsive & Platform

| Width | Behavior |
| --- | --- |
| Desktop | Keep a comfortable single reading column. Comparison rows may align field name, current, proposed, and change state as subcolumns. |
| 320px | Stack values within each field row while repeating “Current” and “Proposed” labels; amounts wrap as needed. Retain `{spacing.page-mobile}` outer padding from `DESIGN.md`. |

No separate mobile product or alternate data set is implied; both widths present the same authorized facts. The [policy desktop](mockups/policy-detail-desktop.png), [policy 320px](mockups/policy-detail-mobile-320.png), [proposal desktop](mockups/proposal-review-desktop.png), and [proposal 320px](mockups/proposal-review-mobile-320.png) captures show the intended order; the browser-viewable `design/page/` references remain canonical.

## Inspiration & Anti-patterns

The [screen audit](../../../docs/UX_DESIGN_AUDIT.md) identifies the current two-column proposal as a memory burden and offers field comparison and sourced snapshot layouts. Those layouts remain `[ASSUMPTION]` until the user reviews the reference mockups. Avoid generic dashboard grids, decorative charts, and the legacy purple/Inter mockup palette.

## Key Flows

### Narin checks a proposed payment change

1. Narin signs in with a synthetic account and opens `POL-NARIN-001` from the authorized list.
2. On policy detail, Narin sees current status and sourced coverage, then starts a supported change request. FR-15 does not change the request and eligibility steps.
3. After the server accepts the request and produces a proposal, Narin opens proposal review. The non-binding notice and change/cost summary appear before decision controls.
4. Narin reads exact current and proposed installment amounts, frequency, annualized scheduled total, and benefits by field; unchanged fields say so.
5. **Climax:** Narin can state what the request changes and what it costs, then records an approval or rejection knowing the underlying policy stays unchanged.
6. If the proposal is already decided, Narin sees recorded status and time instead of another decision action.

Failure path: an unavailable quote or unresolved required evidence shows its reason and available citation; Narin cannot be led to a fabricated amount or approval control.

### Narin checks a disputed coverage fact

1. Narin opens the same authorized policy detail.
2. A coverage fact is marked unresolved because its versioned evidence is missing, stale, or conflicting.
3. Narin follows the visible source reference to available title, version, section, and excerpt.
4. **Climax:** Narin distinguishes confirmed policy facts from the unresolved fact without treating an estimate as coverage.

Expired variant: when Narin opens the seeded expired policy, historical values remain readable and the request action is absent.

### State transitions after review

| Starting state | Visible next step |
| --- | --- |
| Expired policy | Narin can inspect historical facts and citations, then return to the policy list; no request action is offered. |
| Approved proposal | Narin can inspect the recorded decision and return to the unchanged policy or history; no repeat approval control appears. |
| Rejected proposal | Narin can inspect the recorded decision and return to the unchanged policy or history; no repeat rejection control appears. |
