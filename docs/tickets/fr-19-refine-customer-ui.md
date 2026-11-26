# FR-19 — Refine Customer UI

**Title:** [Story] Make policy navigation and request review clearer
**Labels:** `type:story`, `role:dev`, `role:ux`
**GitHub Issue:** https://github.com/Capco-Thailand/i02-policy-endorsement-assistant-agent/issues/168
**Feature ID:** FR-19
**Product context:** [PRD](../PRD.md)
**Risk:** Medium — removing visible evidence and prototype labels could obscure the non-binding boundary.
**State:** Selected; UX handoff ready for ticket/UX PR

## Summary and objective

Refine the existing customer screens without changing policy, request, assessment, quote, or decision behavior. Source: customer request, 2026-11-26.

## User story or requirement

As a customer, I want clear navigation, a consistent red brand mark, and focused request and proposal screens so I can understand what happened and what to do next.

## Business or technical context

FR-16 owns the policy list, FR-17 the request and assessment, FR-15 the proposal review, and FR-18 the decision history. Keep the synthetic, non-binding product boundary visible in plain language near consequential actions even when decorative “Synthetic” labels are removed. Hide source detail from the customer UI, not from server records or audit data.

## Acceptance criteria

- [ ] Place a keyboard-accessible Change history button by the Policies page heading, outside the top navigation; it opens the existing authorized `/history` route and remains discoverable at 320px.
- [ ] Keep the existing FR-16 policy-row layout and the runtime status badge colors: success tint and dot for Active, warning tint and dot for Expired; preserve text labels and the View policy arrow icon.
- [ ] Replace the PE/PEA brand mark with a consistent red mark using the app’s existing primary red, across signed-in screens and sign-in. Preserve an accessible text name and legible contrast.
- [ ] Remove decorative “Synthetic” labels from customer-facing headings, badges, and brand subtitles; remove the specified policy-detail notice and the synthetic-policy notice below the Policies list. Do not alter synthetic values returned as policy facts.
- [ ] Hide the “Available sources” block in assessment and the “Assessment and sources” block in proposal review. Keep outcome, reasons, next step, premium and benefit impact, and any required non-binding notice visible. Retain source citations in the API/audit contract.
- [ ] Redesign request recorded state with a prominent confirmation, request ID, requested change summary, effective date, clear pending-check status, and primary next action to check eligibility. Make clear recording did not approve or change coverage.
- [ ] Redesign proposal review with a clear pending/recorded decision state, current-versus-proposed values, annualized cost comparison when applicable, benefit differences, and approve/reject controls. Remove the specified non-binding proposal notice from the review screen; preserve non-binding decision semantics in behavior and required decision messaging.
- [ ] Loading, empty, error, approved/rejected, and narrow-screen states keep usable navigation, understandable status text, visible focus, and no horizontal overflow.

## Scope and out of scope

In scope: customer-facing layout, branding, navigation, and wording on the named screens.

Out of scope: API responses, evidence retrieval, authorization, quote calculation, proposal decisions, audit retention, and policy writes.

## Dependencies

Build on the existing FR-15 to FR-18 UX contracts. The FR-19 layout and theme were reviewed through PR #166 and the customer's subsequent revisions.

## Related subtasks

None proposed.

## Accepted decisions and readiness

- 2026-11-26: Customer requested these five UI changes and asked for a backlog draft with UX/UI to review.
- 2026-11-26: Customer said the layouts look acceptable and asked that the previews follow the shadcn theme used by the FR-16 sign-in screen. The previews now import the FR-15 token sheet also used by FR-16. This is a theme revision, not a selection for delivery.
- 2026-11-26: Customer chose a Change history button outside top navigation, required Active/Expired status labels, removed the Policies synthetic notice, and requested more space below back links.
- 2026-11-26: Customer asked to restore the arrow icons with correct characters and reuse the current FR-16 policy status badge design. The history fetch bug is a separate FR-20 backlog draft.
- 2026-11-26: Customer requested removal of the specified policy-detail and proposal-review notices and asked that Active/Expired badges use the current runtime success/warning colors.
- 2026-11-26: Customer invoked `bmad do fr-19`, selecting FR-19 for delivery with the revised UX handoff. Ticket/UX PR merge and Issue creation remain before implementation.
- Assumption for review: use a red square monogram for the brand mark. Retain non-binding notices at request and proposal actions.
- Readiness: selected; ticket/UX PR and tracking Issue pending.

## UX handoff references

- [Visual contract](../../_bmad-output/initiative-customer-ui-redesign/ux-fr-19/DESIGN.md) and [experience contract](../../_bmad-output/initiative-customer-ui-redesign/ux-fr-19/EXPERIENCE.md).
- Browser previews: [policy navigation](../../design/page/fr-19-policy-navigation.html), [request recorded](../../design/page/fr-19-request-recorded.html), [proposal review](../../design/page/fr-19-proposal-review.html).

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable accessibility and browser checks completed
- [ ] Relevant documentation updated
- [ ] Code review and CI checks passed, if applicable
- [ ] Related Issue and PR linked after selection
- [ ] No unresolved blockers
