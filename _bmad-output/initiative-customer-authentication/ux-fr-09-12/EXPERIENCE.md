---
name: Policy Endorsement Assistant
status: final
updated: 2026-11-23
---

# Customer Proposal Experience — Behavior Contract

## Foundation
Responsive customer web flow using the existing Next.js App Router, TanStack Query, and shadcn/ui conventions. [DESIGN.md](DESIGN.md) owns visual decisions. The API owns authorization, assessment, calculation, proposal state, and customer decisions; the browser presents returned values and records the owning customer's choice.

## Information Architecture
| Surface | Reached from | Purpose |
|---|---|---|
| Proposal review | Fresh FR-08 `CAN_PROCEED` result after any required FR-09 calculation | Compare current and proposed policy values, citations, and non-binding boundary; record a decision |
| Customer change history | Customer navigation after sign-in | Review approved synthetic changes belonging to the signed-in customer |

FR-05 rule retrieval and FR-08 assessment remain in the recorded-request flow. FR-09 has no separate calculator screen: its result appears within the proposal review. FR-13 adds no customer-facing surface.

## Voice and Tone
Use short, explicit language: “Proposed premium,” “Unchanged,” “Your decision was recorded,” and “This does not change your policy.” Avoid “approved coverage,” “policy updated,” “issued,” and “human review” unless explaining that no such step is part of this prototype.

## Component Patterns
- **Value comparison:** show current and proposed values with units. For unaffected values write “Unchanged.” Address and beneficiary changes do not call the calculator; payment frequency shows changed payment amount/schedule and unchanged covered benefit; rider add/remove shows applicable premium and rider-benefit values returned by the calculator.
- **Evidence:** list policy wording and endorsement rule citations, including versions and sections, as returned by the assessment. Never fabricate citations or imply the source binds coverage.
- **Decision:** only the owning customer can act. Approve records `APPROVED`; reject records `REJECTED`. Reject opens a confirmation step; approve uses a direct action with a clear final label. After success, replace controls with a dated recorded-decision summary.
- **History:** include only approved changes in customer history; show change, policy, decision and time. Rejection is recorded in the request view, not as an applied change.

## State Patterns
| State | Behavior |
|---|---|
| Loading proposal | Keep request context visible and name the work: “Preparing your proposal…” |
| Proposal ready | Show comparison, citations, status, decision actions, and non-binding notice |
| Unchanged fields | Explicitly label each unaffected premium or benefit as “Unchanged”; do not show a fabricated calculation |
| Calculator failure | Explain that the proposal could not be prepared and can be retried; do not show zero or create a proposal |
| Decision saving | Disable both actions, retain the chosen label, and announce “Recording your decision…” |
| Decision recorded | Show approved/rejected label and time; never show that live policy values changed |
| Decision failure | Keep proposal and choice available, explain the decision was not recorded, and allow retry |
| No history | Explain that approved changes will appear here; link to the customer's policies |
| History service failure | Explain that history could not load and provide retry; do not show an empty state |
| Session expired / unavailable record | Return to sign-in or show a non-disclosing unavailable message; never reveal another customer's records |

## Interaction Primitives
- Decision controls follow the comparison and non-binding notice in keyboard and reading order.
- Reject confirmation states that rejection records a decision and does not change the policy; Cancel returns focus to Reject.
- A completed decision is announced through a polite live region. Service failures use an alert and preserve context.
- History detail is reachable by keyboard and announced with policy and decision context.

## Accessibility Floor
Use semantic headings, definition lists for policy values, real buttons, visible focus indicators, and text labels paired with every status. Preserve logical focus after dialog close and after decision completion. Citations wrap on narrow screens. Meet WCAG 2.2 AA and respect reduced-motion preferences.

## Key Flows
### Flow 1 — Narin reviews a payment-frequency proposal
1. Narin submits a payment-frequency request on an active synthetic policy and sees the fresh `CAN_PROCEED` assessment.
2. The API returns calculator values. The proposal page shows current monthly and proposed quarterly payment amounts, the returned premium difference, and covered benefit marked “Unchanged.”
3. Narin reads policy and rule citations and the non-binding notice.
4. **Climax:** Narin selects Approve proposal; the app records `APPROVED` and shows the decision time. Her policy remains unchanged.

### Flow 2 — Mali rejects a rider proposal
1. Mali reviews returned rider premium and benefit values alongside current policy values.
2. She selects Reject proposal. A confirmation explains that rejection records her decision and does not change coverage.
3. Mali confirms; the proposal shows `REJECTED` and its time, without an approval or issuance step.

### Flow 3 — Narin checks her change history
1. Narin opens Customer change history after sign-in.
2. The page lists her approved address and payment-frequency changes with policy, proposed change, decision, and date.
3. **Climax:** Narin opens a record and sees the proposal and recorded decision, with a reminder that the underlying policy was not changed.

The [proposal review](../../../design/page/proposal-review.html) and [history](../../../design/page/change-history.html) mockups demonstrate the key surfaces. The FR-09–FR-12 tickets own the requirements.
